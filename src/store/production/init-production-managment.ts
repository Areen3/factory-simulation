import * as fromModel from '../../model';
import { initialBaseStateDataModel } from '../base';

export const initialProductionMenagmentDataModel: fromModel.IProductionManagmentModel = {
  ...initialBaseStateDataModel,
  departamentLocalizations: [],
  productionLineLocalizations: [],
  lastDepartamentId: 0,
  lastLineId: 0,
  locationConditions: {
    [fromModel.EContinent.europe]: {
      localization: fromModel.EContinent.europe,
      salaryModifier: 1,
      maxDepartaments: 0,
      maxLinesPerDepartament: 0,
      openDepartaments: 0,
      departamentStartUpCost: 1500
    },
    [fromModel.EContinent.asia]: {
      localization: fromModel.EContinent.asia,
      salaryModifier: 0.4,
      maxDepartaments: 0,
      maxLinesPerDepartament: 0,
      openDepartaments: 0,
      departamentStartUpCost: 800
    },
    [fromModel.EContinent.africa]: {
      localization: fromModel.EContinent.africa,
      salaryModifier: 0.3,
      maxDepartaments: 1,
      maxLinesPerDepartament: 1,
      openDepartaments: 0,
      departamentStartUpCost: 500
    },
    [fromModel.EContinent.northAmerica]: {
      localization: fromModel.EContinent.northAmerica,
      salaryModifier: 1.2,
      maxDepartaments: 0,
      maxLinesPerDepartament: 0,
      openDepartaments: 0,
      departamentStartUpCost: 1800
    },
    [fromModel.EContinent.southAmerica]: {
      localization: fromModel.EContinent.southAmerica,
      salaryModifier: 0.7,
      maxDepartaments: 0,
      maxLinesPerDepartament: 0,
      openDepartaments: 0,
      departamentStartUpCost: 1100
    },
    [fromModel.EContinent.oceania]: {
      localization: fromModel.EContinent.oceania,
      salaryModifier: 0.8,
      maxDepartaments: 0,
      maxLinesPerDepartament: 0,
      openDepartaments: 0,
      departamentStartUpCost: 1200
    }
  }
};
