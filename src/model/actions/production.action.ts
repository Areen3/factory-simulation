import { EContinent, IOrder, IProduct } from '../state-model';
import { TDepartamentId, TLineProductionId, TOrderId, TProductId } from '../type';
import { BaseAction, BaseActionWithPayload } from './base';

export namespace ProductionAction {
  enum Types {
    initDepartamentData = 'cmd [Production] init Departament Data',
    initLindeProductionData = 'cmd [Production] init Line Production Data',
    addLine = 'cmd [Production] add Line',
    removeLine = 'cmd [Production] remove Line',
    addDepartament = 'cmd [Production] add Departament',
    removeDepartament = 'cmd [Production] remove Departament',
    addOrderToQueue = 'cmd [Production] add Order To Queue',
    removeOrderFromQueue = 'cmd [Production] remove Order From Queue',
    startOrder = 'cmd [Production] start Order',
    finischOrder = 'cmd [Production] finish Order',
    processOneTick = 'cmd [Production] process One Tick'
  }
  export interface IDepartamentDataAction {
    employment: number;
    deparamentId: TDepartamentId;
    continent: EContinent;
  }

  export class InitDepartamentData<T extends IDepartamentDataAction = IDepartamentDataAction> extends BaseActionWithPayload<T> {
    static type: Types = Types.initDepartamentData;
    public constructor(data: T) {
      super(data);
    }
  }
  export interface ILineProductionDataAction {
    lineId: TLineProductionId;
    productId: TProductId;
    numberOfParallelProduction: number;
    departamentId: TDepartamentId;
  }

  export class InitLindeProductionData<T extends ILineProductionDataAction = ILineProductionDataAction> extends BaseActionWithPayload<T> {
    static type: Types = Types.initLindeProductionData;
    public constructor(data: T) {
      super(data);
    }
  }

  export class AddLine extends BaseAction {
    static type: Types = Types.addLine;
  }

  export class RemoveLine extends BaseAction {
    static type: Types = Types.removeLine;
  }

  export class AddDepartament<T extends EContinent = EContinent> extends BaseActionWithPayload<T> {
    static type: Types = Types.addDepartament;
    public constructor(data: T) {
      super(data);
    }
  }
  export class RemoveDepartament<T extends EContinent = EContinent> extends BaseActionWithPayload<T> {
    static type: Types = Types.removeDepartament;
    public constructor(data: T) {
      super(data);
    }
  }

  export interface IAddOrderToQueueProductionData {
    product: IProduct;
    orders: Array<IOrder>;
  }
  export class AddOrderToQueueProduction<
    T extends IAddOrderToQueueProductionData = IAddOrderToQueueProductionData
  > extends BaseActionWithPayload<T> {
    static type: Types = Types.addOrderToQueue;
    public constructor(data: T) {
      super(data);
    }
  }
  export class RemoveOrderFromQueue<T extends Array<TOrderId> = Array<TOrderId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.removeOrderFromQueue;
    public constructor(data: T) {
      super(data);
    }
  }
  export class StartOrderEmployment<T extends IOrder = IOrder> extends BaseActionWithPayload<T> {
    static type: Types = Types.startOrder;
    public constructor(data: T) {
      super(data);
    }
  }
  export class FinishOrderEmployment<T extends IOrder = IOrder> extends BaseActionWithPayload<T> {
    static type: Types = Types.finischOrder;
    public constructor(data: T) {
      super(data);
    }
  }
  export interface IProcessOneTick {
    tick: number;
  }
  export class ProcessOneTick<T extends IProcessOneTick = IProcessOneTick> extends BaseActionWithPayload<T> {
    static type: Types = Types.processOneTick;
    public constructor(data: T) {
      super(data);
    }
  }
}
