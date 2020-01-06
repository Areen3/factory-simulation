import { Injectable } from '@angular/core';
import { State, Store } from '@ngxs/store';

import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';
import { OfferState } from './offer.state';
import { OrderState } from './order.state';

const initialSaleShedulerDataModel: fromModel.ISaleShedulerState = {
  ...initialBaseStateDataModel
};

@State<fromModel.ISaleShedulerState>({
  name: 'SaleSchedulerState',
  defaults: initialSaleShedulerDataModel,
  children: [OfferState, OrderState]
})
@Injectable({
  providedIn: 'root'
})
export class SaleSchedulerState extends BaseState<fromModel.ISaleShedulerState> {
  constructor(protected store: Store) {
    super(store);
  }
}
