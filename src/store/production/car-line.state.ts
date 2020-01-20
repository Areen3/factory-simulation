import { Injectable } from '@angular/core';
import { NgxsOnInit, State, StateContext } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseLineProductionState, initialBaseLineDataModel } from './base-line.state';
import { registerLineProduction } from './decorators';
import { ProductState } from '../product/product.state';

const initialCarLineDataModel: fromModel.ICarProductionLineModel = {
  ...initialBaseLineDataModel,
  productionCapacity: 100,
  numberOfParallelProduction: 10
};

@State<fromModel.ICarProductionLineModel>({
  name: 'CarLineState',
  defaults: initialCarLineDataModel
})
@Injectable({
  providedIn: 'root'
})
@registerLineProduction(fromModel.EProductKind.car)
export class CarLineProductionState extends BaseLineProductionState<fromModel.ICarProductionLineModel> implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<fromModel.IBaseProductionLineModel>): void {
    this.processOrders(fromModel.EProductKind.car);
    const buffer = this.store.selectSnapshot(ProductState.buffers$);
    this.updateCapacity(ctx, buffer[fromModel.EProductKind.car]);
  }
  protected innerBufferChange(_ctx: StateContext<fromModel.IBaseProductionLineModel>, _data: fromModel.ProductAction.IBufferChange): any {
    if (_data.kind === fromModel.EProductKind.car) this.updateCapacity(_ctx, _data.value);
  }
}
