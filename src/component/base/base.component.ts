import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

export class BaseComponent implements OnDestroy {
  subscriptons: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.subscriptons.unsubscribe();
  }
}
