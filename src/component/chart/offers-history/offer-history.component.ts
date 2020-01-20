import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import * as fromModel from 'src/model';
import { OfferState, TickGeneratorState } from 'src/store';
import { filter, switchMap, tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-offer-history',
  styleUrls: ['./offer-history.scss'],
  templateUrl: './offer-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersHistoryComponent implements OnInit {
  data: Observable<fromModel.IOffer[]>;
  cols: fromModel.IColumnTableDescription[];
  constructor(public store: Store) {}
  @Select(OfferState.offersArray$) offers$: Observable<Array<fromModel.IOffer>>;
  @Select(OfferState.rates$) rates$: Observable<fromModel.IOfferRatesModel>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.data = this.run$.pipe(
      filter(run => run),
      switchMap(() => this.offers$),
      filter(offers => offers.length > 0),
      tap(offers => this.buildCollumns(offers)),
      map(items => items.slice(items.length - 100, items.length))
    );
  }
  private buildCollumns(offers: Array<fromModel.IOffer>): void {
    this.cols = Object.keys(offers[0]).map((item: string) => ({ field: item, header: item }));
  }
}
