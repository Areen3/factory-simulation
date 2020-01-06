import { Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';

const initialStaffDataModel: fromModel.IStaffModel = {
  ...initialBaseStateDataModel,
  employmentVolume: 0,
  salary: 10
};

@State<fromModel.IStaffModel>({
  name: 'StaffState',
  defaults: initialStaffDataModel
})
@Injectable({
  providedIn: 'root'
})
export class StaffState extends BaseState<fromModel.IStaffModel> {
  constructor(protected store: Store) {
    super(store);
  }
  @Action(fromModel.CompanyMenagmentAction.IncreaseEmployment)
  increaseEmployment(ctx: StateContext<fromModel.IStaffModel>, action: fromModel.CompanyMenagmentAction.IncreaseEmployment): void {
    const state = ctx.getState();
    ctx.patchState({ employmentVolume: state.employmentVolume + action.payload });
  }
  @Action(fromModel.CompanyMenagmentAction.DecreaseEmployment)
  decreaseEmployment(ctx: StateContext<fromModel.IStaffModel>, action: fromModel.CompanyMenagmentAction.DecreaseEmployment): void {
    const state = ctx.getState();
    ctx.patchState({ employmentVolume: state.employmentVolume - action.payload });
  }
}
