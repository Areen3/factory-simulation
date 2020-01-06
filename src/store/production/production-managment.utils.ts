import { SingleLocation, StateContext, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import * as fromModel from '../../model';
import { FirmState } from '../company-menagment';
import { ProductState } from '../product/product.state';
import { BaseLineProductionState } from './base-line.state';
import { DepartamentState } from './departament.state';
import { IDataConfition } from './production-managment.model';
import { findChipestDepartament, findLinesWithChipestOrder } from './production.utils';

export function havePosibilityToStrtLineAndDepartament(store: Store, offer: fromModel.IOffer, data: IDataConfition): Observable<boolean> {
  return of(true);
  return haveMoneyToStart(store, offer, data, true).pipe(filter(havMoney => havMoney));
}
export function haveMoneyToStrtLine(store: Store, offer: fromModel.IOffer, data: IDataConfition): Observable<boolean> {
  return haveMoneyToStart(store, offer, data, false);
}

export function haveEnoughCapacityInAnyLine(store: Store, offer: fromModel.IOffer, data: IDataConfition): Observable<boolean> {
  const notEnoughCapacity = of(data).pipe(
    filter(item => item.lines.length !== 0),
    map(item => {
      const newData: IDataConfition = {
        ...item,
        lines: item.lines.filter(line => line.productId === offer.productId)
      };
      return newData;
    }),
    map((item): boolean => {
      const lines: Array<fromModel.IBaseProductionLineModel> = item.lines
        .map((line): fromModel.IBaseProductionLineModel => store.selectSnapshotInContext(BaseLineProductionState.state$, line.localization))
        // todo poprawić aby brac pod uwagę ilość produkcji wynikającą z produkutu
        .filter(line => line.productionCapacity - Object.keys(line.production).length > 0);
      return lines.length > 0;
    })
  );
  return notEnoughCapacity;
}

export function havePosibilityToRunNewLine(
  store: Store,
  ctx: StateContext<fromModel.IProductionManagmentModel>,
  offer: fromModel.IOffer,
  data: IDataConfition
): Observable<{ isPosibility: boolean; dep: fromModel.IDepartamentDescription }> {
  const state = ctx.getState();
  const noDepartamentWithFreeLine = of(data).pipe(
    switchMap(() => combineLatest([of(data), haveMoneyToStart(store, offer, data, false)])),
    map(([item, money]) => ({ item, money })),
    filter(({ money }) => money),
    map(({ item }) => item),
    filter(item => item.dep.length !== 0),
    map(item => {
      const departaments = item.dep
        .map(dep => ({
          continent: (<fromModel.IDepartamentModel>store.selectSnapshotInContext(DepartamentState.state$, dep.localization)).continent,
          dep: dep
        }))
        .map(({ continent, dep }) => ({ condition: state.locationConditions[continent], dep }))
        .filter(dep => dep.condition.maxDepartaments > dep.condition.openDepartaments)
        .sort((a, b) => a.condition.salaryModifier - b.condition.salaryModifier)
        .map(dep => dep.dep);
      return departaments;
    }),
    map(item => ({ isPosibility: item.length > 0, dep: item.length > 0 ? item[0] : <any>undefined }))
  );
  return noDepartamentWithFreeLine;
}

function haveMoneyToStart(store: Store, offer: fromModel.IOffer, data: IDataConfition, withDep: boolean): Observable<boolean> {
  const notEnoughMoney = of(data).pipe(
    map(() => findChipestDepartament(data.conditions)),
    map(depCondition => ({
      products: store.selectSnapshot(ProductState.productsArray$),
      profit: store.selectSnapshot(FirmState.actualProfits$),
      depCondition
    })),
    map(({ products, profit, depCondition }): {
      product: fromModel.IProduct;
      profit: number;
      depCondition: fromModel.IContainent;
    } => ({
      product: products.find(item => item.productId === offer.productId)!,
      profit,
      depCondition
    })),
    map(({ product, profit, depCondition }) => profit > product.lineStartUpCost + depCondition.departamentStartUpCost * Number(withDep)),
    filter(haveMoney => haveMoney)
  );
  return notEnoughMoney;
}

export function lineThatTakeThisOffer(
  store: Store,
  offer: fromModel.IOffer,
  myLocalization: SingleLocation,
  data: IDataConfition
): { isPosibility: boolean; lineDescription: fromModel.ILineDescription } {
  const departamentsState: Array<fromModel.IDepartamentModel> = store.getChildrenState(myLocalization);
  const theLineThatProductOffer = findLinesWithChipestOrder(offer, departamentsState, data).find(lineDescription => {
    const line: fromModel.IBaseProductionLineModel = store.selectSnapshotInContext(
      BaseLineProductionState.state$,
      lineDescription.localization
    );
    return line.freeCapacity > 0;
  });
  return { isPosibility: theLineThatProductOffer !== undefined, lineDescription: theLineThatProductOffer! };
}

// export function prepareDataToProcessNewOffer(
//   ctx: StateContext<fromModel.IProductionManagmentModel>,
//   store: Store,
//   offer: Array<fromModel.IOffer>
// ): Observable<any> {
//   return of(true);
// }
