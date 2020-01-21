import { TLineProductionId, TOrderId } from '../type';
import { BaseActionWithPayload } from './base';
import { EContinent } from '../state-model';
import { SingleLocation } from '@ngxs/store';
// REVIEW ngxs example how to ogranise actions
export namespace CompanyMenagmentAction {
  enum Types {
    // REVIEW ngxs example action command name convention
    updateFinance = 'cmd [CompanyMenagment] Update finance',
    budgetChange = 'cmd [CompanyMenagment] budget Change',
    expertModeChange = 'cmd [CompanyMenagment] expert mode Change',
    addCostFromLine = 'cmd [CompanyMenagment] add Cost From Line',
    addSaleFromLine = 'cmd [CompanyMenagment] add Sale From Line',
    increaseEmployment = 'cmd [CompanyMenagment] increase employment',
    decreaseEmployment = 'cmd [CompanyMenagment] decrease employment'
  }

  export interface IUpdateFinanceData {
    actualCosts: number;
    actualSale: number;
  }
  export class UpdateFinance<T extends IUpdateFinanceData = IUpdateFinanceData> extends BaseActionWithPayload<T> {
    static type: Types = Types.updateFinance;
    public constructor(data: T) {
      super(data);
    }
  }
  export class BudgetChange<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.budgetChange;
    public constructor(data: T) {
      super(data);
    }
  }
  export class ExpertModeChange<T extends boolean = boolean> extends BaseActionWithPayload<T> {
    static type: Types = Types.expertModeChange;
    public constructor(data: T) {
      super(data);
    }
  }
  export interface IAddCostFromLineData {
    costProduction: number;
    costSalary: number;
    orderId: TOrderId;
    lineId: TLineProductionId;
    tick: number;
  }
  export class AddCostFromLine<T extends Array<IAddCostFromLineData> = Array<IAddCostFromLineData>> extends BaseActionWithPayload<T> {
    static type: Types = Types.addCostFromLine;
    public constructor(data: T) {
      super(data);
    }
  }
  // REVIEW ngxs action with object parameters
  export interface IAddSaleFromLineData {
    orderId: TOrderId;
    lineId: TLineProductionId;
    product: string;
    containent: EContinent;
    sale: number;
    tick: number;
    location: SingleLocation;
  }
  export class AddSaleFromLine<T extends Array<IAddSaleFromLineData> = Array<IAddSaleFromLineData>> extends BaseActionWithPayload<T> {
    static type: Types = Types.addSaleFromLine;
    public constructor(data: T) {
      super(data);
    }
  }
  export class IncreaseEmployment<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.increaseEmployment;
    public constructor(data: T) {
      super(data);
    }
  }
  export class DecreaseEmployment<T extends number = number> extends BaseActionWithPayload<T> {
    static type: Types = Types.decreaseEmployment;
    public constructor(data: T) {
      super(data);
    }
  }
}
