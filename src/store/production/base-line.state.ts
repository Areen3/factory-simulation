import { Injectable } from '@angular/core';
import { Action, Actions, NgxsOnDestroy, ofActionSuccessful, Selector, SingleLocation, State, StateContext, Store } from '@ngxs/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';
import { StaffState } from '../company-menagment';
import { ProductState } from '../product/product.state';
import { OrderState } from '../sale-scheduler';
import { TickGeneratorState } from '../tick-generator';
import { DepartamentState } from './departament.state';
import { getDataToCalculateFinance, reorganiseOrdersAfterTick } from './production.utils';

export const initialBaseLineDataModel: fromModel.IBaseProductionLineModel = {
  ...initialBaseStateDataModel,
  lineId: '',
  productId: 0,
  productionCapacity: 0,
  freeCapacity: 0,
  numberOfParallelProduction: 0,
  departamentId: '',
  production: {}
};

@State<fromModel.IBaseProductionLineModel>({
  name: 'BaseLineState',
  defaults: initialBaseLineDataModel
})
@Injectable({
  providedIn: 'root'
})
export class BaseLineProductionState<T extends fromModel.IBaseProductionLineModel = fromModel.IBaseProductionLineModel> extends BaseState<T>
  implements NgxsOnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private processOrdersRun: boolean = false;
  constructor(protected store: Store, protected actions$: Actions) {
    super(store);
  }
  @Selector()
  static dataToGui$(state: fromModel.IBaseProductionLineModel): fromModel.ILineGui {
    return {
      freeCapacity: state.freeCapacity,
      productionCapacity: state.productionCapacity,
      productId: state.productId,
      numberOfParallelProduction: state.numberOfParallelProduction,
      lineId: state.lineId
    };
  }
  @Selector()
  static production$(state: fromModel.IBaseProductionLineModel): fromModel.TInProduceOnTheLineIndex {
    return state.production;
  }
  @Selector()
  static freeCapacity$(state: fromModel.IBaseProductionLineModel): number {
    return state.freeCapacity;
  }
  @Action(fromModel.ProductionAction.InitLindeProductionData)
  initLindeProductionData(
    ctx: StateContext<fromModel.IBaseProductionLineModel>,
    action: fromModel.ProductionAction.InitLindeProductionData
  ): void {
    const state = ctx.getState();
    const {
      lineId,
      productId,
      numberOfParallelProduction,
      departamentId
    }: fromModel.ProductionAction.ILineProductionDataAction = action.payload;
    ctx.patchState({ lineId, productId, numberOfParallelProduction, departamentId, freeCapacity: state.productionCapacity });
  }
  @Action(fromModel.ProductionAction.AddOrderToQueueProduction)
  addOrderToQueueEmployment(
    ctx: StateContext<fromModel.IBaseProductionLineModel>,
    action: fromModel.ProductionAction.AddOrderToQueueProduction
  ): void {
    const state = ctx.getState();
    const newElementToProduce: fromModel.TInProduceOnTheLineIndex = action.payload.orders
      .map(item => {
        const result: fromModel.IInProduceOnTheLine = {
          actualProgressTick: 0,
          tickRemaind: action.payload.product.tickToProduceOneElement * item.quantityPlanned,
          tickTaken: 0,
          orderId: item.orderId,
          lineId: state.lineId,
          tickToProduceOneElement: action.payload.product.tickToProduceOneElement
        };
        return result;
      })
      .reduce((acc, curr) => ({ ...acc, [curr.orderId]: curr }), {});
    const newStateProduce = { ...state.production, ...newElementToProduce };
    ctx.patchState({
      production: newStateProduce,
      freeCapacity: state.productionCapacity - Object.keys(newStateProduce).length
    });
  }
  @Action(fromModel.ProductionAction.RemoveOrderFromQueue)
  removeOrderFromQueue(
    ctx: StateContext<fromModel.IBaseProductionLineModel>,
    action: fromModel.ProductionAction.RemoveOrderFromQueue
  ): void {
    const state = ctx.getState();
    const itemLeaved = { ...state.production };
    action.payload.forEach(item => {
      delete itemLeaved[item];
    });
    ctx.patchState({
      production: itemLeaved,
      freeCapacity: state.productionCapacity - Object.keys(itemLeaved).length
    });
  }
  @Action(fromModel.ProductionAction.ProcessOneTick)
  processOneTick(ctx: StateContext<fromModel.IBaseProductionLineModel>, action: fromModel.ProductionAction.ProcessOneTick): void {
    const state = ctx.getState();
    const processedItems: fromModel.TInProduceOnTheLineIndex = Object.values(state.production)
      .sort((a, b) => b.tickTaken - a.tickTaken)
      .slice(0, state.numberOfParallelProduction)
      .map(item => {
        item.actualProgressTick = action.payload.tick;
        item.tickRemaind = item.tickRemaind - 1;
        item.tickTaken = item.tickTaken + 1;
        return item;
      })
      .reduce((acc, curr) => ({ ...acc, [curr.orderId]: curr }), {});
    const partialMade: Array<fromModel.SaleScheduleAction.INewElementInOrderFinishData> = Object.values(processedItems)
      .filter(item => item.tickTaken % item.tickToProduceOneElement === 0 && item.tickTaken !== 0)
      .map(
        (item): fromModel.SaleScheduleAction.INewElementInOrderFinishData => {
          const count = Math.floor(item.tickTaken / item.tickToProduceOneElement);
          return { made: count, orderId: item.orderId };
        }
      );
    if (partialMade.length > 0) {
      ctx.dispatch(new fromModel.SaleScheduleAction.NewElementInOrderFinish(partialMade));
    }
    const newStateProduce = { ...state.production, ...processedItems };
    ctx.patchState({
      production: newStateProduce,
      freeCapacity: state.productionCapacity - Object.keys(newStateProduce).length
    });
  }

  ngxsOnDestory(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  protected processOrders(kind: fromModel.EProductKind): void {
    if (this.processOrdersRun) return;
    this.processOrdersRun = true;
    const run$: Observable<boolean> = this.store.select(TickGeneratorState.run$);
    run$
      .pipe(
        filter(run => run),
        switchMap(() => this.actions$),
        ofActionSuccessful(fromModel.TickAction.Tick),
        map((tick: fromModel.TickAction.Tick) => tick.payload),
        switchMap(tick => this.processOneTickOnLines(tick, kind)),
        map(([tick, products, prodMenagmentState]): {
          tick: number;
          products: fromModel.TProductIndex;
          prodMenagmentState: fromModel.IProductionManagmentModel;
        } => ({ tick, products, prodMenagmentState })),
        switchMap(({ tick, products, prodMenagmentState }) => this.updateFinaneAfterTick(tick, products, prodMenagmentState, kind)),
        map(([tick, products, lines, prodMenagmentState]): {
          tick: number;
          products: fromModel.TProductIndex;
          lines: Array<fromModel.IBaseProductionLineModel>;
          prodMenagmentState: fromModel.IProductionManagmentModel;
        } => ({ tick, products, lines, prodMenagmentState })),
        switchMap(({ lines, prodMenagmentState }) => {
          const orders = reorganiseOrdersAfterTick(prodMenagmentState, lines);
          const ordersIndex = this.store.selectSnapshot(OrderState.orders$);
          const offersToFinish = orders.flatMap(order => order.finishedOrders.map((item: fromModel.TOrderId) => ordersIndex[item].offerId));
          const ordersToFinisch = orders.reduce((acc: fromModel.TOrderId[], curr) => [...acc, ...curr.finishedOrders], []);
          const ordersInProgress = orders.reduce((acc: fromModel.TOrderId[], curr) => [...acc, ...curr.startedOrders], []);
          const offersInProgress = orders.flatMap(order =>
            order.startedOrders.map((item: fromModel.TOrderId) => ordersIndex[item].offerId)
          );
          const actionToSend = [];
          if (offersToFinish.length !== 0) actionToSend.push(new fromModel.SaleScheduleAction.FinishOffer(offersToFinish));
          if (ordersToFinisch.length !== 0) actionToSend.push(new fromModel.SaleScheduleAction.FinishOrder(ordersToFinisch));
          if (ordersToFinisch.length !== 0) actionToSend.push(new fromModel.ProductionAction.RemoveOrderFromQueue(ordersToFinisch));
          if (ordersInProgress.length !== 0) actionToSend.push(new fromModel.SaleScheduleAction.InProgressOrder(ordersInProgress));
          if (offersInProgress.length !== 0) actionToSend.push(new fromModel.SaleScheduleAction.InProgressOffer(offersInProgress));
          return this.store.dispatch(actionToSend);
        })
      )
      .subscribe(() => {
        // console.log(item);
      });
  }
  private processOneTickOnLines(tick: number, kind: fromModel.EProductKind): Observable<any> {
    const products = this.store.selectSnapshot(ProductState.productsIndex$);
    const prodMenagmentState = <fromModel.IProductionManagmentModel>(
      this.store.selectSnapshotInContext(BaseState.state$, SingleLocation.getLocation(fromModel.EStateName.productionManagmentState))
    );
    const actionToSend = prodMenagmentState.productionLineLocalizations
      .filter(line => products[line.productId].productKind === kind)
      .map(line => {
        return this.store.dispatchInLocation(new fromModel.ProductionAction.ProcessOneTick({ tick }), line.localization);
      });
    return combineLatest([of(tick), of(products), of(prodMenagmentState), ...actionToSend]);
  }
  private updateFinaneAfterTick(
    tick: number,
    products: fromModel.TProductIndex,
    prodMenagmentState: fromModel.IProductionManagmentModel,
    kind: fromModel.EProductKind
  ): Observable<any> {
    const locStaff = this.store.getStateLocationByStateClass(StaffState);
    const staff: fromModel.IStaffModel = this.store.selectSnapshotInContext(StaffState.state$, locStaff);
    const lines: Array<fromModel.IBaseProductionLineModel> = prodMenagmentState.productionLineLocalizations
      .filter(line => products[line.productId].productKind === kind)
      .map(line => this.store.selectSnapshotInContext(BaseLineProductionState.state$, line.localization));
    const departaments = prodMenagmentState.departamentLocalizations
      .filter(dep => lines.find(line => line.departamentId === dep.departamentId))
      .map(dep => this.store.selectSnapshotInContext(DepartamentState.state$, dep.localization));
    const actons = getDataToCalculateFinance(kind, prodMenagmentState, lines, departaments, products, staff);
    this.store.dispatch([
      new fromModel.CompanyMenagmentAction.AddCostFromLine(actons.costArray),
      new fromModel.CompanyMenagmentAction.AddSaleFromLine(actons.saleArray)
    ]);
    return combineLatest([of(tick), of(products), of(lines), of(prodMenagmentState)])
      .pipe
      // tap(xxx => {
      //   // console.log('po aktualizacji finansów', xxx);
      // })
      ();
  }
}
