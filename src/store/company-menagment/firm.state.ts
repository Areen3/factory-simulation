import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';
import { StaffState } from './staff.state';

const initialFirmDataModel: fromModel.IFirmModel = {
  ...initialBaseStateDataModel,
  actualCosts: 0,
  actualProfits: 10000,
  actualSale: 0,
  budget: 10000,
  expertMode: false,
  financeHistory: []
};

// REVIEW ngxs example decorator @state
@State<fromModel.IFirmModel>({
  name: 'FirmState',
  defaults: initialFirmDataModel,
  // REVIEW ngxs example static child state
  children: [StaffState]
})
// REVIEW ngxs example injection of state, useful for dynamic create without write it in forRoot
@Injectable({
  providedIn: 'root'
})
// REVIEW ngxs example state that inherited from base
export class FirmState extends BaseState<fromModel.IFirmModel> {
  constructor(protected store: Store) {
    super(store);
  }
  // REVIEW ngxs example simple decorator @selector
  @Selector()
  static actualProfits$(state: fromModel.IFirmModel): number {
    return state.actualProfits;
  }
  @Selector()
  static actualBudget$(state: fromModel.IFirmModel): number {
    return state.budget;
  }
  @Selector()
  static ekspertMode$(state: fromModel.IFirmModel): boolean {
    return state.expertMode;
  }
  // REVIEW ngxs example decorator @state, useful for return all state but dengerous beacuse it monitoring all changes in children
  @Selector()
  static state$<T>(state: T): T {
    return state;
  }
  // REVIEW ngxs example decorator @action
  @Action(fromModel.CompanyMenagmentAction.UpdateFinance)
  updateFinance(ctx: StateContext<fromModel.IFirmModel>, action: fromModel.CompanyMenagmentAction.UpdateFinance): void {
    const state = ctx.getState();
    // REVIEW ngxs example for changing state
    ctx.patchState({
      actualCosts: state.actualCosts + action.payload.actualCosts,
      actualProfits: state.actualSale + action.payload.actualSale - (state.actualCosts + action.payload.actualCosts) + state.budget,
      actualSale: state.actualSale + action.payload.actualSale
    });
  }
  @Action(fromModel.CompanyMenagmentAction.ExpertModeChange)
  expertModeChange(ctx: StateContext<fromModel.IFirmModel>, action: fromModel.CompanyMenagmentAction.ExpertModeChange): void {
    ctx.patchState({ expertMode: action.payload });
  }
  @Action(fromModel.CompanyMenagmentAction.BudgetChange)
  budgetChange(ctx: StateContext<fromModel.IFirmModel>, action: fromModel.CompanyMenagmentAction.BudgetChange): void {
    const state = ctx.getState();
    ctx.patchState({
      budget: action.payload,
      actualProfits: state.actualSale - state.actualCosts + action.payload
    });
  }
  @Action(fromModel.CompanyMenagmentAction.AddCostFromLine)
  addCostFromLine(ctx: StateContext<fromModel.IFirmModel>, action: fromModel.CompanyMenagmentAction.AddCostFromLine): any {
    const state = ctx.getState();
    const newFinance = action.payload.map((cost: fromModel.CompanyMenagmentAction.IAddCostFromLineData) => {
      const finHistory: fromModel.IFinanceHistory = {
        orderId: cost.orderId,
        costSummary: cost.costProduction + cost.costSalary,
        costProduction: cost.costProduction,
        costSalary: cost.costSalary,
        lineId: cost.lineId,
        sale: 0,
        tick: cost.tick
      };
      return finHistory;
    });
    // REVIEW js example of joining tables
    const sumFinance = state.financeHistory.concat(newFinance);
    ctx.patchState({
      financeHistory: sumFinance.length <= 100 ? sumFinance : sumFinance.slice(sumFinance.length - 100, 100)
    });
    // REVIEW js example of simple sum array
    const actualCosts: number = newFinance.reduce((acc, curr) => acc + curr.costSummary, 0);
    return ctx.dispatch(new fromModel.CompanyMenagmentAction.UpdateFinance({ actualCosts, actualSale: 0 }));
  }
  @Action(fromModel.CompanyMenagmentAction.AddSaleFromLine)
  addSaleFromLine(ctx: StateContext<fromModel.IFirmModel>, action: fromModel.CompanyMenagmentAction.AddSaleFromLine): any {
    const state = ctx.getState();
    const newFinance = action.payload.map((cost: fromModel.CompanyMenagmentAction.IAddSaleFromLineData) => {
      const finHistory: fromModel.IFinanceHistory = {
        orderId: cost.orderId,
        sale: cost.sale,
        costProduction: 0,
        costSalary: 0,
        costSummary: 0,
        lineId: cost.lineId,
        tick: cost.tick
      };
      return finHistory;
    });
    // REVIEW js example of joining tables by spread
    ctx.patchState({ financeHistory: [...state.financeHistory, ...newFinance] });
    const actualSale: number = newFinance.reduce((acc, curr) => acc + curr.sale, 0);
    // REVIEW ngxs example of return observable action, system wil wait for execute these action
    return ctx.dispatch(new fromModel.CompanyMenagmentAction.UpdateFinance({ actualCosts: 0, actualSale }));
  }
}
