import { Injectable } from '@angular/core';
import { Actions, NgxsOnDestroy, NgxsOnInit, ofActionSuccessful, Selector, State, StateContext, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';
import { ProductState } from '../product';
import { TickGeneratorState } from './tick.state';

const initialMarketGeneratorDataModel: fromModel.IMarketGeneratorModel = {
  ...initialBaseStateDataModel,
  productRequest: []
};

@State<fromModel.IMarketGeneratorModel>({
  name: 'MarketGenerator',
  defaults: initialMarketGeneratorDataModel,
  children: [TickGeneratorState]
})
@Injectable({
  providedIn: 'root'
})
export class MarketGeneratorState extends BaseState<fromModel.IMarketGeneratorModel> implements NgxsOnDestroy, NgxsOnInit {
  constructor(protected store: Store, protected actions$: Actions) {
    super(store);
  }
  @Selector()
  static productRequest$(state: fromModel.IMarketGeneratorModel): fromModel.TProductRequestArray {
    return state.productRequest;
  }
  ngxsOnDestory(): void {}
  ngxsOnInit(ctx: StateContext<fromModel.IMarketGeneratorModel>): void {
    this.createProductRequestState(ctx);
  }
  private createProductRequestState(ctx: StateContext<fromModel.IMarketGeneratorModel>): void {
    const run$: Observable<boolean> = this.store.select(TickGeneratorState.run$);
    run$
      .pipe(
        filter(run => run),
        switchMap(() => this.store.select(ProductState.productsArray$)),
        tap(products => this.inicjalizeStateOnRun(ctx, products)),
        switchMap(() => this.actions$),
        ofActionSuccessful(fromModel.TickAction.Tick),
        map((tick: fromModel.TickAction.Tick) => tick.payload),
        switchMap(tick => combineLatest(of(tick), this.store.select(ProductState.productsArray$))),
        map(([tick, products]) => this.buildOfferArray(ctx, tick, products))
      )
      .subscribe(offerArray => {
        // console.log('generate market: ', offerArray);
        this.sendOffers(offerArray);
      });
  }
  private buildOfferArray(
    ctx: StateContext<fromModel.IMarketGeneratorModel>,
    tick: number,
    products: fromModel.TProductArray
  ): fromModel.SaleScheduleAction.INewOfferOnMarket {
    const state = ctx.getState();
    const req: fromModel.IProductRequest[] = [];
    const result: fromModel.SaleScheduleAction.INewOfferOnMarket = products
      .map(item => {
        const requestItem = state.productRequest.find(productItem => productItem.productId === item.productId);
        const productRequest: fromModel.IProductRequest = {
          ...requestItem!,
          tick,
          sinusDegrees: requestItem!.sinusDegrees + 1,
          actualRequest: Math.floor(
            ((Math.sin(fromModel.toRadians(requestItem!.sinusDegrees)) + 1) / 2) *
              Math.floor(item.maxMarketDemand * fromModel.getRandomRange(0.8, 1.2))
          )
        };
        const offer: fromModel.SaleScheduleAction.INewOfferOnMarket = {
          offers:
            productRequest.actualRequest !== 0
              ? [
                  {
                    idOffer: `${tick.toString()}/${item.name}`,
                    idProduct: item.productId,
                    count: productRequest.actualRequest
                  }
                ]
              : [],
          tick
        };
        req.push(productRequest);
        return offer;
      })
      .reduce(
        (acc: fromModel.SaleScheduleAction.INewOfferOnMarket, curr: fromModel.SaleScheduleAction.INewOfferOnMarket, index: number) =>
          index === 0 ? curr : { tick: curr.tick, offers: [...acc.offers, ...curr.offers] },
        { offers: [], tick: 0 }
      );
    ctx.patchState({ productRequest: [...req] });
    return result;
  }

  private sendOffers(offerArray: fromModel.SaleScheduleAction.INewOfferOnMarket): Observable<any> {
    return this.store.dispatch(new fromModel.SaleScheduleAction.NewOffer(offerArray));
  }

  private inicjalizeStateOnRun(ctx: StateContext<fromModel.IMarketGeneratorModel>, products: fromModel.TProductArray): void {
    const state = ctx.getState();
    const productRequest: fromModel.TProductRequestArray = products.map(product => {
      const actRequest: fromModel.IProductRequest | undefined = state.productRequest.find(item => item.productId === product.productId);
      const productRequestItem: fromModel.IProductRequest = {
        actualRequest: actRequest === undefined ? 0 : actRequest.actualRequest,
        productId: product.productId,
        sinusDegrees: actRequest === undefined ? this.getRandomDegrees() : actRequest.sinusDegrees,
        // sinusDegrees: 0,
        tick: actRequest === undefined ? 0 : actRequest.tick
      };
      return productRequestItem;
    });
    ctx.patchState({ productRequest });
  }
  private getRandomDegrees(): number {
    return Math.floor(Math.random() * 360);
  }
}
