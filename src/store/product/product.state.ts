import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';
import { productIndex } from './init-product';

const initialProductDataModel: fromModel.IProductModel = {
  ...initialBaseStateDataModel,
  products: productIndex
};

export type getProductById = (id: number) => fromModel.IProduct;
@State<fromModel.IProductModel>({
  name: 'ProductsState',
  defaults: initialProductDataModel
})
@Injectable({
  providedIn: 'root'
})
export class ProductState extends BaseState<fromModel.IProductModel> {
  constructor(protected store: Store) {
    super(store);
  }
  @Selector()
  static productsArray$(state: fromModel.IProductModel): fromModel.TProductArray {
    return Object.values(state.products);
  }
  @Selector()
  static productsIndex$(state: fromModel.IProductModel): fromModel.TProductIndex {
    return state.products;
  }
  @Selector()
  static getProduct$(state: fromModel.IProductModel): getProductById {
    return (id: fromModel.TProductId) => {
      return state.products[id];
    };
  }
  @Action(fromModel.ProductAction.Update)
  updateProductAction(ctx: StateContext<fromModel.IProductModel>, action: fromModel.ProductAction.Update): void {
    const state = ctx.getState();
    const prod = state.products[action.payload.productId];
    ctx.patchState({ products: { ...state.products, [prod.productId]: prod } });
  }
}
