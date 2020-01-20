import { SingleLocation } from '@ngxs/store';

import * as fromModel from '../../model';

export enum EWhatShoudDoWithOffer {
  rejectOffer = 'rejectOffer',
  doWithExistingLine = 'doWithExistingLine',
  createNewDepartamentWhitLine = 'createNewDepartamentWhitLine',
  createNewLineWhitExistingDepartament = 'createNewLineWhitExistingDepartament'
}

export interface IWhatShoudDoWithOffer {
  whatDo: EWhatShoudDoWithOffer;
  localization: SingleLocation;
  continent: fromModel.EContinent;
  lineProductionId: fromModel.TLineProductionId;
  departementId: fromModel.TDepartamentId;
  offer: fromModel.IOffer;
}
export interface IDataConfiguration {
  lines: fromModel.TProductionLineLocalization;
  dep: fromModel.TDepartamentLocalizations;
  conditions: fromModel.TContainentsIndex;
}

export interface IIsPosibilityToMake {
  posibiliyt: boolean;
  location: SingleLocation;
}
export interface IDoWithNewDepartament {
  isPosibility: boolean;
  continent?: fromModel.EContinent;
}
export interface IDoWithNewLine {
  isPosibility: boolean;
  dep?: fromModel.IDepartamentDescription;
}
export interface IDoWithLine {
  isPosibility: boolean;
  lineDescription?: fromModel.ILineDescription;
}
