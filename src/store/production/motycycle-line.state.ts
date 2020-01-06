import { Injectable } from '@angular/core';
import { NgxsOnInit, State } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseLineProductionState, initialBaseLineDataModel } from './base-line.state';
import { registerLineProduction } from './decorators';

const initialMotocycleLineDataModel: fromModel.IMotocycleProductionLineModel = {
  ...initialBaseLineDataModel,
  productionCapacity: 5,
  numberOfParallelProduction: 10
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
  ngxsOnInit(): void {
    this.processOrders(fromModel.EProductKind.motorcycle);
  }
}
