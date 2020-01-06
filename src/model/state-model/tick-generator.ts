import { TProductId } from '../type';
import { IBaseState } from './base';

export interface ITickGeneratorModel extends IBaseState {
  speed: number;
  lastTick: number;
  run: boolean;
}

export interface IProductRequest {
  actualRequest: number;
  productId: TProductId;
  sinusDegrees: number;
  tick: number;
}
export type TProductRequestArray = Array<IProductRequest>;
export interface IMarketGeneratorModel extends IBaseState {
  productRequest: TProductRequestArray;
}
