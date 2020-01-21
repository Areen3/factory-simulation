import { IIndexStringType, TOfferId, TOrderId, TProductId } from '../type';
import { IBaseState } from './base';

export enum EOfferStatus {
  new = 'new',
  rejected = 'rejected',
  approved = 'approved',
  inProgress = 'inProgress',
  finished = 'finished'
}
export enum EOrderStatus {
  new = 'new',
  inProgress = 'inProgress',
  finished = 'finished'
}

export interface IOffer {
  quantity: number;
  status: EOfferStatus;
  offerId: TOfferId;
  productId: TProductId;
  tick: number;
}
export interface IOrder {
  quantityPlanned: number;
  qantityRemainded: number;
  qantityMade: number;
  status: EOrderStatus;
  offerId: TOfferId;
  orderId: TOrderId;
  productId: TProductId;
  tick: number;
}
export type TIndexOfferType = IIndexStringType<IOffer>;
export type TIndexOrderType = IIndexStringType<IOrder>;
export interface IOfferRatesModel {
  new: number;
  finished: number;
  rejected: number;
  approved: number;
  inProgress: number;
}
export interface IOrderRatesModel {
  new: number;
  inProgress: number;
  finished: number;
}
export interface IOfferModel extends IBaseState {
  offers: TIndexOfferType;
  rates: IOfferRatesModel;
}
export interface IOrderModel extends IBaseState {
  // REVIEW js example index type declaration in storyge
  orders: TIndexOrderType;
  rates: IOrderRatesModel;
}

export interface ISaleShedulerState extends IBaseState {}
