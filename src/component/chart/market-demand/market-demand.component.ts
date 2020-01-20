import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, scan, switchMap } from 'rxjs/operators';
import { BaseComponent } from 'src/component/base/base.component';
import * as fromModel from 'src/model';
import { MarketGeneratorState, ProductState, TickGeneratorState } from 'src/store';

interface IProductAndRequests {
  request: Array<fromModel.IProductRequest>;
  product: fromModel.IProduct;
}
type TProductObject = fromModel.IIndexStringType<IProductAndRequests>;

@Component({
  selector: 'app-market-demand',
  styleUrls: ['./market-demand.scss'],
  template: `
    <h3 class="reset state__header">Market demand <i class="pi pi-chart-line"></i></h3>
    <div class="ui-g">
      <div class="ui-g-12" *ngIf="data$ | async as data">
        <ng-container *ngIf="data.length !== 0">
          <ngx-charts-line-chart
            [view]="view"
            [legend]="true"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            [xAxis]="true"
            [yAxis]="true"
            [xAxisLabel]="'time'"
            [yAxisLabel]="'count'"
            [timeline]="true"
            [results]="data"
          >
          </ngx-charts-line-chart>
        </ng-container>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketDemandComponent extends BaseComponent implements OnInit {
  data$: Observable<fromModel.TLineChartModel>;
  view: any[] = [600, 300];
  constructor(public store: Store) {
    super();
  }
  @Select(MarketGeneratorState.productRequest$) productRequest$: Observable<fromModel.TProductRequestArray>;
  @Select(ProductState.productsArray$) products$: Observable<fromModel.TProductArray>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.data$ = this.run$.pipe(
      filter(run => run),
      switchMap(() => combineLatest(this.productRequest$, this.products$)),
      map(([request, product]): TProductObject => this.mapToProductAndRequest(request, product)),
      scan((acc: TProductObject, curr: TProductObject): TProductObject => this.updateBuffer(acc, curr), {}),
      map(data => this.buildChartData(data))
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
  private updateBuffer(accOut: TProductObject, currIn: TProductObject): TProductObject {
    return Object.values(currIn).reduce<TProductObject>(
      (acc: TProductObject, curr: IProductAndRequests): TProductObject => ({
        ...acc,
        ...(accOut[curr.product.name] === undefined
          ? { [curr.product.name]: curr }
          : { [curr.product.name]: { ...curr, request: this.trimArray([...accOut[curr.product.name].request, ...curr.request]) } })
      }),
      {}
    );
  }
  private trimArray(data: Array<fromModel.IProductRequest>): Array<fromModel.IProductRequest> {
    const size: number = 500;
    return data.length <= size ? data : data.slice(data.length - size, size);
  }
  private buildChartData(chartData: TProductObject): fromModel.TLineChartModel {
    return Object.values(chartData).map(
      (data: IProductAndRequests): fromModel.ILineChartItem => ({
        name: data.product.name,
        series: this.rebuildSeries(data.request)
      })
    );
  }
  private rebuildSeries(data: Array<fromModel.IProductRequest>): Array<fromModel.IChartDataSetItem<number>> {
    return data.map((item): fromModel.IChartDataSetItem<number> => ({ name: item.tick.toString(), value: item.actualRequest }));
  }
}
