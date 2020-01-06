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
  lineProductionId: fromModel.TLineProductionId;
  departementId: fromModel.TDepartamentId;
  offer: fromModel.IOffer;
}
export interface IDataConfition {
  lines: fromModel.TProductionLineDescription;
  dep: fromModel.TDepartamentLocalizations;
  conditions: fromModel.TContainentsIndex;
}

export interface IIsPosibilityToMake {
  posibiliyt: boolean;
  location: SingleLocation;
}
