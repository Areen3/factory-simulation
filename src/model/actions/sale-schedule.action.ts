import { ActionKind } from '@ngxs/store';

import { IOffer, IOrder } from '../state-model';
import { TOfferId, TOrderId, TProductId } from '../type';
import { BaseActionWithPayload } from './base';

export namespace SaleScheduleAction {
  enum Types {
    newOffer = 'cmd [SaleSchedule] new offer',
    newOfferAdded = 'event [SaleSchedule] new offer added',
    finishOffer = 'cmd [SaleSchedule] finish offer',
    rejectOffer = 'cmd [SaleSchedule] reject offer',
    approveOffer = 'cmd [SaleSchedule] approve offer',
    inProgressOffer = 'cmd [SaleSchedule] inProgress offer',
    newOrder = 'cmd [SaleSchedule] new order',
    finishOrder = 'cmd [SaleSchedule] finish order',
    inProgressOrder = 'cmd [SaleSchedule] inProgress order',
    // REVIEW ngxs example action event name convention
    newOrderAdded = 'event [SaleSchedule] new order added',
    newElementFinish = 'cmd [SaleSchedule] new elment fnish'
  }

  export interface INewOfferOnMarket {
    offers: Array<{
      idOffer: TOfferId;
      idProduct: TProductId;
      count: number;
    }>;
    tick: number;
  }

  export class NewOffer<T extends INewOfferOnMarket = INewOfferOnMarket> extends BaseActionWithPayload<T> {
    static type: Types = Types.newOffer;
    public constructor(data: T) {
      super(data);
    }
  }
  export class NewOfferAdded<T extends Array<IOffer> = Array<IOffer>> extends BaseActionWithPayload<T> {
    static type: Types = Types.newOfferAdded;
    public constructor(data: T) {
      super(data);
      this.kind = ActionKind.akEvent;
    }
  }
  export class FinishOffer<T extends Array<TOfferId> = Array<TOfferId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.finishOffer;
    public constructor(data: T) {
      super(data);
    }
  }
  export class RejectOffer<T extends Array<TOfferId> = Array<TOfferId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.rejectOffer;
    public constructor(data: T) {
      super(data);
    }
  }

  export class ApproveOffer<T extends Array<TOfferId> = Array<TOfferId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.approveOffer;
    public constructor(data: T) {
      super(data);
    }
  }
  export class InProgressOffer<T extends Array<TOfferId> = Array<TOfferId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.inProgressOffer;
    public constructor(data: T) {
      super(data);
    }
  }

  export interface INewOrderOnFactory {
    orders: Array<IOrder>;
    tick: number;
  }
  export class NewOrder<T extends INewOrderOnFactory = INewOrderOnFactory> extends BaseActionWithPayload<T> {
    static type: Types = Types.newOrder;
    public constructor(data: T) {
      super(data);
    }
  }
  export class FinishOrder<T extends Array<TOrderId> = Array<TOrderId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.finishOrder;
    public constructor(data: T) {
      super(data);
    }
  }
  export class InProgressOrder<T extends Array<TOrderId> = Array<TOrderId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.inProgressOrder;
    public constructor(data: T) {
      super(data);
    }
  }
  export class NewOrderAdded<T extends Array<IOrder> = Array<IOrder>> extends BaseActionWithPayload<T> {
    static type: Types = Types.newOrderAdded;
    public constructor(data: T) {
      super(data);
      // REVIEW ngxs example action event type
      this.kind = ActionKind.akEvent;
    }
  }
  export interface INewElementInOrderFinishData {
    orderId: TOrderId;
    made: number;
  }
  export class NewElementInOrderFinish<
    T extends Array<INewElementInOrderFinishData> = Array<INewElementInOrderFinishData>
  > extends BaseActionWithPayload<T> {
    static type: Types = Types.newElementFinish;
    public constructor(data: T) {
      super(data);
    }
  }
}
