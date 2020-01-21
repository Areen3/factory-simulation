import * as fromModel from '../../model';
// REVIEW js example of declare array with inicjalization and process by map
const product: fromModel.TProductArray = [
  {
    productId: 1,
    name: 'BMW RT', //
    active: true,
    lineStartUpCost: 500,
    employmentVolume: 10, //
    numberOfParallelProduction: 10, //
    price: 1000, //
    costSummary: 500,
    costForOneTick: 0, //
    profit: 0,
    tickToProduceOneElement: 10, //
    borderColor: 'red',
    maxMarketDemand: 5, //
    productKind: fromModel.EProductKind.motorcycle //
  },
  {
    productId: 2,
    name: 'BMW 2',
    active: true,
    departamentStartUpCost: 1000,
    lineStartUpCost: 500,
    employmentVolume: 10,
    numberOfParallelProduction: 10,
    price: 400,
    costSummary: 100,
    costForOneTick: 0, //
    profit: 400 - 100,
    tickToProduceOneElement: 10,
    borderColor: 'yellow',
    maxMarketDemand: 5,
    productKind: fromModel.EProductKind.car
  },
  {
    productId: 3,
    name: 'BMW 3',
    active: true,
    departamentStartUpCost: 1000,
    lineStartUpCost: 500,
    employmentVolume: 10,
    numberOfParallelProduction: 10,
    price: 400,
    costForOneTick: 0, //
    costSummary: 100,
    profit: 400 - 100,
    tickToProduceOneElement: 10,
    borderColor: 'black',
    maxMarketDemand: 5,
    productKind: fromModel.EProductKind.van
  },
  {
    productId: 4,
    name: 'Audi 100',
    active: true,
    departamentStartUpCost: 1000,
    lineStartUpCost: 500,
    employmentVolume: 10,
    numberOfParallelProduction: 10,
    price: 400,
    costForOneTick: 0, //
    costSummary: 100,
    profit: 400 - 100,
    tickToProduceOneElement: 10,
    borderColor: 'green',
    maxMarketDemand: 5,
    productKind: fromModel.EProductKind.car
  },
  {
    productId: 5,
    name: 'Audi 200',
    active: true,
    departamentStartUpCost: 1000,
    lineStartUpCost: 500,
    employmentVolume: 10,
    numberOfParallelProduction: 10,
    price: 400,
    costForOneTick: 0, //
    costSummary: 100,
    profit: 400 - 100,
    tickToProduceOneElement: 10,
    borderColor: 'blue',
    maxMarketDemand: 5,
    productKind: fromModel.EProductKind.van
  }
].map(updateProductItem);
// REVIEW js example of reduce array to map
export const productIndex: fromModel.TProductIndex = product.reduce((acc, curr) => ({ ...acc, [curr.productId]: curr }), {});
export function updateProductItem(prod: fromModel.IProduct): fromModel.IProduct {
  const result: fromModel.IProduct = { ...prod };
  result.profit = result.price - result.costSummary;
  result.costForOneTick = result.costSummary / result.tickToProduceOneElement;
  return result;
}
