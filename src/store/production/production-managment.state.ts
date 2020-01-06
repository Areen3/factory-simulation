import { Injectable, Type } from '@angular/core';
import * as fromNGXS from '@ngxs/store';
import { append, patch } from '@ngxs/store/operators';
import { combineLatest, merge, Observable, of } from 'rxjs';
import { filter, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { getStateNameForDepartament, getStateNameForLine } from 'src/model/utils/store';

import * as fromModel from '../../model';
import { BaseState } from '../base';
import { TickGeneratorState } from '../tick-generator';
import { DepartamentState } from './departament.state';
import { initialProductionMenagmentDataModel } from './init-production-managment';
import { EWhatShoudDoWithOffer, IDataConfition, IWhatShoudDoWithOffer } from './production-managment.model';
import { findChipestDepartament, getEmptyWhatShoudDoWithOffer, getOrderFromOffer } from './production.utils';
import { ProductState } from '../product/product.state';
import { getLineProduction } from './decorators';
import { BaseLineProductionState } from './base-line.state';
import {
  lineThatTakeThisOffer,
  havePosibilityToRunNewLine,
  havePosibilityToStrtLineAndDepartament,
  haveEnoughCapacityInAnyLine
} from './production-managment.utils';

@fromNGXS.State<fromModel.IProductionManagmentModel>({
  name: fromModel.EStateName.productionManagmentState,
  defaults: initialProductionMenagmentDataModel
})
@Injectable({
  providedIn: 'root'
})
export class ProductionMenagmentState extends BaseState<fromModel.IProductionManagmentModel>
  implements fromNGXS.NgxsOnDestroy, fromNGXS.NgxsOnInit {
  constructor(protected store: fromNGXS.Store, protected actions$: fromNGXS.Actions) {
    super(store);
  }
  @fromNGXS.Selector()
  static containents$(state: fromModel.IProductionManagmentModel): fromModel.TContainentsIndex {
    return state.locationConditions;
  }
  @fromNGXS.Selector()
  static departamentLocalizations$(state: fromModel.IProductionManagmentModel): fromModel.TDepartamentLocalizations {
    return state.departamentLocalizations;
  }
  @fromNGXS.Selector()
  static productionLineDescription$(state: fromModel.IProductionManagmentModel): fromModel.TProductionLineDescription {
    return state.productionLineLocalizations;
  }
  @fromNGXS.Action(fromModel.ProductionAction.AddDepartament)
  addDepartament(ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>, action: fromModel.ProductionAction.AddDepartament): void {
    const state = ctx.getState();
    const currCondition = state.locationConditions[action.payload];
    ctx.patchState({
      locationConditions: {
        ...state.locationConditions,
        [action.payload]: { ...currCondition, openDepartaments: currCondition.openDepartaments + 1 }
      }
    });
  }
  @fromNGXS.Action(fromModel.ProductionAction.RemoveDepartament)
  removeDepartament(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    action: fromModel.ProductionAction.RemoveDepartament
  ): void {
    const state = ctx.getState();
    const currCondition = state.locationConditions[action.payload];
    ctx.patchState({
      locationConditions: {
        ...state.locationConditions,
        [action.payload]: { ...currCondition, openDepartaments: currCondition.openDepartaments - 1 }
      }
    });
  }

  ngxsOnDestory(): void {}
  ngxsOnInit(ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>): void {
    this.runProduction(ctx);
  }
  runProduction(ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>): void {
    const run$: Observable<boolean> = this.store.select(TickGeneratorState.run$);
    run$
      .pipe(
        filter(run => run),
        switchMap(() => this.actions$),
        fromNGXS.ofActionDispatched(fromModel.SaleScheduleAction.NewOfferAdded),
        // switchMap((offer: fromModel.SaleScheduleAction.NewOfferAdded) => prepareDataToProcessNewOffer(ctx, this.store, offer.payload)),
        switchMap((offer: fromModel.SaleScheduleAction.NewOfferAdded) => this.processNewOffer(ctx, offer.payload))
        // switchMap(() => this.takeWaitingOrders(ctx))
      )
      .subscribe(() => {
        // console.log('offer subs: ', item);
      });
  }
  processNewOffer(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    offers: Array<fromModel.IOffer>
  ): Observable<IWhatShoudDoWithOffer> {
    const state = ctx.getState();
    return merge(
      ...offers.map(offer => {
        const data: IDataConfition = {
          lines: state.productionLineLocalizations.filter(line => line.productId === offer.productId),
          dep: state.departamentLocalizations,
          conditions: state.locationConditions
        };
        return merge(
          this.shoudRejectOffer(ctx, offer, data).pipe(switchMap(whatToDo => this.rejectOffer(ctx, whatToDo))),
          this.shoudCreateNewLineWhitExistingDepartament(ctx, offer, data).pipe(
            switchMap(whatToDo => this.createNewLineWhitExistingDepartament(ctx, whatToDo))
          ),
          this.shoudCreateNewDepartamentAndNewLine(offer, data).pipe(
            switchMap(whatToDo => this.createNewDepartamentWhitLine(ctx, whatToDo))
          ),
          this.shoudDoWithExistingLine(offer, data, true).pipe(switchMap(whatToDo => this.doWithExistingLine(ctx, whatToDo)))
        );
      })
    );
  }

  private shoudRejectOffer(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    offer: fromModel.IOffer,
    data: IDataConfition
  ): Observable<IWhatShoudDoWithOffer> {
    const shoudReject = havePosibilityToStrtLineAndDepartament(this.store, offer, data).pipe(
      filter(haveMoney => !haveMoney),
      tap(() => console.log('brak kasy na nowy dep i linie')),
      switchMap(() =>
        haveEnoughCapacityInAnyLine(this.store, offer, data).pipe(
          filter(haveCapacity => !haveCapacity),
          tap(haveCapacity => {
            console.log('brak mozliwosci w liniach', haveCapacity);
          })
        )
      ),
      switchMap(() =>
        havePosibilityToRunNewLine(this.store, ctx, offer, data).pipe(
          filter(result => !result.isPosibility),
          tap(() => console.log('brak możliwości na odpalenie nowej linii'))
        )
      )
    );
    return shoudReject.pipe(
      tap(res => console.log('będzie odrzucenie', res)),
      map((): IWhatShoudDoWithOffer => getEmptyWhatShoudDoWithOffer(offer))
    );
    // const notEnoughMoney = havePosibilityToStrtLineAndDepartament(this.store, offer, data).pipe(
    //   filter(haveMoney => !haveMoney),
    //   tap(() => console.log('brak kasy na nowy dep i linie'))
    // );
    // const noCapacityInAnyLine = haveEnoughCapacityInAnyLine(this.store, offer, data).pipe(
    //   filter(haveCapacity => !haveCapacity),
    //   tap(haveCapacity => {
    //     console.log('brak mozliwosci w liniach', haveCapacity);
    //   })
    // );
    // const noCapacityToRunNewLine = havePosibilityToRunNewLine(this.store, ctx, offer, data).pipe(
    //   filter(result => !result.isPosibility),
    //   tap(() => console.log('brak możliwości na odpalenie nowej linii'))
    // );
    // return concat(notEnoughMoney, noCapacityInAnyLine, noCapacityToRunNewLine).pipe(
    //   tap(res => console.log('będzie odrzucenie', res)),
    //   map((): IWhatShoudDoWithOffer => getEmptyWhatShoudDoWithOffer(offer))
    // );
  }

  private shoudCreateNewLineWhitExistingDepartament(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    offer: fromModel.IOffer,
    data: IDataConfition
  ): Observable<IWhatShoudDoWithOffer> {
    // if (offer.offerId === '44/BMW RT') {
    //   console.log('44');
    // }
    return of(data).pipe(
      map(() => lineThatTakeThisOffer(this.store, offer, this.store.getStateLocationByStateClass(ProductionMenagmentState), data)),
      filter(item => !item.isPosibility),
      switchMap(() =>
        havePosibilityToRunNewLine(this.store, ctx, offer, data).pipe(
          filter(result => result.isPosibility),
          map(
            (result): IWhatShoudDoWithOffer => ({
              ...getEmptyWhatShoudDoWithOffer(offer),
              departementId: result.dep.departamentId,
              localization: result.dep.localization
            })
          )
        )
      )
    );
  }

  private shoudDoWithExistingLine(offer: fromModel.IOffer, data: IDataConfition, canDo: boolean): Observable<IWhatShoudDoWithOffer> {
    // if (offer.offerId === '44/BMW RT') {
    //   console.log('44');
    // }
    return of(data).pipe(
      filter(({ lines }) => lines.length !== 0),
      map(() => lineThatTakeThisOffer(this.store, offer, this.store.getStateLocationByStateClass(ProductionMenagmentState), data)),
      filter(item => item.isPosibility === canDo),
      map(
        (line): IWhatShoudDoWithOffer => ({
          ...getEmptyWhatShoudDoWithOffer(offer),
          lineProductionId: line.lineDescription.lineId,
          localization: line.lineDescription.localization
        })
      )
    );
  }

  private shoudCreateNewDepartamentAndNewLine(offer: fromModel.IOffer, data: IDataConfition): Observable<IWhatShoudDoWithOffer> {
    return of(data).pipe(
      filter(({ lines, dep }) => lines.length === 0 && dep.length === 0),
      switchMap(() => havePosibilityToStrtLineAndDepartament(this.store, offer, data).pipe(filter(haveMoney => haveMoney))),
      switchMapTo(of(true)),
      filter(canRun => canRun),
      map(() => data),
      map(({ lines }): fromModel.ILineDescription => lines[fromModel.getRandomInt(0, lines.length - 1)]),
      map(
        (): IWhatShoudDoWithOffer => ({
          ...getEmptyWhatShoudDoWithOffer(offer),
          whatDo: EWhatShoudDoWithOffer.createNewDepartamentWhitLine
        })
      )
    );
  }

  private rejectOffer(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    whatToDo: IWhatShoudDoWithOffer
  ): Observable<IWhatShoudDoWithOffer> {
    return ctx.dispatch(new fromModel.SaleScheduleAction.RejectOffer([whatToDo.offer.offerId])).pipe(map(() => whatToDo));
  }

  private createNewLineWhitExistingDepartament(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    whatToDo: IWhatShoudDoWithOffer
  ): Observable<IWhatShoudDoWithOffer> {
    const state = ctx.getState();
    const id: number = state.lastLineId + 1;
    ctx.patchState({ lastLineId: id });
    return this.store.select(ProductState.productsArray$).pipe(
      map((products: fromModel.TProductArray) => products.find(item => item.productId === whatToDo.offer.productId)!),
      map(product => ({ product: product, childName: getStateNameForLine(id, product) })),
      map(({ product, childName }) => {
        const stateType: Type<BaseLineProductionState> = getLineProduction(product.productKind);
        this.store.addChildInLocalization(stateType, whatToDo.localization, { childName, context: product.productKind });
        return { product, stateName: childName, location: fromNGXS.SingleLocation.getLocation(whatToDo.localization.path, childName) };
      }),
      switchMap(({ product, stateName, location: localization }) =>
        combineLatest(
          of({ product, stateName, localization }),
          this.store.dispatchInLocation(
            new fromModel.ProductionAction.InitLindeProductionData({
              lineId: stateName,
              productId: product.productId,
              numberOfParallelProduction: product.numberOfParallelProduction,
              departamentId: whatToDo.departementId
            }),
            fromNGXS.SingleLocation.getLocation(localization.path)
          ),
          this.store.dispatch(new fromModel.ProductionAction.AddLine())
        )
      ),
      map(([{ product, stateName, localization }]) => {
        ctx.patchState({
          productionLineLocalizations: [
            ...state.productionLineLocalizations,
            { lineId: stateName, productId: product.productId, localization, departamentId: whatToDo.departementId }
          ]
        });
        return { stateName, localization };
      }),
      switchMap(({ stateName, localization }) =>
        this.doWithExistingLine(ctx, {
          ...whatToDo,
          lineProductionId: stateName,
          localization,
          whatDo: EWhatShoudDoWithOffer.doWithExistingLine
        })
      )
    );
  }

  private doWithExistingLine(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    whatToDo: IWhatShoudDoWithOffer
  ): Observable<IWhatShoudDoWithOffer> {
    // if (whatToDo.offer.offerId === '7/BMW RT') {
    //   console.log('44');
    // }
    return of(whatToDo).pipe(
      switchMap(data => combineLatest([of(data), this.store.select(ProductState.getProduct$).pipe(map(fun => fun(data.offer.productId)))])),
      switchMap(([data, product]) =>
        combineLatest([
          of(data),
          ctx.dispatch([
            new fromModel.SaleScheduleAction.ApproveOffer([data.offer.offerId]),
            new fromModel.SaleScheduleAction.NewOrder({ orders: [getOrderFromOffer(data.offer)], tick: data.offer.tick })
          ]),
          this.store.dispatchInLocation(
            new fromModel.ProductionAction.AddOrderToQueueProduction({ orders: [getOrderFromOffer(data.offer)], product }),
            data.localization
          )
        ])
      ),
      map(([data]) => {
        // console.log(data);
        return data;
      })
    );
  }

  private createNewDepartamentWhitLine(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    whatToDo: IWhatShoudDoWithOffer
  ): Observable<IWhatShoudDoWithOffer> {
    const state = ctx.getState();
    const id: number = state.lastDepartamentId + 1;
    ctx.patchState({ lastDepartamentId: id });
    const depCondition = findChipestDepartament(state.locationConditions);
    const childName = getStateNameForDepartament(id, depCondition.localization);
    const childLocation = fromNGXS.SingleLocation.getLocation(
      this.store.getStateLocationByStateClass(ProductionMenagmentState).path,
      childName
    );
    return of(whatToDo).pipe(
      tap(() => {
        this.store.addChildWithinParent(ProductionMenagmentState, DepartamentState, { childName });
      }),
      switchMap(() => this.store.dispatch([new fromModel.ProductionAction.AddDepartament(depCondition.localization)])),
      switchMap(() => this.store.select(ProductState.productsArray$)),
      map(product => product.find(item => item.productId === whatToDo.offer.productId)),
      switchMap(() =>
        combineLatest(
          this.store.dispatchInLocation(
            new fromModel.ProductionAction.InitDepartamentData({
              continent: depCondition.localization,
              deparamentId: childName,
              employment: 10
            }),
            childLocation
          )
        )
      ),
      map(
        (): fromNGXS.SingleLocation => {
          ctx.setState(
            patch({
              departamentLocalizations: append([{ departamentId: childName, localization: childLocation }])
            })
          );
          return childLocation;
        }
      ),
      switchMap(localization =>
        this.createNewLineWhitExistingDepartament(ctx, {
          ...whatToDo,
          departementId: childName,
          localization: localization,
          whatDo: EWhatShoudDoWithOffer.createNewLineWhitExistingDepartament
        })
      ),
      map(result => result),
      map(() => whatToDo)
    );
  }
}
