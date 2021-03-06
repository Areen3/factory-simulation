import { Injectable } from '@angular/core';
import { NgxsOnInit, State, StateContext } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseLineProductionState, initialBaseLineDataModel } from './base-line.state';
import { registerLineProduction } from './decorators';
import { ProductState } from '../product/product.state';

export const initialVanLineDataModel: fromModel.IVanProductionLineModel = {
  ...initialBaseLineDataModel,
  productionCapacity: 100,
  numberOfParallelProduction: 10
};

@State<fromModel.IVanProductionLineModel>({
  name: 'VanLineState',
  defaults: initialVanLineDataModel
})
@Injectable({
  providedIn: 'root'
})
@registerLineProduction(fromModel.EProductKind.van)
export class VanLineProductionState extends BaseLineProductionState<fromModel.IVanProductionLineModel> implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<fromModel.IBaseProductionLineModel>): void {
    this.processOrders(fromModel.EProductKind.van);
    const buffer = this.store.selectSnapshot(ProductState.buffers$);
    this.updateCapacity(ctx, buffer[fromModel.EProductKind.car]);
  }
  protected innerBufferChange(_ctx: StateContext<fromModel.IBaseProductionLineModel>, _data: fromModel.ProductAction.IBufferChange): any {
    if (_data.kind === fromModel.EProductKind.van) this.updateCapacity(_ctx, _data.value);
  }
}
