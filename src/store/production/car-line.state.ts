import { Injectable } from '@angular/core';
import { NgxsOnInit, State } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseLineProductionState, initialBaseLineDataModel } from './base-line.state';
import { registerLineProduction } from './decorators';

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
  ngxsOnInit(): void {
    this.processOrders(fromModel.EProductKind.car);
  }
}
