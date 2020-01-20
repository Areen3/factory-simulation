import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';

const initialOfferDataModel: fromModel.IOfferModel = {
  ...initialBaseStateDataModel,
  offers: {},
  rates: { finished: 0, new: 0, rejected: 0, approved: 0, inProgress: 0 }
};

@State<fromModel.IOfferModel>({
  name: 'OffersState',
  defaults: initialOfferDataModel
})
@Injectable({
  providedIn: 'root'
})
export class OfferState extends BaseState<fromModel.IOfferModel> {
  constructor(protected store: Store) {
    super(store);
  }
  @Selector()
  static offers$(state: fromModel.IOfferModel): fromModel.TIndexOfferType {
    return state.offers;
  }
  @Selector()
  static rates$(state: fromModel.IOfferModel): fromModel.IOfferRatesModel {
    return state.rates;
  }
  @Selector()
  static offersArray$(state: fromModel.IOfferModel): Array<fromModel.IOffer> {
    return Object.values(state.offers);
  }
  @Action(fromModel.SaleScheduleAction.NewOffer)
  newOffer(ctx: StateContext<fromModel.IOfferModel>, action: fromModel.SaleScheduleAction.NewOffer): Observable<any> {
    const state = ctx.getState();
    const newOffers: fromModel.TIndexOfferType = action.payload.offers
      .map(offer => {
        const result: fromModel.IOffer = {
          offerId: offer.idOffer,
          productId: offer.idProduct,
          quantity: offer.count,
          status: fromModel.EOfferStatus.new,
          tick: action.payload.tick
        };
        return result;
      })
      .reduce((acc, curr) => ({ ...acc, [curr.offerId]: curr }), {});
    ctx.patchState({
      offers: {
        ...Object.values(state.offers)
          .filter(
            item =>
              item.status === fromModel.EOfferStatus.new ||
              item.status === fromModel.EOfferStatus.approved ||
              item.status === fromModel.EOfferStatus.inProgress
          )
          .reduce((acc: fromModel.TIndexOfferType, curr: fromModel.IOffer) => {
            return { ...acc, [curr.offerId]: curr };
          }, {}),
        ...newOffers
      },
      rates: { ...state.rates, new: state.rates.new + action.payload.offers.length }
    });
    return ctx.dispatch(new fromModel.SaleScheduleAction.NewOfferAdded(Object.values(newOffers)));
  }

  @Action(fromModel.SaleScheduleAction.FinishOffer)
  finishOffer(ctx: StateContext<fromModel.IOfferModel>, action: fromModel.SaleScheduleAction.FinishOffer): void {
    this.changeStatus(ctx, action.payload, fromModel.EOfferStatus.finished);
  }
  @Action(fromModel.SaleScheduleAction.RejectOffer)
  rejectOffer(ctx: StateContext<fromModel.IOfferModel>, action: fromModel.SaleScheduleAction.RejectOffer): void {
    this.changeStatus(ctx, action.payload, fromModel.EOfferStatus.rejected);
  }
  @Action(fromModel.SaleScheduleAction.ApproveOffer)
  approveOffer(ctx: StateContext<fromModel.IOfferModel>, action: fromModel.SaleScheduleAction.ApproveOffer): void {
    this.changeStatus(ctx, action.payload, fromModel.EOfferStatus.approved);
  }
  @Action(fromModel.SaleScheduleAction.InProgressOffer)
  inProgressOffer(ctx: StateContext<fromModel.IOfferModel>, action: fromModel.SaleScheduleAction.InProgressOffer): void {
    this.changeStatus(ctx, action.payload, fromModel.EOfferStatus.inProgress);
  }
  private changeStatus(ctx: StateContext<fromModel.IOfferModel>, ids: Array<fromModel.TOfferId>, status: fromModel.EOfferStatus): void {
    const state = ctx.getState();
    const statusCount: fromModel.IIndexStringType<number> = Object.values(fromModel.EOfferStatus).reduce(
      (acc, curr) => ({ ...acc, [curr]: 0 }),
      {}
    );
    statusCount[status] = ids.length;
    if (fromModel.EOfferStatus.finished === status) statusCount[fromModel.EOfferStatus.inProgress] = ids.length * -1;
    if (fromModel.EOfferStatus.approved === status) statusCount[fromModel.EOfferStatus.new] = ids.length * -1;
    if (fromModel.EOfferStatus.inProgress === status) statusCount[fromModel.EOfferStatus.approved] = ids.length * -1;
    if (fromModel.EOfferStatus.rejected === status) statusCount[fromModel.EOfferStatus.new] = ids.length * -1;

    const offersUpdate: fromModel.TIndexOfferType = {
      ...state.offers,
      ...ids.reduce(
        (acc: fromModel.TIndexOfferType, curr: fromModel.TOfferId) => ({ ...acc, [curr]: { ...state.offers[curr], status } }),
        {}
      )
    };
    const rates: fromModel.IOfferRatesModel = {
      rejected: state.rates.rejected + statusCount[fromModel.EOfferStatus.rejected],
      new: state.rates.new + statusCount[fromModel.EOfferStatus.new],
      finished: state.rates.finished + statusCount[fromModel.EOfferStatus.finished],
      inProgress: state.rates.inProgress + statusCount[fromModel.EOfferStatus.inProgress],
      approved: state.rates.approved + statusCount[fromModel.EOfferStatus.approved]
    };
    if (status === fromModel.EOfferStatus.rejected) {
      // console.log('approved ', rates, offersUpdate);
    }
    if (rates.new < 0) {
      console.log('mniejsze new');
    }
    if (rates.inProgress < 0) {
      console.log('mniejsze inprogress');
    }
    ctx.patchState({ rates: rates, offers: offersUpdate });
  }
}
