import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { IProduct, ProductAction, TProductArray } from 'src/model';
import { ProductState } from 'src/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product',
  styleUrls: ['product.scss'],
  templateUrl: `product-component.html`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent implements OnInit {
  selectedProduct: IProduct;
  constructor(public store: Store) {}
  @Select(ProductState.productsArray$) products$: Observable<TProductArray>;
  ngOnInit(): void {}
  updateClick(): void {
    this.store.dispatch(new ProductAction.Update(this.selectedProduct));
  }
}
