import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import * as fromModel from 'src/model';
import { OrderState, TickGeneratorState } from 'src/store';
import { filter, switchMap, tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-order-history',
  styleUrls: ['./order-history.scss'],
  templateUrl: './order-history.component.html'
})
export class OrdersHistoryComponent implements OnInit {
  data: Observable<fromModel.IOrder[]>;
  cols: fromModel.IColumnTableDescription[];
  constructor(public store: Store) {}
  @Select(OrderState.ordersArray$) Orders$: Observable<Array<fromModel.IOrder>>;
  @Select(OrderState.rates$) rates$: Observable<fromModel.IOrderRatesModel>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.data = this.run$.pipe(
      filter(run => run),
      switchMap(() => this.Orders$),
      filter(Orders => Orders.length > 0),
      tap(Orders => this.buildCollumns(Orders)),
      map(items => items.slice(items.length - 100, items.length))
    );
  }
  private buildCollumns(Orders: Array<fromModel.IOrder>): void {
    this.cols = Object.keys(Orders[0]).map((item: string) => ({ field: item, header: item }));
  }
}
