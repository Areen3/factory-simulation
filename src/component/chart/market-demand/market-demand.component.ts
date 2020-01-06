import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import * as fromModel from 'src/model';
import { MarketGeneratorState, ProductState, TickGeneratorState } from 'src/store';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, map, bufferCount } from 'rxjs/operators';
import { BaseComponent } from 'src/component/base/base.component';

interface IProductAndRequests {
  request: Array<fromModel.IProductRequest>;
  product: fromModel.IProduct;
}
type TProductObject = fromModel.IIndexStringType<IProductAndRequests>;

@Component({
  selector: 'app-market-demand',
  styleUrls: ['./market-demand.scss'],
  template: `
    <p-chart type="line" [data]="data" [options]="options"></p-chart>
  `
})
export class MarketDemandComponent extends BaseComponent implements OnInit {
  data: fromModel.ILineChartModel;
  options: any;
  constructor(public store: Store) {
    super();
    this.options = {
      title: { display: true, text: 'Market demand', fontSize: 16 },
      legend: { position: fromModel.EChartLegendPosition.bottom },
      animation: false
    };
  }
  @Select(MarketGeneratorState.productRequest$) productRequest$: Observable<fromModel.TProductRequestArray>;
  @Select(ProductState.productsArray$) products$: Observable<fromModel.TProductArray>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.subscriptons.add(
      this.run$
        .pipe(
          filter(run => run),
          switchMap(() => combineLatest(this.productRequest$, this.products$)),
          map(([request, product]) => this.mapToProductAndRequest(request, product)),
          bufferCount(80, 1),
          map(data => this.changeBufferedDataToObject(data)),
          map(data => this.buildChartData(data))
        )
        .subscribe(dataChart => {
          this.data = dataChart;
        })
    );
  }
  private mapToProductAndRequest(request: fromModel.TProductRequestArray, product: fromModel.TProductArray): TProductObject {
    return product
      .map(productItem => ({
        product: productItem,
        request: request.filter(requestItem => requestItem.productId === productItem.productId)
      }))
      .reduce((acc, curr) => ({ ...acc, [curr.product.name]: curr }), {});
  }
  private changeBufferedDataToObject(data: Array<TProductObject>): TProductObject {
    return data.reduce(
      (accOut: TProductObject, currOut: TProductObject): TProductObject => ({
        ...accOut,
        ...Object.values(currOut).reduce<TProductObject>(
          (acc: TProductObject, curr: IProductAndRequests): TProductObject => ({
            ...acc,
            ...(accOut[curr.product.name] === undefined
              ? { [curr.product.name]: curr }
              : { [curr.product.name]: { ...curr, request: [...accOut[curr.product.name].request, ...curr.request] } })
          }),
          {}
        )
      }),
      {}
    );
  }
  private buildChartData(chartData: TProductObject): fromModel.ILineChartModel {
    return {
      labels: Object.values(chartData)[0].request.map(item => item.tick.toString()),
      datasets: Object.values(chartData).map(item => {
        const x: fromModel.IChartDataSetItem<number> = {
          borderColor: item.product.borderColor,
          data: item.request.map(rq => rq.actualRequest),
          fill: false,
          label: item.product.name
        };
        return x;
      })
    };
  }
}
