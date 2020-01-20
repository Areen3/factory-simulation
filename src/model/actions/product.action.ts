import { IProduct, EProductKind } from '../state-model';
import { BaseActionWithPayload } from './base';
import { ActionKind } from '@ngxs/store';
import { TProductId } from '../type';

export namespace ProductAction {
  enum Types {
    updateProduct = 'cmd [Product] Update product',
    bufferChange = 'cmd [Product] buffer change',
    tickToProduceOneElement = 'cmd [Product] tick To Produce One Element',
    numberOfParallelProduction = 'cmd [Product] number Of Parallel Production',
    allNumberOfParallel = 'cmd [Product] allNumberOfParallel',
    allTickToProduce = 'cmd [Product] allTickToProduce',
    allMarketDemand = 'cmd [Product] AllMarketDemand'
  }

  export class Update<T extends IProduct = IProduct> extends BaseActionWithPayload<T> {
    static type: Types = Types.updateProduct;
    public constructor(data: T) {
      super(data);
    }
  }
  export class TickToProduceOneElement<T extends IProduct = IProduct> extends BaseActionWithPayload<T> {
    static type: Types = Types.tickToProduceOneElement;
    public constructor(data: T) {
      super(data);
    }
  }
  export interface INumberOfParallelProductionData {
    productId: TProductId;
    numberOfParallelProduction: number;
  }
  export class NumberOfParallelProduction<
    T extends INumberOfParallelProductionData = INumberOfParallelProductionData
  > extends BaseActionWithPayload<T> {
    static type: Types = Types.numberOfParallelProduction;
    public constructor(data: T) {
      super(data);
      this.kind = ActionKind.akEvent;
    }
  }
  export interface IBufferChange {
    value: number;
    kind: EProductKind;
  }
  export class BufferChange<T extends IBufferChange = IBufferChange> extends BaseActionWithPayload<T> {
    static type: Types = Types.numberOfParallelProduction;
    public constructor(data: T) {
      super(data);
    }
  }

  export class AllNumberOfParallel<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.allNumberOfParallel;
    public constructor(data: T) {
      super(data);
    }
  }
  export class AllTickToProduce<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.allTickToProduce;
    public constructor(data: T) {
      super(data);
    }
  }
  export class AllMarketDemand<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.allMarketDemand;
    public constructor(data: T) {
      super(data);
    }
  }
}
