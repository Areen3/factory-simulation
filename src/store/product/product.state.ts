import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';
import { productIndex, updateProductItem } from './init-product';

const initialProductDataModel: fromModel.IProductModel = {
  ...initialBaseStateDataModel,
  products: productIndex,
  // REVIEW js example of inicjalization index of string
  buffers: {
    [fromModel.EProductKind.motorcycle]: 10,
    [fromModel.EProductKind.car]: 40,
    [fromModel.EProductKind.van]: 20
  }
};

export type getProductById = (id: number) => fromModel.IProduct;
// REVIEW ngxs example using model declaration part 1
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
    // REVIEW js example of changing index map to array
    return Object.values(state.products);
  }
  @Selector()
  // REVIEW ngxs example using model declaration part 2
  static productsIndex$(state: fromModel.IProductModel): fromModel.TProductIndex {
    return state.products;
  }
  @Selector()
  static buffers$(state: fromModel.IProductModel): fromModel.TProductBufferIndex {
    return state.buffers;
  }
  @Selector()
  // REVIEW ngxs example of parameterized  selector
  static getProduct$(state: fromModel.IProductModel): getProductById {
    return (id: fromModel.TProductId) => {
      return state.products[id];
    };
  }
  @Action(fromModel.ProductAction.Update)
  // REVIEW ngxs example using model declaration part 3
  updateProductAction(ctx: StateContext<fromModel.IProductModel>, action: fromModel.ProductAction.Update): any {
    const state = ctx.getState();
    const prod = updateProductItem(action.payload);
    // REVIEW ngxs example of update one element in index structure
    ctx.patchState({ products: { ...state.products, [prod.productId]: prod } });
    if (state.products[prod.productId].numberOfParallelProduction !== action.payload.numberOfParallelProduction) {
      return this.store.dispatch(
        new fromModel.ProductAction.NumberOfParallelProduction({
          productId: prod.productId,
          numberOfParallelProduction: prod.numberOfParallelProduction
        })
      );
    }
  }
  @Action(fromModel.ProductAction.BufferChange)
  bufferChange(ctx: StateContext<fromModel.IProductModel>, action: fromModel.ProductAction.BufferChange): any {
    const state = ctx.getState();
    ctx.patchState({ buffers: { ...state.buffers, [action.payload.kind]: action.payload.value } });
  }
  @Action(fromModel.ProductAction.AllNumberOfParallel)
  allNumberOfParallel(ctx: StateContext<fromModel.IProductModel>, action: fromModel.ProductAction.AllNumberOfParallel): any {
    const state = ctx.getState();
    // REVIEW js example of recude with type params declaration
    const newProducts = Object.values(state.products).reduce((acc: fromModel.TProductIndex, curr: fromModel.IProduct) => {
      curr.numberOfParallelProduction = action.payload;
      acc[curr.productId] = curr;
      return acc;
    }, {});
    ctx.patchState({ products: newProducts });
    return this.store.dispatch(
      new fromModel.ProductAction.NumberOfParallelProduction({ numberOfParallelProduction: action.payload, productId: -1 })
    );
  }
  @Action(fromModel.ProductAction.AllTickToProduce)
  allTickToProduce(ctx: StateContext<fromModel.IProductModel>, action: fromModel.ProductAction.AllTickToProduce): any {
    const state = ctx.getState();
    const newProducts = Object.values(state.products).reduce((acc: fromModel.TProductIndex, curr: fromModel.IProduct) => {
      curr.tickToProduceOneElement = action.payload;
      acc[curr.productId] = updateProductItem(curr);
      return acc;
    }, {});
    ctx.patchState({ products: newProducts });
  }
  @Action(fromModel.ProductAction.AllMarketDemand)
  allMarketDemand(ctx: StateContext<fromModel.IProductModel>, action: fromModel.ProductAction.AllMarketDemand): any {
    const state = ctx.getState();
    const newProducts = Object.values(state.products).reduce((acc: fromModel.TProductIndex, curr: fromModel.IProduct) => {
      curr.maxMarketDemand = action.payload;
      acc[curr.productId] = curr;
      return acc;
    }, {});
    ctx.patchState({ products: newProducts });
  }
}
