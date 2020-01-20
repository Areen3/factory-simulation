import { Injectable } from '@angular/core';
import { NgxsOnInit, State, Store, Actions, StateContext } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseLineProductionState, initialBaseLineDataModel } from './base-line.state';
import { registerLineProduction } from './decorators';
import { ProductState } from '../product/product.state';

const initialMotocycleLineDataModel: fromModel.IMotocycleProductionLineModel = {
  ...initialBaseLineDataModel,
  productionCapacity: 5,
  numberOfParallelProduction: 1
};

@State<fromModel.IMotocycleProductionLineModel>({
  name: 'MotocycleLineState',
  defaults: initialMotocycleLineDataModel
})
@Injectable({
  providedIn: 'root'
})
@registerLineProduction(fromModel.EProductKind.motorcycle)
export class MotycycleLineProductionState extends BaseLineProductionState<fromModel.IMotocycleProductionLineModel> implements NgxsOnInit {
  constructor(protected store: Store, protected actions$: Actions) {
    super(store, actions$);
  }
  ngxsOnInit(ctx: StateContext<fromModel.IBaseProductionLineModel>): void {
    this.processOrders(fromModel.EProductKind.motorcycle);
    const buffer = this.store.selectSnapshot(ProductState.buffers$);
    this.updateCapacity(ctx, buffer[fromModel.EProductKind.motorcycle]);
  }
  protected innerBufferChange(_ctx: StateContext<fromModel.IBaseProductionLineModel>, _data: fromModel.ProductAction.IBufferChange): any {
    if (_data.kind === fromModel.EProductKind.motorcycle) this.updateCapacity(_ctx, _data.value);
  }
}
