import { SingleLocation } from '@ngxs/store';

import { IIndexStringType, TDepartamentId, TLineProductionId, TOrderId, TProductId } from '../type';

export enum EContinent {
  europe = 'Europe',
  asia = 'Asia',
  northAmerica = 'North America',
  southAmerica = 'South America',
  africa = 'Africa',
  oceania = 'Oceania'
}
export interface ILineDescription {
  location: SingleLocation;
  productId: TProductId;
  lineId: TLineProductionId;
  departamentId: TDepartamentId;
}
export interface IDepartamentDescription {
  localization: SingleLocation;
  departamentId: TDepartamentId;
}

export interface IContainent {
  localization: EContinent;
  salaryModifier: number;
  maxDepartaments: number;
  maxLinesPerDepartament: number;
  openDepartaments: number;
  departamentStartUpCost: number;
}

export type TProductionLineLocalization = Array<ILineDescription>;
export type TDepartamentLocalizations = Array<IDepartamentDescription>;
export type TContainentsIndex = IIndexStringType<IContainent>;
export type TContainentsArray = Array<IContainent>;
export interface IProductionManagmentModel {
  departamentLocalizations: TDepartamentLocalizations;
  productionLineLocalizations: TProductionLineLocalization;
  locationConditions: TContainentsIndex;
  lastDepartamentId: number;
  lastLineId: number;
}

export interface IInProduceOnTheLine {
  orderId: TOrderId;
  actualProgressTick: number;
  lineId: TLineProductionId;
  tickTaken: number;
  tickRemaind: number;
  orderCleared: boolean;
}

export type TInProduceOnTheLineIndex = IIndexStringType<IInProduceOnTheLine>;
export interface IBaseProductionLineModel {
  lineId: TLineProductionId;
  productId: TProductId;
  productionCapacity: number;
  freeCapacity: number;
  numberOfParallelProduction: number;
  production: TInProduceOnTheLineIndex;
  departamentId: TDepartamentId;
  ticksWithoutOrders: number;
}
export interface IMotocycleProductionLineModel extends IBaseProductionLineModel {}
export interface ICarProductionLineModel extends IBaseProductionLineModel {}
export interface IVanProductionLineModel extends IBaseProductionLineModel {}

export interface ILineGui
  extends // REVIEW js example of pick type using
  Pick<IBaseProductionLineModel, 'lineId' | 'productId' | 'productionCapacity' | 'freeCapacity' | 'numberOfParallelProduction'> {}

export interface IDepartamentModel {
  employment: number;
  departamentId: TDepartamentId;
  continent: EContinent;
  openLines: number;
}
export interface IDepartamentGui extends Pick<IDepartamentModel, 'departamentId' | 'continent' | 'openLines' | 'employment'> {}

export interface IInProduceOnTheLine {
  lineId: TLineProductionId;
  orderId: TOrderId;
  tickTaken: number;
  tickRemaind: number;
  tickToProduceOneElement: number;
}
