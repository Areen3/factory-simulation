import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { BaseComponent } from 'src/component/base/base.component';
import * as fromModel from 'src/model';
import { FirmState, OrderState, TickGeneratorState } from 'src/store';
import { tag } from 'rxjs-spy/operators';

@Component({
  selector: 'app-firm-finance',
  styleUrls: ['./firm-finance.scss'],
  templateUrl: './firm-finance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirmFinanceComponent extends BaseComponent implements OnInit {
  data: Observable<fromModel.IOrder[]>;
  cols: fromModel.IColumnTableDescription[];
  firmModel$: Observable<fromModel.IFirmModel>;
  actualBudget$: Observable<number>;
  constructor(public store: Store, private messageService: MessageService) {
    super();
  }

  @Select(OrderState.rates$) rates$: Observable<fromModel.IOrderRatesModel>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  @Select(TickGeneratorState.duration$) duration$: Observable<number>;
  ngOnInit(): void {
    const loc = this.store.getStateLocationByStateClass(FirmState);
    this.firmModel$ = this.store.selectInContext(FirmState.state$, loc);
    this.checkFinanse();
    this.actualBudget$ = this.store.selectInContext(FirmState.actualBudget$, this.store.getStateLocationByStateClass(FirmState));
    // .pipe(tap(item => console.log('zmiana budżetu')));
  }
  private checkFinanse(): void {
    this.subscriptons.add(
      this.store
        .select(FirmState.actualProfits$)
        .pipe(
          tag('finance'),
          filter(profit => profit < 0),
          switchMap(() => this.store.dispatch(new fromModel.TickAction.Bankrupt()))
        )
        .subscribe(() => {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'You are bancrupt', detail: 'the cash is over' });
          console.log('You are bancrupt');
        })
    );
  }
  getRange(value: number): number {
    if (value <= 0) return -1;
    if (value > 0 && value < 10000) return 0;
    if (value >= 10000 && value < 1000000) return 1;
    return 2;
  }
}
