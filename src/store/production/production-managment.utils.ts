import { SingleLocation, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import * as fromModel from '../../model';
import { FirmState } from '../company-menagment';
import { ProductState } from '../product/product.state';
import { BaseLineProductionState } from './base-line.state';
import { DepartamentState } from './departament.state';
import { IDataConfiguration, IDoWithLine, IDoWithNewDepartament, IDoWithNewLine } from './production-managment.model';
import { findChipestDepartament, findLinesWithChipestOrder } from './production.utils';

export function haveMoneyToStrtLineAndDepartament(store: Store, offer: fromModel.IOffer, data: IDataConfiguration): Observable<boolean> {
  return haveMoneyToStart(store, offer, data, true).pipe(filter(havMoney => havMoney));
}
export function haveMoneyToStrtLine(store: Store, offer: fromModel.IOffer, data: IDataConfiguration): Observable<boolean> {
  return haveMoneyToStart(store, offer, data, false);
}

export function haveEnoughCapacityInAnyLine(store: Store, offer: fromModel.IOffer, data: IDataConfiguration): Observable<boolean> {
  const notEnoughCapacity = of(data).pipe(
    filter(item => item.lines.length !== 0),
    map(item => {
      const newData: IDataConfiguration = {
        ...item,
        lines: item.lines.filter(line => line.productId === offer.productId)
      };
      return newData;
    }),
    map((item): boolean => {
      const lines: Array<fromModel.IBaseProductionLineModel> = item.lines
        .map((line): fromModel.IBaseProductionLineModel => store.selectSnapshotInContext(BaseLineProductionState.state$, line.location))
        .filter(line => line.productionCapacity - Object.keys(line.production).length > 0);
      return lines.length > 0;
    })
  );
  return notEnoughCapacity;
}

export function havePosibilityToRunNewDepartament(
  store: Store,
  offer: fromModel.IOffer,
  data: IDataConfiguration
): Observable<IDoWithNewDepartament> {
  const choisenContitnent = of(data).pipe(
    switchMap(() => {
      // REVIEW rxjs example how to pass condition to the end of stream
      return combineLatest([of(data), haveMoneyToStart(store, offer, data, true)]);
    }),
    map(([item, money]) => ({ item, money })),
    map(
      ({ item, money }): Array<fromModel.EContinent> => {
        return money
          ? Object.values(item.conditions)
              .filter(continent => continent.maxDepartaments > continent.openDepartaments)
              .sort((a, b) => a.salaryModifier - b.salaryModifier)
              .filter(continent => continent.maxLinesPerDepartament > 0)
              .map(continent => continent.localization)
          : [];
      }
    ),
    map(item => ({ isPosibility: item.length > 0, continent: item.length > 0 ? item[0] : <any>undefined }))
  );
  return choisenContitnent;
}

export function havePosibilityToRunNewLine(store: Store, offer: fromModel.IOffer, data: IDataConfiguration): Observable<IDoWithNewLine> {
  const noDepartamentWithFreeLine = of(data).pipe(
    switchMap(() => combineLatest([of(data), haveMoneyToStart(store, offer, data, false)])),
    map(([item, money]) => ({ item, go: money && item.dep.length > 0 })),
    map(({ item, go }) => {
      return go
        ? item.dep
            .map(dep => ({
              departament: <fromModel.IDepartamentModel>store.selectSnapshotInContext(DepartamentState.state$, dep.localization),
              dep: dep
            }))
            .map(({ departament, dep }) => ({ continent: item.conditions[departament.continent], departament, dep }))
            .sort((a, b) => a.continent.salaryModifier - b.continent.salaryModifier)
            .filter(dep => dep.departament.openLines < dep.continent.maxLinesPerDepartament)
            .map(dep => dep.dep)
        : [];
    }),
    map(item => ({ isPosibility: item.length > 0, dep: item.length > 0 ? item[0] : <any>undefined }))
  );
  return noDepartamentWithFreeLine;
}

function haveMoneyToStart(store: Store, offer: fromModel.IOffer, data: IDataConfiguration, withDep: boolean): Observable<boolean> {
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
    map(({ product, profit, depCondition }) => profit > product.lineStartUpCost + depCondition.departamentStartUpCost * Number(withDep))
  );
  return notEnoughMoney;
}

export function lineThatTakeThisOffer(
  store: Store,
  offer: fromModel.IOffer,
  myLocalization: SingleLocation,
  data: IDataConfiguration
): IDoWithLine {
  const departamentsState: Array<fromModel.IDepartamentModel> = store.getChildrensState(myLocalization).map(item => item.state);
  const theLineThatProductOffer = findLinesWithChipestOrder(offer, departamentsState, data).filter(lineDescription => {
    const line: fromModel.IBaseProductionLineModel = store.selectSnapshotInContext(
      BaseLineProductionState.state$,
      lineDescription.location
    );
    return line.freeCapacity > 0;
  });
  return {
    isPosibility: theLineThatProductOffer.length > 0,
    lineDescription: theLineThatProductOffer.length > 0 ? theLineThatProductOffer[0] : undefined
  };
}
