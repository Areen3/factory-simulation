import { Injectable } from '@angular/core';
import { Action, Actions, NgxsOnDestroy, ofActionSuccessful, Selector, SingleLocation, State, StateContext, Store } from '@ngxs/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
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
  production: {},
  ticksWithoutOrders: 0
};

@State<fromModel.IBaseProductionLineModel>({
  name: 'BaseLineState',
  defaults: initialBaseLineDataModel
})
@Injectable({
  providedIn: 'root'
})
// REVIEW ngxs example of base state class for inheritance in feature
// REVIEW ngxs example of using onDestroy part 1
export class BaseLineProductionState<T extends fromModel.IBaseProductionLineModel = fromModel.IBaseProductionLineModel> extends BaseState<T>
  implements NgxsOnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private processOrdersRun: boolean = false;
  constructor(protected store: Store, protected actions$: Actions) {
    super(store);
  }
  @Selector()
  static dataToGui$(state: fromModel.IBaseProductionLineModel): fromModel.ILineGui {
    // REVIEW ngxs example of selector that return object, little dengerous becasue for any changes in storyge it return different value
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
  @Action(fromModel.ProductionAction.InitLineProductionData)
  initLineProductionData(
    ctx: StateContext<fromModel.IBaseProductionLineModel>,
    action: fromModel.ProductionAction.InitLineProductionData
  ): void {
    const state = ctx.getState();
    const {
      lineId,
      productId,
      numberOfParallelProduction,
      departamentId
    }: fromModel.ProductionAction.ILineProductionDataAction = action.payload;
    ctx.patchState({ lineId, productId, numberOfParallelProduction, departamentId, productionCapacity: state.productionCapacity });
  }
  @Action(fromModel.ProductAction.NumberOfParallelProduction)
  numberOfParallelProduction(
    ctx: StateContext<fromModel.IBaseProductionLineModel>,
    action: fromModel.ProductAction.NumberOfParallelProduction
  ): void {
    const state = ctx.getState();
    if (state.productId === action.payload.productId || action.payload.productId === -1) {
      ctx.patchState({ numberOfParallelProduction: action.payload.numberOfParallelProduction });
    }
  }
  @Action(fromModel.ProductAction.BufferChange)
  // REVIEW ngxs example of process action in inherited states (car, motocycle, ...)
  bufferChange(ctx: StateContext<fromModel.IBaseProductionLineModel>, action: fromModel.ProductAction.BufferChange): void {
    this.innerBufferChange(ctx, action.payload);
  }
  @Action(fromModel.ProductionAction.AddOrderToQueueProduction)
  addOrderToQueueProduction(
    ctx: StateContext<fromModel.IBaseProductionLineModel>,
    action: fromModel.ProductionAction.AddOrderToQueueProduction
  ): void {
    const state = ctx.getState();
    // REVIEW js example of change array of ordres to index with mapping strucutre
    const newElementToProduce: fromModel.TInProduceOnTheLineIndex = action.payload.orders
      .map(item => {
        // const randomCases = fromModel.getRandomRange(0, 2);
        const randomCases = 0;
        const result: fromModel.IInProduceOnTheLine = {
          actualProgressTick: 0,
          tickRemaind: (action.payload.product.tickToProduceOneElement + randomCases) * item.quantityPlanned,
          tickTaken: 0,
          orderId: item.orderId,
          lineId: state.lineId,
          orderCleared: false,
          tickToProduceOneElement: action.payload.product.tickToProduceOneElement + randomCases
        };
        return result;
      })
      .reduce((acc, curr) => ({ ...acc, [curr.orderId]: curr }), {});
    const newStateProduce = { ...state.production, ...newElementToProduce };
    ctx.patchState({
      production: newStateProduce,
      // REVIEW js example of count properise in object
      freeCapacity: state.productionCapacity - Object.keys(newStateProduce).length
    });
  }
  @Action(fromModel.ProductionAction.RemoveOrderFromQueue)
  removeOrderFromQueue(
    ctx: StateContext<fromModel.IBaseProductionLineModel>,
    action: fromModel.ProductionAction.RemoveOrderFromQueue
  ): void {
    const state = ctx.getState();
    // REVIEW js example of shallow copy of object
    const itemLeaved = { ...state.production };
    action.payload.forEach(item => {
      // REVIEW js example of delete property from object
      delete itemLeaved[item];
    });
    ctx.patchState({
      production: itemLeaved,
      freeCapacity: state.productionCapacity - Object.keys(itemLeaved).length
    });
  }
  @Action(fromModel.ProductionAction.ClearOrderInProduce)
  clearOrderInProduce(ctx: StateContext<fromModel.IBaseProductionLineModel>, action: fromModel.ProductionAction.ClearOrderInProduce): void {
    const state = ctx.getState();
    // REVIEW js example of chaing array processing
    const productionWithClose = Object.values(state.production)
      .filter(item => action.payload.find(elem => elem === item.orderId))
      .map((item): fromModel.IInProduceOnTheLine => ({ ...item, orderCleared: true }))
      .reduce((acc, curr) => ({ ...acc, [curr.orderId]: curr }), {});
    ctx.patchState({ production: { ...state.production, ...productionWithClose } });
  }
  @Action(fromModel.ProductionAction.ProcessOneTick)
  processOneTick(ctx: StateContext<fromModel.IBaseProductionLineModel>, action: fromModel.ProductionAction.ProcessOneTick): any {
    const state = ctx.getState();
    const prductArray = Object.values(state.production);
    const tickWithoutOrders = prductArray.length > 0 ? 0 : state.ticksWithoutOrders + 1;

    const processedItems: fromModel.TInProduceOnTheLineIndex = prductArray
      // REVIEW js example of sort array
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
    // REVIEW js example of joining object
    const newStateProduce = { ...state.production, ...processedItems };
    ctx.patchState({
      production: newStateProduce,
      ticksWithoutOrders: tickWithoutOrders,
      freeCapacity: state.productionCapacity - Object.keys(newStateProduce).length
    });
    // REVIEW ngxs example of building array of action that will be send
    const actionToSent = [];
    if (partialMade.length > 0) actionToSent.push(ctx.dispatch(new fromModel.SaleScheduleAction.NewElementInOrderFinish(partialMade)));
    if (tickWithoutOrders > 10) {
      actionToSent.push(this.store.dispatch(new fromModel.ProductionAction.RemoveLineFromProduction(state.lineId)));
    }
    // REVIEW ngxs example sending array of actions
    if (actionToSent.length !== 0) return this.store.dispatch(actionToSent);
  }
  // REVIEW ngxs example of using onDestroy part 2
  ngxsOnDestory(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  protected processOrders(kind: fromModel.EProductKind): void {
    // REVIEW ngxs example of using onDestroy part 2
    if (this.processOrdersRun) return;
    console.log('line run ' + kind);
    this.processOrdersRun = true;
    const run$: Observable<boolean> = this.store.select(TickGeneratorState.run$);
    // REVIEW rxjs example of chain that procude element in factory
    run$
      .pipe(
        // REVIEW rxjs example of stop stream
        takeUntil(this.destroy$),
        filter(run => run),
        // REVIEW ngxs example of observable ngxs action
        switchMap(() => this.actions$),
        ofActionSuccessful(fromModel.TickAction.Tick),
        // REVIEW ngxs example of getting data form observable action
        map((tick: fromModel.TickAction.Tick) => tick.payload),
        switchMap(tick => this.processOneTickOnLines(tick, kind)),
        // REVIEW rxjs example of changing array to object
        map(([tick, products]): {
          tick: number;
          products: fromModel.TProductIndex;
        } => ({ tick, products })),
        switchMap(({ tick, products }) => this.updateFinanseAfterTick(tick, products, kind)),
        map(([tick, products, lines]): {
          tick: number;
          products: fromModel.TProductIndex;
          lines: Array<fromModel.IBaseProductionLineModel>;
        } => ({ tick, products, lines })),
        switchMap(({ lines }) => {
          const prodMenagmentState = <fromModel.IProductionManagmentModel>(
            this.store.selectSnapshotInContext(BaseState.state$, SingleLocation.getLocation(fromModel.EStateName.productionManagmentState))
          );
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
    const prodMenagmentState = <
      fromModel.IProductionManagmentModel // REVIEW ngxs example of take snapshot from specific location
    >this.store.selectSnapshotInContext(BaseState.state$, SingleLocation.getLocation(fromModel.EStateName.productionManagmentState));
    const actionToSend = prodMenagmentState.productionLineLocalizations
      .filter(line => products[line.productId].productKind === kind)
      .map(line => {
        // REVIEW ngxs example of dispatching action to specific location
        return this.store.dispatchInLocation(new fromModel.ProductionAction.ProcessOneTick({ tick }), line.location);
      });
    return combineLatest([of(tick), of(products), ...actionToSend]);
  }
  private updateFinanseAfterTick(tick: number, products: fromModel.TProductIndex, kind: fromModel.EProductKind): Observable<any> {
    const locStaff = this.store.getStateLocationByStateClass(StaffState);
    const staff: fromModel.IStaffModel = this.store.selectSnapshotInContext(StaffState.state$, locStaff);
    const prodMenagmentState = <fromModel.IProductionManagmentModel>(
      this.store.selectSnapshotInContext(BaseState.state$, SingleLocation.getLocation(fromModel.EStateName.productionManagmentState))
    );
    const lines: Array<fromModel.IBaseProductionLineModel> = prodMenagmentState.productionLineLocalizations
      .filter(line => products[line.productId].productKind === kind)
      .map(line => this.store.selectSnapshotInContext(BaseLineProductionState.state$, line.location));
    const departaments = prodMenagmentState.departamentLocalizations
      .filter(dep => lines.find(line => line.departamentId === dep.departamentId))
      .map(dep => this.store.selectSnapshotInContext(DepartamentState.state$, dep.localization));
    const actual = getDataToCalculateFinance(kind, prodMenagmentState, lines, departaments, products, staff);
    if (actual.costArray.length !== 0) this.store.dispatch(new fromModel.CompanyMenagmentAction.AddCostFromLine(actual.costArray));
    if (actual.saleArray.length !== 0) this.store.dispatch(new fromModel.CompanyMenagmentAction.AddSaleFromLine(actual.saleArray));

    const lineToClearOrders = actual.saleArray.map(line =>
      this.store.dispatchInLocation(
        new fromModel.ProductionAction.ClearOrderInProduce(actual.saleArray.map(item => item.orderId)),
        line.location
      )
    );
    return combineLatest([of(tick), of(products), of(lines), ...lineToClearOrders]);
  }
  protected innerBufferChange(_ctx: StateContext<fromModel.IBaseProductionLineModel>, _data: fromModel.ProductAction.IBufferChange): any {}
  protected updateCapacity(ctx: StateContext<fromModel.IBaseProductionLineModel>, capacity: number): void {
    ctx.patchState({ productionCapacity: capacity });
  }
}
