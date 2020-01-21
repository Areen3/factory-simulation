import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ofActionSuccessful, Select, Store, Actions } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, switchMap, scan } from 'rxjs/operators';
import { BaseComponent } from 'src/component/base/base.component';
import * as fromModel from 'src/model';
import { MarketGeneratorState, ProductState, TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-product-chart',
  styleUrls: ['./product-chart.scss'],
  template: `
    <h3 class="reset state__header">Product sales <i class="pi pi-chart-line"></i></h3>
    <div class="ui-g">
      <div class="ui-g-12">
        <ngx-charts-advanced-pie-chart [view]="view" [animations]="false" [results]="data$ | async"> </ngx-charts-advanced-pie-chart>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductChartComponent extends BaseComponent implements OnInit {
  data$: Observable<Array<fromModel.IAdvancedPipeChartModel>>;
  view: any[] = [600, 200];

  constructor(public store: Store, protected actions$: Actions) {
    super();
  }
  @Select(MarketGeneratorState.productRequest$) productRequest$: Observable<fromModel.TProductRequestArray>;
  @Select(ProductState.productsArray$) products$: Observable<fromModel.TProductArray>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.data$ = this.run$.pipe(
      filter(run => run),
      switchMap(() => this.actions$),
      ofActionSuccessful(fromModel.CompanyMenagmentAction.AddSaleFromLine),
      map((act: fromModel.CompanyMenagmentAction.AddSaleFromLine) => act.payload),
      // REVIEW rxjs example how to store data in stream that show in chart
      scan((acc: Array<fromModel.IAdvancedPipeChartModel>, item): Array<fromModel.IAdvancedPipeChartModel> => {
        return item
          .map((elem): fromModel.IAdvancedPipeChartModel => ({ name: elem.product, value: elem.sale }))
          .reduce((a: Array<fromModel.IAdvancedPipeChartModel>, c) => [...this.updateProduct(a, c)], acc);
      }, [])
    );
  }
  private updateProduct(
    acc: Array<fromModel.IAdvancedPipeChartModel>,
    prod: fromModel.IAdvancedPipeChartModel
  ): Array<fromModel.IAdvancedPipeChartModel> {
    const find = acc.find(item => item.name === prod.name);
    if (find !== undefined) find!.value = find!.value + prod.value;
    return find === undefined ? [...acc, prod] : acc;
  }
}
