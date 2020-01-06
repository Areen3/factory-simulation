import { IIndexNumberType, TProductId } from '../type';

export enum EProductKind {
  motorcycle = 'motorcycle',
  car = 'car',
  van = 'van'
}

export interface IProduct {
  productId: TProductId;
  employmentVolume: number;
  name: string;
  costSummary: number;
  costForOneTick: number;
  profit: number;
  price: number;
  active: boolean;
  lineStartUpCost: number;
  numberOfParallelProduction: number;
  tickToProduceOneElement: number;
  borderColor: string;
  maxMarketDemand: number;
  productKind: EProductKind;
}

export type TProductArray = Array<IProduct>;
export type TProductIndex = IIndexNumberType<IProduct>;
export interface IProductModel {
  products: TProductIndex;
}
