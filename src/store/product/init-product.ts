import * as fromModel from '../../model';

const product: fromModel.TProductArray = [
  {
    productId: 1,
    name: 'BMW RT',
    active: true,
    lineStartUpCost: 500,
    employmentVolume: 10,
    numberOfParallelProduction: 1,
    price: 400,
    costSummary: 100,
    costForOneTick: 0,
    profit: 400 - 100,
    tickToProduceOneElement: 2,
    borderColor: 'red',
    maxMarketDemand: 5,
    productKind: fromModel.EProductKind.motorcycle
  }
  // {
  //   productId: 2,
  //   name: 'BMW 2',
  //   active: false,
  //   departamentStartUpCost: 1000,
  //   lineStartUpCost: 500,
  //   employmentVolume: 10,
  //   numberOfParallelProduction: 10,
  //   price: 400,
  //   cost: 100,
  //   profit: 400 - 100,
  //   tickToProduceOneElement: 5,
  //   borderColor: 'yellow',
  //   maxMarketDemand: 20,
  //   productKind: fromModel.EProductKind.car
  // },
  // {
  //   productId: 3,
  //   name: 'BMW 3',
  //   active: false,
  //   departamentStartUpCost: 1000,
  //   lineStartUpCost: 500,
  //   employmentVolume: 10,
  //   numberOfParallelProduction: 10,
  //   price: 400,
  //   cost: 100,
  //   profit: 400 - 100,
  //   tickToProduceOneElement: 5,
  //   borderColor: 'black',
  //   maxMarketDemand: 50,
  //   productKind: fromModel.EProductKind.van
  // },
  // {
  //   productId: 4,
  //   name: 'Audi 100',
  //   active: true,
  //   departamentStartUpCost: 1000,
  //   lineStartUpCost: 500,
  //   employmentVolume: 10,
  //   numberOfParallelProduction: 10,
  //   price: 400,
  //   cost: 100,
  //   profit: 400 - 100,
  //   tickToProduceOneElement: 5,
  //   borderColor: 'green',
  //   maxMarketDemand: 30,
  //   productKind: fromModel.EProductKind.car
  // },
  // {
  //   productId: 5,
  //   name: 'Audi 200',
  //   active: false,
  //   departamentStartUpCost: 1000,
  //   lineStartUpCost: 500,
  //   employmentVolume: 10,
  //   numberOfParallelProduction: 10,
  //   price: 400,
  //   cost: 100,
  //   profit: 400 - 100,
  //   tickToProduceOneElement: 5,
  //   borderColor: 'blue',
  //   maxMarketDemand: 10,
  //   productKind: fromModel.EProductKind.van
  // }
].map(item => {
  item.profit = item.price - item.costSummary;
  item.costForOneTick = item.costSummary / item.tickToProduceOneElement;
  return item;
});
export const productIndex: fromModel.TProductIndex = product.reduce((acc, curr) => ({ ...acc, [curr.productId]: curr }), {});
