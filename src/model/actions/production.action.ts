import { EContinent, IContainent, IOrder, IProduct, IDepartamentModel } from '../state-model';
import { TDepartamentId, TLineProductionId, TOrderId, TProductId } from '../type';
import { BaseActionWithPayload, BaseAction } from './base';

export namespace ProductionAction {
  enum Types {
    initDepartamentData = 'cmd [Production] init Departament Data',
    initLindeProductionData = 'cmd [Production] init Line Production Data',
    addLine = 'cmd [Production] add Line',
    removeLine = 'cmd [Production] remove Line',
    removeLineFromProduction = 'cmd [Production] remove Line from production',
    removeDepartamentfromProduction = 'cmd [Production] remove Departament from production',
    addDepartament = 'cmd [Production] add Departament',
    removeDepartament = 'cmd [Production] remove Departament',
    addOrderToQueue = 'cmd [Production] add Order To Queue',
    removeOrderFromQueue = 'cmd [Production] remove Order From Queue',
    startOrder = 'cmd [Production] start Order',
    finischOrder = 'cmd [Production] finish Order',
    clearOrderInProduce = 'cmd [Production] clearOrderInProduce',
    processOneTick = 'cmd [Production] process One Tick',
    updateContainents = 'cmd [Production] update Containents',
    updateMaxDep = 'cmd [Production] update max dep',
    updateMaxLine = 'cmd [Production] update max line'
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

  export class InitLineProductionData<T extends ILineProductionDataAction = ILineProductionDataAction> extends BaseActionWithPayload<T> {
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
  export class RemoveLineFromProduction<T extends TLineProductionId = TLineProductionId> extends BaseActionWithPayload<T> {
    static type: Types = Types.removeLineFromProduction;
    public constructor(data: T) {
      super(data);
    }
  }

  export class AddDepartament<T extends EContinent = EContinent> extends BaseActionWithPayload<T> {
    static type: Types = Types.addDepartament;
    public constructor(data: T) {
      super(data);
    }
  }
  export class RemoveDepartament<T extends IDepartamentModel = IDepartamentModel> extends BaseActionWithPayload<T> {
    static type: Types = Types.removeDepartament;
    public constructor(data: T) {
      super(data);
    }
  }
  export class RemoveDepartamentFromProduction<T extends TDepartamentId = TDepartamentId> extends BaseActionWithPayload<T> {
    static type: Types = Types.removeDepartamentfromProduction;
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
  export class ClearOrderInProduce<T extends Array<TOrderId> = Array<TOrderId>> extends BaseActionWithPayload<T> {
    static type: Types = Types.clearOrderInProduce;
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
  export class UpdateContainents<T extends IContainent = IContainent> extends BaseActionWithPayload<T> {
    static type: Types = Types.updateContainents;
    public constructor(data: T) {
      super(data);
    }
  }
  export class UpdateMaxDep<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.updateMaxDep;
    public constructor(data: T) {
      super(data);
    }
  }
  export class UpdateMaxLine<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.updateMaxLine;
    public constructor(data: T) {
      super(data);
    }
  }
}
