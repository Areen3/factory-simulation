import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, scan, switchMap } from 'rxjs/operators';
import { BaseComponent } from 'src/component/base/base.component';
import * as fromModel from 'src/model';
import { TickGeneratorState } from 'src/store';

// REVIEW angular example of one binding to observale in template *ngIf="data$ | async as data">
@Component({
  selector: 'app-containent-chart',
  styleUrls: ['./containent-chart.scss'],
  template: `
    <h3 class="reset state__header">Containent sales <i class="pi pi-chart-line"></i></h3>
    <div class="ui-g">
      <div class="ui-g-12" *ngIf="data$ | async as data">
        <ng-container *ngIf="data.length !== 0">
          <ngx-charts-tree-map [view]="view" [animations]="animations" [results]="data"></ngx-charts-tree-map>
        </ng-container>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainentChartComponent extends BaseComponent implements OnInit {
  data$: Observable<Array<fromModel.ITreeMapChartModel>>;
  animations: boolean = false;
  single: Array<fromModel.ITreeMapChartModel> = [{ name: 'sales', value: 1 }];
  view: any[] = [600, 200];

  constructor(public store: Store, protected actions$: Actions) {
    super();
  }

  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    // REVIEW angular example how to get data from observable without subscribing
    this.data$ = this.run$.pipe(
      filter(run => run),
      switchMap(() => this.actions$),
      ofActionSuccessful(fromModel.CompanyMenagmentAction.AddSaleFromLine),
      map((act: fromModel.CompanyMenagmentAction.AddSaleFromLine) => act.payload),
      scan((acc: Array<fromModel.ITreeMapChartModel>, item): Array<fromModel.ITreeMapChartModel> => {
        return item
          .map((elem): fromModel.ITreeMapChartModel => ({ name: elem.containent, value: elem.sale }))
          .reduce((a: Array<fromModel.ITreeMapChartModel>, c) => [...this.updateProduct(a, c)], acc);
      }, [])
    );
  }
  private updateProduct(acc: Array<fromModel.ITreeMapChartModel>, prod: fromModel.ITreeMapChartModel): Array<fromModel.ITreeMapChartModel> {
    const find = acc.find(item => item.name === prod.name);
    if (find !== undefined) find!.value = find!.value + prod.value;
    return find === undefined ? [...acc, prod] : acc;
  }
}
