import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { BaseComponent } from 'src/component/base/base.component';
import * as fromModel from 'src/model';
import { FirmState, OrderState, TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-firm-finance',
  styleUrls: ['./firm-finance.scss'],
  templateUrl: './firm-finance.component.html'
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
          filter(profit => profit < 0),
          switchMap(() => this.store.dispatch(new fromModel.TickAction.Bankrupt()))
        )
        .subscribe(() => {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'You are bancrupt', detail: 'the cash is over' });
          console.log('You are bancrupt');
        })
    );
  }
}
