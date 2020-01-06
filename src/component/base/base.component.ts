import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-component',
  template: ``
})
export class BaseComponent implements OnDestroy {
  subscriptons: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.subscriptons.unsubscribe();
  }
}
