import { SingleLocation } from '@ngxs/store';

import * as fromModel from '../../model';
import { EWhatShoudDoWithOffer, IDataConfiguration, IWhatShoudDoWithOffer } from './production-managment.model';

export function findChipestDepartament(locationConditions: fromModel.IIndexStringType<fromModel.IContainent>): fromModel.IContainent {
  const depCondition = Object.values(locationConditions)
    .sort((a, b) => a.salaryModifier - b.salaryModifier)
    .find(() => true);
  if (depCondition === undefined) throw new Error('Shoud be at most one departament available');
  return depCondition;
}
export function findLinesWithChipestOrder(
  offer: fromModel.IOffer,
  departaments: Array<fromModel.IDepartamentModel>,
  data: IDataConfiguration
): fromModel.TProductionLineLocalization {
  return data.lines
    .filter(line => line.productId === offer.productId)
    .map(line => {
      const departament = departaments.find(item => item.departamentId === line.departamentId);
      const locationCondition = Object.values(data.conditions).find(dep => dep.localization === departament!.continent);
      return { line, salaryModifier: locationCondition!.salaryModifier };
    })
    .sort((a, b) => a.salaryModifier - b.salaryModifier)
    .map(item => item.line);
}
interface IDataToCalculateFinanceResult {
  costArray: Array<fromModel.CompanyMenagmentAction.IAddCostFromLineData>;
  saleArray: Array<fromModel.CompanyMenagmentAction.IAddSaleFromLineData>;
}
export function getDataToCalculateFinance(
  productKind: fromModel.EProductKind,
  productionManagment: fromModel.IProductionManagmentModel,
  lines: Array<fromModel.IBaseProductionLineModel>,
  departaments: Array<fromModel.IDepartamentModel>,
  products: fromModel.TProductIndex,
  staff: fromModel.IStaffModel
): IDataToCalculateFinanceResult {
  return lines
    .filter(line => products[line.productId].productKind === productKind)
    .map(line => {
      const product = products[line.productId];
      const departament = departaments.find(dep => dep.departamentId === line.departamentId);
      const produceInProgress = Object.values(line.production)
        .filter(inProduce => inProduce.tickTaken > 0 && !inProduce.orderCleared)
        .map(inProduce => {
          const cost: fromModel.CompanyMenagmentAction.IAddCostFromLineData = {
            costProduction: product.costForOneTick,
            costSalary:
              product.employmentVolume * staff.salary * productionManagment.locationConditions[departament!.continent].salaryModifier,
            lineId: line.lineId,
            orderId: inProduce.orderId,
            tick: inProduce.actualProgressTick
          };
          return cost;
        });
      const produceFinished = Object.values(line.production)
        .filter(inProduce => inProduce.tickRemaind === 0)
        .map(inProduce => {
          const cost: fromModel.CompanyMenagmentAction.IAddSaleFromLineData = {
            sale: product.price * Math.floor(inProduce.tickTaken / inProduce.tickToProduceOneElement),
            lineId: line.lineId,
            product: product.name,
            containent: departament!.continent,
            orderId: inProduce.orderId,
            tick: inProduce.actualProgressTick,
            location: productionManagment.productionLineLocalizations.find(item => item.lineId === line.lineId)!.location
          };
          return cost;
        });
      return { costArray: produceInProgress, saleArray: produceFinished };
    })
    .reduce(
      (acc: IDataToCalculateFinanceResult, curr): IDataToCalculateFinanceResult => ({
        costArray: [...acc.costArray, ...curr.costArray],
        saleArray: [...acc.saleArray, ...curr.saleArray]
      }),
      { costArray: [], saleArray: [] }
    );
}

interface IDataToReorganiseOrdersAfterTickResult {
  lineId: fromModel.TLineProductionId;
  newOrders: number;
  finishedOrders: Array<fromModel.TOrderId>;
  startedOrders: Array<fromModel.TOrderId>;
  localization: SingleLocation;
}

export function reorganiseOrdersAfterTick(
  prodMenagmentState: fromModel.IProductionManagmentModel,
  lines: Array<fromModel.IBaseProductionLineModel>
): Array<IDataToReorganiseOrdersAfterTickResult> {
  return lines.map(
    (line): IDataToReorganiseOrdersAfterTickResult => {
      const ordersClosed = Object.values(line.production)
        .filter(inProduce => inProduce.tickRemaind === 0)
        .map(inProduce => inProduce.orderId);
      // if (ordersClosed.filter(order => order === '2/BMW RT').length > 0) {
      //   console.log('będzie 2');
      // }
      const ordersStarted = Object.values(line.production)
        .filter(inProduce => inProduce.tickTaken === 1)
        .map(inProduce => inProduce.orderId);
      return {
        finishedOrders: ordersClosed,
        startedOrders: ordersStarted,
        lineId: line.lineId,
        localization: prodMenagmentState.productionLineLocalizations.find(item => item.lineId === line.lineId)!.location,
        newOrders: line.productionCapacity - ordersClosed.length
      };
    }
  );
}

export function getOrderFromOffer(offer: fromModel.IOffer): fromModel.IOrder {
  const result: fromModel.IOrder = {
    offerId: offer.offerId,
    orderId: offer.offerId,
    qantityMade: 0,
    qantityRemainded: offer.quantity,
    quantityPlanned: offer.quantity,
    status: fromModel.EOrderStatus.new,
    productId: offer.productId,
    tick: 0
  };
  return result;
}

export function getEmptyWhatShoudDoWithOffer(offer: fromModel.IOffer): IWhatShoudDoWithOffer {
  return {
    lineProductionId: '',
    departementId: '',
    localization: <any>undefined,
    offer: offer,
    whatDo: EWhatShoudDoWithOffer.rejectOffer,
    continent: fromModel.EContinent.africa
  };
}
