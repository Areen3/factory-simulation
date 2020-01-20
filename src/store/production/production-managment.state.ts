import { Injectable, Type } from '@angular/core';
import * as fromNGXS from '@ngxs/store';
import { append, patch } from '@ngxs/store/operators';
import { BehaviorSubject, combineLatest, concat, merge, Observable, of } from 'rxjs';
import { filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { getStateNameForDepartament, getStateNameForLine } from 'src/model/utils/store';
import * as fromModel from '../../model';
import { BaseState } from '../base';
import { ProductState } from '../product/product.state';
import { TickGeneratorState } from '../tick-generator';
import { BaseLineProductionState } from './base-line.state';
import { getLineProduction } from './decorators';
import { DepartamentState } from './departament.state';
import { initialProductionMenagmentDataModel } from './init-production-managment';
import {
  EWhatShoudDoWithOffer,
  IDataConfiguration,
  IDoWithLine,
  IDoWithNewDepartament,
  IDoWithNewLine,
  IWhatShoudDoWithOffer
} from './production-managment.model';
import { havePosibilityToRunNewDepartament, havePosibilityToRunNewLine, lineThatTakeThisOffer } from './production-managment.utils';
import { getEmptyWhatShoudDoWithOffer, getOrderFromOffer } from './production.utils';

@fromNGXS.State<fromModel.IProductionManagmentModel>({
  name: fromModel.EStateName.productionManagmentState,
  defaults: initialProductionMenagmentDataModel
})
@Injectable({
  providedIn: 'root'
})
export class ProductionMenagmentState extends BaseState<fromModel.IProductionManagmentModel>
  implements fromNGXS.NgxsOnDestroy, fromNGXS.NgxsOnInit {
  private inProgressOffer$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(protected store: fromNGXS.Store, protected actions$: fromNGXS.Actions) {
    super(store);
    // this.inProgressOffer$.subscribe(s => console.log('stan procesu: ', s));
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
  static productionLineLocalizations$(state: fromModel.IProductionManagmentModel): fromModel.TProductionLineLocalization {
    return state.productionLineLocalizations;
  }
  @fromNGXS.Action(fromModel.ProductionAction.UpdateContainents)
  updateContainents(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    action: fromModel.ProductionAction.UpdateContainents
  ): void {
    const state = ctx.getState();
    const currContainent = state.locationConditions[action.payload.localization];
    ctx.patchState({
      locationConditions: {
        ...state.locationConditions,
        [action.payload.localization]: { ...currContainent, ...action.payload }
      }
    });
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
    const dep: fromModel.IDepartamentModel = action.payload;
    const currCondition = state.locationConditions[dep.continent];
    const newDeparatmenlocation = state.departamentLocalizations.filter(item => item.departamentId !== dep.departamentId);
    ctx.patchState({
      locationConditions: {
        ...state.locationConditions,
        [dep.continent]: { ...currCondition, openDepartaments: currCondition.openDepartaments - 1 }
      },
      departamentLocalizations: newDeparatmenlocation
    });
  }
  @fromNGXS.Action(fromModel.ProductionAction.UpdateMaxDep)
  updateMaxDep(ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>, action: fromModel.ProductionAction.UpdateMaxDep): void {
    const state = ctx.getState();
    const newConditions: fromModel.TContainentsIndex = Object.values(state.locationConditions).reduce(
      (acc: fromModel.TContainentsIndex, curr) => {
        curr.maxDepartaments = action.payload;
        acc[curr.localization] = curr;
        return acc;
      },
      {}
    );
    ctx.patchState({ locationConditions: newConditions });
  }
  @fromNGXS.Action(fromModel.ProductionAction.UpdateMaxLine)
  updateMaxLine(ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>, action: fromModel.ProductionAction.UpdateMaxLine): void {
    const state = ctx.getState();
    const newConditions: fromModel.TContainentsIndex = Object.values(state.locationConditions).reduce(
      (acc: fromModel.TContainentsIndex, curr) => {
        curr.maxLinesPerDepartament = action.payload;
        acc[curr.localization] = curr;
        return acc;
      },
      {}
    );
    ctx.patchState({ locationConditions: newConditions });
  }
  @fromNGXS.Action(fromModel.ProductionAction.RemoveLineFromProduction)
  removeLineFromProduction(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    action: fromModel.ProductionAction.RemoveLineFromProduction
  ): Observable<any> {
    return of(ctx.getState()).pipe(
      map(state => {
        const line = state.productionLineLocalizations.find(item => item.lineId === action.payload);
        const dep = state.departamentLocalizations.find(item => item.departamentId === line!.departamentId);
        return { state, line, dep };
      }),
      tap(({ state }) =>
        ctx.patchState({ productionLineLocalizations: state.productionLineLocalizations.filter(item => item.lineId !== action.payload) })
      ),
      switchMap(({ line, dep }) => {
        return combineLatest([of(dep), this.store.removeChildInLocalization(line!.location)]);
      }),
      take(1),
      switchMap(([dep]) =>
        combineLatest([of(dep), this.store.dispatchInLocation(new fromModel.ProductionAction.RemoveLine(), dep!.localization)])
      ),
      switchMap(([dep]) => {
        const state = ctx.getState();
        return state.productionLineLocalizations.find(item => item.departamentId === dep!.departamentId) === undefined
          ? this.store.dispatch(new fromModel.ProductionAction.RemoveDepartamentFromProduction(dep!.departamentId))
          : of(true);
      })
    );
  }

  @fromNGXS.Action(fromModel.ProductionAction.RemoveDepartamentFromProduction)
  removeDepartamentFromProduction(
    ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>,
    action: fromModel.ProductionAction.RemoveDepartamentFromProduction
  ): Observable<any> {
    return of(ctx.getState()).pipe(
      map(state => {
        const depLocation = state.departamentLocalizations.find(item => item.departamentId === action.payload);
        const dep = <fromModel.IDepartamentModel>(
          this.store.getChildrenStateByName(depLocation!.localization.getParentPath(), action.payload)
        );
        return { depLocation, dep };
      }),
      switchMap(data => combineLatest([of(data), this.store.dispatch(new fromModel.ProductionAction.RemoveDepartament(data.dep))])),
      map(([data]) => data.depLocation),
      switchMap(dep => {
        return combineLatest([of(dep), this.store.removeChildInLocalization(dep!.localization)]);
      })
    );
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
        // tap(() => console.log('rozpoczałem')),
        map((offer: fromModel.SaleScheduleAction.NewOfferAdded) => offer.payload),
        withLatestFrom(this.inProgressOffer$),
        // tap(() => console.log('jestem')),
        switchMap(([offer, inProgressOffer]) => {
          return inProgressOffer ? this.rejectOffers(ctx, offer) : this.processNewOffer(ctx, offer);
        })
      )
      .subscribe(() => {
        // console.log('zakończyłem');
        // console.log('offer subs: ', item);
      });
  }
  processNewOffer(ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>, offeres: Array<fromModel.IOffer>): Observable<any> {
    return of(offeres).pipe(
      tap(() => this.inProgressOffer$.next(true)),
      switchMap(off =>
        concat(
          ...off.map(offer => {
            return of(true).pipe(
              map(() => {
                // console.log('rozpoczałem', offer.offerId);
                const state = ctx.getState();
                const data: IDataConfiguration = {
                  lines: state.productionLineLocalizations.filter(line => line.productId === offer.productId),
                  dep: state.departamentLocalizations,
                  conditions: state.locationConditions
                };
                return data;
              }),
              switchMap(data =>
                combineLatest([
                  this.havePosibilityDoWithExistingLine(offer, data),
                  this.havePosibilityToCreateNewLineWhitExistingDepartament(offer, data),
                  this.havePosibilityToCreateNewDepartamentAndNewLine(offer, data)
                ]).pipe(
                  map(([doWithLine, doWithNewLine, doWithNewDep]) => ({ doWithLine, doWithNewLine, doWithNewDep })),
                  // tap(i =>
                  // console.log(offer.offerId, i.doWithLine.isPosibility, i.doWithNewLine.isPosibility, i.doWithNewDep.isPosibility)
                  // ),
                  switchMap(obs =>
                    merge(
                      this.shoudRejectOffer(obs.doWithLine, obs.doWithNewLine, obs.doWithNewDep, offer).pipe(
                        switchMap(whatToDo => this.rejectOffer(ctx, whatToDo))
                      ),
                      this.shoudCreateNewDepartamentAndNewLine(obs.doWithLine, obs.doWithNewLine, obs.doWithNewDep, offer, data).pipe(
                        switchMap(whatToDo => this.createNewDepartamentWhitLine(ctx, whatToDo))
                      ),
                      this.shoudCreateNewLineWhitExistingDepartament(obs.doWithLine, obs.doWithNewLine, offer, data).pipe(
                        switchMap(whatToDo => this.createNewLineWhitExistingDepartament(ctx, whatToDo))
                      ),
                      this.getInfoDoWithExistingLine(obs.doWithLine, offer, data).pipe(
                        switchMap(whatToDo => this.doWithExistingLine(ctx, whatToDo))
                      )
                    )
                  ),
                  take(1)
                  // tap(() => console.log('skonczyłem'))
                )
              )
            );
          })
        )
      ),
      tap(() => this.inProgressOffer$.next(false))
    );
  }

  private shoudRejectOffer(
    doWithLine: IDoWithLine,
    doWithNewLine: IDoWithNewLine,
    doWithNewDep: IDoWithNewDepartament,
    offer: fromModel.IOffer
  ): Observable<IWhatShoudDoWithOffer> {
    return of({ doWithLine, doWithNewLine, doWithNewDep }).pipe(
      filter(doWith => {
        return !doWith.doWithLine.isPosibility && !doWith.doWithNewLine.isPosibility && !doWith.doWithNewDep.isPosibility;
      }),
      // tap(res => console.log('będzie odrzucenie', res)),
      map((): IWhatShoudDoWithOffer => getEmptyWhatShoudDoWithOffer(offer))
    );
  }
  private havePosibilityToCreateNewLineWhitExistingDepartament(
    offer: fromModel.IOffer,
    data: IDataConfiguration
  ): Observable<IDoWithNewLine> {
    return of(data).pipe(
      // map(() => lineThatTakeThisOffer(this.store, offer, this.store.getStateLocationByStateClass(ProductionMenagmentState), data)),
      switchMap(() => havePosibilityToRunNewLine(this.store, offer, data))
      // tap(item => console.log('new line', item.isPosibility))
    );
  }

  private shoudCreateNewLineWhitExistingDepartament(
    doWithLine: IDoWithLine,
    doWithNewLine: IDoWithNewLine,
    offer: fromModel.IOffer,
    data: IDataConfiguration
  ): Observable<IWhatShoudDoWithOffer> {
    // if (offer.offerId === '44/BMW RT') {
    //   console.log('44');
    // }
    return of({ doWithLine, doWithNewLine, offer, data }).pipe(
      filter(doWith => {
        return !doWith.doWithLine.isPosibility && doWith.doWithNewLine.isPosibility;
      }),
      map(
        (result): IWhatShoudDoWithOffer => ({
          ...getEmptyWhatShoudDoWithOffer(offer),
          departementId: result.doWithNewLine.dep!.departamentId,
          localization: result.doWithNewLine.dep!.localization
        })
      )
    );
  }
  private havePosibilityDoWithExistingLine(offer: fromModel.IOffer, data: IDataConfiguration): Observable<IDoWithLine> {
    return of(data).pipe(
      // filter(({ lines }) => lines.length !== 0),
      map(({ lines }) => {
        return lines.length !== 0
          ? lineThatTakeThisOffer(this.store, offer, this.store.getStateLocationByStateClass(ProductionMenagmentState), data)
          : { isPosibility: false };
      })
      // tap(item => console.log('do with existing line', item.isPosibility))
    );
  }

  private getInfoDoWithExistingLine(
    doWithLine: IDoWithLine,
    offer: fromModel.IOffer,
    data: IDataConfiguration
  ): Observable<IWhatShoudDoWithOffer> {
    // if (offer.offerId === '44/BMW RT') {
    //   console.log('44');
    // }
    return of({ doWithLine, data, offer }).pipe(
      filter(item => item.doWithLine.isPosibility),
      map(
        (item): IWhatShoudDoWithOffer => ({
          ...getEmptyWhatShoudDoWithOffer(item.offer),
          lineProductionId: item.doWithLine.lineDescription!.lineId,
          localization: item.doWithLine.lineDescription!.location
        })
      )
    );
  }
  private havePosibilityToCreateNewDepartamentAndNewLine(
    offer: fromModel.IOffer,
    data: IDataConfiguration
  ): Observable<IDoWithNewDepartament> {
    return havePosibilityToRunNewDepartament(this.store, offer, data)
      .pipe
      //
      // tap(item => console.log('new departament', item.isPosibility))
      ();
  }

  private shoudCreateNewDepartamentAndNewLine(
    doWithLine: IDoWithLine,
    doWithNewLine: IDoWithNewLine,
    doWithNewDep: IDoWithNewDepartament,
    offer: fromModel.IOffer,
    data: IDataConfiguration
  ): Observable<IWhatShoudDoWithOffer> {
    return of({ doWithLine, doWithNewLine, doWithNewDep, offer, data }).pipe(
      filter(doWith => {
        return !doWith.doWithLine.isPosibility && !doWith.doWithNewLine.isPosibility && doWith.doWithNewDep.isPosibility;
      }),
      map(
        (item): IWhatShoudDoWithOffer => ({
          ...getEmptyWhatShoudDoWithOffer(item.offer),
          continent: item.doWithNewDep.continent!,
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
  private rejectOffers(ctx: fromNGXS.StateContext<fromModel.IProductionManagmentModel>, offers: Array<fromModel.IOffer>): Observable<any> {
    return ctx.dispatch(new fromModel.SaleScheduleAction.RejectOffer(offers.map(item => item.offerId)));
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
      switchMap(({ product, childName }) => {
        const stateType: Type<BaseLineProductionState> = getLineProduction(product.productKind);
        return combineLatest(
          of({ product, stateName: childName, location: fromNGXS.SingleLocation.getLocation(whatToDo.localization.path, childName) }),
          this.store.addChildInLocalization(stateType, whatToDo.localization, { childName, context: product.productKind })
        );
      }),
      map(([{ product, stateName, location }]) => ({ product, stateName, location })),
      switchMap(({ product, stateName, location: localization }) =>
        combineLatest(
          of({ product, stateName, localization }),
          this.store.dispatchInLocation(
            new fromModel.ProductionAction.InitLineProductionData({
              lineId: stateName,
              productId: product.productId,
              numberOfParallelProduction: product.numberOfParallelProduction,
              departamentId: whatToDo.departementId
            }),
            localization
          ),
          this.store.dispatchInLocation(new fromModel.ProductionAction.AddLine(), whatToDo.localization)
        )
      ),
      map(([{ product, stateName, localization }]) => {
        ctx.patchState({
          productionLineLocalizations: [
            ...state.productionLineLocalizations,
            { lineId: stateName, productId: product.productId, location: localization, departamentId: whatToDo.departementId }
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
      // tap(() => console.log('utworzono nową linie'))
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
    const childName = getStateNameForDepartament(id, whatToDo.continent);
    const childLocation = fromNGXS.SingleLocation.getLocation(
      this.store.getStateLocationByStateClass(ProductionMenagmentState).path,
      childName
    );
    return of(whatToDo).pipe(
      switchMap(() => this.store.addChildWithinParent(ProductionMenagmentState, DepartamentState, { childName })),
      switchMap(() => this.store.dispatch([new fromModel.ProductionAction.AddDepartament(whatToDo.continent)])),
      switchMap(() => this.store.select(ProductState.productsArray$)),
      map(product => product.find(item => item.productId === whatToDo.offer.productId)),
      switchMap(() =>
        combineLatest(
          this.store.dispatchInLocation(
            new fromModel.ProductionAction.InitDepartamentData({
              continent: whatToDo.continent,
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
      map(result => result)
      // tap(() => console.log('utworzono nowy departament'))
    );
  }
}
