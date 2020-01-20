import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import * as fromModel from 'src/model';
import { TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-in-progress',
  styleUrls: ['./in-progress.scss'],
  template: `
    <p-progressBar [value]="value" [showValue]="false" [style]="{ height: '6px' }"></p-progressBar>
  `
})
export class InProgressComponent implements OnInit, OnDestroy {
  @Input()
  inProgress: fromModel.IInProduceOnTheLine;
  desc: string;
  value: number;
  constructor(public store: Store) {}

  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnDestroy(): void {}
  ngOnInit(): void {
    this.value = fromModel.getPerecent(this.inProgress.tickTaken, this.inProgress.tickTaken + this.inProgress.tickRemaind);
  }
}
