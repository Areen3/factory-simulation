import { Injectable } from '@angular/core';
import { Action, Actions, Selector, State, StateContext, Store } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';

const initialDepartamentDataModel: fromModel.IDepartamentModel = {
  ...initialBaseStateDataModel,
  departamentId: '',
  employment: 0,
  continent: fromModel.EContinent.europe,
  openLines: 0
};

@State<fromModel.IDepartamentModel>({
  name: 'departamentState',
  defaults: initialDepartamentDataModel
})
@Injectable({
  providedIn: 'root'
})
export class DepartamentState extends BaseState<fromModel.IDepartamentModel> {
  constructor(protected store: Store, protected actions$: Actions) {
    super(store);
  }
  @Selector()
  static departamentId$(state: fromModel.IDepartamentModel): fromModel.TDepartamentId {
    return state.departamentId;
  }
  @Selector()
  static dataToGui$(state: fromModel.IDepartamentModel): fromModel.IDepartamentGui {
    // console.log(`odpalono selektor dataToGui`);
    return { openLines: state.openLines, continent: state.continent, departamentId: state.departamentId, employment: state.employment };
  }

  @Action(fromModel.ProductionAction.InitDepartamentData)
  initDepartamentData(ctx: StateContext<fromModel.IDepartamentModel>, action: fromModel.ProductionAction.InitDepartamentData): void {
    const { continent, deparamentId, employment }: fromModel.ProductionAction.IDepartamentDataAction = action.payload;
    ctx.patchState({ continent, departamentId: deparamentId, employment });
  }
  @Action(fromModel.ProductionAction.AddLine)
  addLine(ctx: StateContext<fromModel.IDepartamentModel>): void {
    const state = ctx.getState();
    ctx.patchState({ openLines: state.openLines + 1 });
  }
  @Action(fromModel.ProductionAction.RemoveLine)
  removeLine(ctx: StateContext<fromModel.IDepartamentModel>): void {
    const state = ctx.getState();
    ctx.patchState({ openLines: state.openLines - 1 });
  }
}
