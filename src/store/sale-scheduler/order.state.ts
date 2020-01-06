import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';

const initialOrderDataModel: fromModel.IOrderModel = {
  ...initialBaseStateDataModel,
  orders: {},
  rates: { finished: 0, inProgress: 0, new: 0 }
};

@State<fromModel.IOrderModel>({
  name: 'OrderState',
  defaults: initialOrderDataModel
})
@Injectable({
  providedIn: 'root'
})
export class OrderState extends BaseState<fromModel.IOrderModel> {
  constructor(protected store: Store) {
    super(store);
  }
  @Selector()
  static orders$(state: fromModel.IOrderModel): fromModel.TIndexOrderType {
    return state.orders;
  }
  @Selector()
  static rates$(state: fromModel.IOrderModel): fromModel.IOrderRatesModel {
    return state.rates;
  }
  @Selector()
  static ordersArray$(state: fromModel.IOrderModel): Array<fromModel.IOrder> {
    return Object.values(state.orders);
  }

  @Action(fromModel.SaleScheduleAction.NewElementInOrderFinish)
  newElementInOrderFinish(ctx: StateContext<fromModel.IOrderModel>, action: fromModel.SaleScheduleAction.NewElementInOrderFinish): void {
    const state = ctx.getState();
    const partialMade: fromModel.TIndexOrderType = action.payload
      .map(item => {
        const order: fromModel.IOrder = {
          ...state.orders[item.orderId],
          qantityMade: item.made,
          qantityRemainded: state.orders[item.orderId].quantityPlanned - item.made
        };
        return order;
      })
      .reduce((acc, curr) => ({ ...acc, [curr.orderId]: curr }), {});
    ctx.patchState({ orders: { ...state.orders, ...partialMade } });
  }
  @Action(fromModel.SaleScheduleAction.NewOrder)
  newOrder(ctx: StateContext<fromModel.IOrderModel>, action: fromModel.SaleScheduleAction.NewOrder): void {
    const state = ctx.getState();
    const orders: fromModel.TIndexOrderType = action.payload.orders.reduce((acc, curr) => ({ ...acc, [curr.orderId]: curr }), {});
    const newOrders: fromModel.TIndexOrderType = {
      ...Object.values(state.orders)
        .filter(
          item =>
            item.status === fromModel.EOrderStatus.inProgress ||
            item.status === fromModel.EOrderStatus.finished ||
            (item.status === fromModel.EOrderStatus.new && action.payload.tick <= item.tick + 1000)
        )
        .reduce((acc: fromModel.TIndexOrderType, curr: fromModel.IOrder) => ({ ...acc, ...{ [curr.orderId]: curr } }), {}),
      ...orders
    };
    ctx.patchState({
      orders: newOrders,
      rates: { ...state.rates, new: state.rates.new + 1 }
    });
    ctx.dispatch(new fromModel.SaleScheduleAction.NewOrderAdded(action.payload.orders));
  }
  @Action(fromModel.SaleScheduleAction.FinishOrder)
  finishOrder(ctx: StateContext<fromModel.IOrderModel>, action: fromModel.SaleScheduleAction.FinishOrder): void {
    this.changeStatus(ctx, action.payload, fromModel.EOrderStatus.finished);
  }
  @Action(fromModel.SaleScheduleAction.InProgressOrder)
  inProgressOrder(ctx: StateContext<fromModel.IOrderModel>, action: fromModel.SaleScheduleAction.InProgressOrder): void {
    this.changeStatus(ctx, action.payload, fromModel.EOrderStatus.inProgress);
  }
  private changeStatus(ctx: StateContext<fromModel.IOrderModel>, ids: Array<fromModel.TOrderId>, status: fromModel.EOrderStatus): void {
    const state = ctx.getState();
    const orders: fromModel.TIndexOrderType = ids.reduce(
      (acc: fromModel.TIndexOrderType, curr: fromModel.TOrderId) => ({ ...acc, [curr]: { ...state.orders[curr], status } }),
      {}
    );
    const statusCount: fromModel.IIndexStringType<number> = Object.values(fromModel.EOrderStatus).reduce(
      (acc, curr) => ({ ...acc, [curr]: 0 }),
      {}
    );
    statusCount[status] = ids.length;
    if (fromModel.EOrderStatus.finished === status) statusCount[fromModel.EOfferStatus.inProgress] = ids.length * -1;
    if (fromModel.EOrderStatus.inProgress === status) statusCount[fromModel.EOfferStatus.new] = ids.length * -1;
    ctx.patchState({
      rates: {
        inProgress: state.rates.inProgress + statusCount[fromModel.EOfferStatus.inProgress],
        new: state.rates.new + statusCount[fromModel.EOfferStatus.new],
        finished: state.rates.finished + statusCount[fromModel.EOfferStatus.finished]
      },
      orders: { ...state.orders, ...orders }
    });
  }
}
