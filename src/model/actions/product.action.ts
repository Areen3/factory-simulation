import { IProduct } from '../state-model';
import { BaseActionWithPayload } from './base';

export namespace ProductAction {
  enum Types {
    updateProduct = 'cmd [Product] Update product'
  }

  export class Update<T extends IProduct = IProduct> extends BaseActionWithPayload<T> {
    static type: Types = Types.updateProduct;
    public constructor(data: T) {
      super(data);
    }
  }
}
