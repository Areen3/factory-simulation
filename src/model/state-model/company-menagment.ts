import { TLineProductionId, TOrderId } from '../type';

export interface IFinanceHistory {
  costProduction: number;
  costSalary: number;
  costSummary: number;
  orderId: TOrderId;
  lineId: TLineProductionId;
  sale: number;
  tick: number;
}
export type TFinanceHistoryArray = Array<IFinanceHistory>;
export interface IFirmModel {
  budget: number;
  actualCosts: number;
  actualProfits: number;
  actualSale: number;
  financeHistory: TFinanceHistoryArray;
}

export interface IStaffModel {
  employmentVolume: number;
  salary: number;
}
