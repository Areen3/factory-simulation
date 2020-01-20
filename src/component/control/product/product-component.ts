import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BaseComponent } from 'src/component/base/base.component';
import { EProductKind, IProduct, ProductAction, TProductArray } from 'src/model';
import { ProductState, FirmState } from 'src/store';

@Component({
  selector: 'app-product',
  styleUrls: ['product.scss'],
  templateUrl: `product-component.html`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent extends BaseComponent implements OnInit, AfterViewInit {
  selectedProduct: IProduct;
  productKind: typeof EProductKind = EProductKind;
  numberOfParallelProduction: number = 10;
  tickToProduceOneElement: number = 1;
  maxMarketDemand: number = 100;
  @Select(FirmState.ekspertMode$) ekspertMode$: Observable<boolean>;
  constructor(public store: Store) {
    super();
  }

  @Select(ProductState.productsArray$) products$: Observable<TProductArray>;
  ngOnInit(): void {
    this.onAllMarketDemand();
    this.onAllTickProduce();
    this.onAllParalel();
  }
  ngAfterViewInit(): void {}
  updateClick(): void {
    this.store.dispatch(new ProductAction.Update(this.selectedProduct));
  }
  onDropDownChange(e: any): void {
    this.selectedProduct = { ...e.value };
  }
  onMaxMarketDemandChange(): void {
    this.store.dispatch(new ProductAction.Update(this.selectedProduct));
  }
  onTickToProduceOneElementChange(): void {
    this.store.dispatch(new ProductAction.Update(this.selectedProduct));
  }
  onNumberOfParallelProductionChange(): void {
    this.store.dispatch(new ProductAction.Update(this.selectedProduct));
  }
  onAllMarketDemand(): void {
    this.store.dispatch(new ProductAction.AllMarketDemand(this.maxMarketDemand));
  }
  onAllTickProduce(): void {
    this.store.dispatch(new ProductAction.AllTickToProduce(this.tickToProduceOneElement));
  }
  onAllParalel(): void {
    this.store.dispatch(new ProductAction.AllNumberOfParallel(this.numberOfParallelProduction));
  }
}
