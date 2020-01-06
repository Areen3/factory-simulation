import { Injectable } from '@angular/core';
import { NgxsOnInit, State } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseLineProductionState, initialBaseLineDataModel } from './base-line.state';
import { registerLineProduction } from './decorators';

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
  ngxsOnInit(): void {
    this.processOrders(fromModel.EProductKind.van);
  }
}
