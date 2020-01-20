import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BaseComponent } from 'src/component/base/base.component';
import * as fromModel from 'src/model';
import { FirmState, ProductState, TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-life-cycle',
  styleUrls: ['./life-cycle.scss'],
  templateUrl: './life-cycle-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LifeCycleComponent extends BaseComponent implements OnInit {
  constructor(public store: Store) {
    super();
  }
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  @Select(TickGeneratorState.speed$) speed$: Observable<number>;
  @Select(FirmState.ekspertMode$) ekspertMode$: Observable<boolean>;
  buffer$: Observable<fromModel.TProductBufferIndex>;
  eProductKind: typeof fromModel.EProductKind = fromModel.EProductKind;
  timeSpeed: number = 50;
  budgetStart: number = 5000000;
  ngOnInit(): void {
    this.buffer$ = this.store.select(ProductState.buffers$);
    this.store.dispatch(new fromModel.TickAction.ChangeSpeed(this.timeSpeed));
    this.store.dispatch(new fromModel.CompanyMenagmentAction.BudgetChange(this.budgetStart));
  }

  startClick(): void {
    this.store.dispatch(new fromModel.TickAction.Start());
  }
  pauseClick(): void {
    this.store.dispatch(new fromModel.TickAction.Pause());
  }
  newBuisenssClick(): void {
    this.store.dispatch(new fromModel.TickAction.NewBuisness());
  }
  timeChange(event: any): void {
    this.timeSpeed = event.value;
    this.store.dispatch(new fromModel.TickAction.ChangeSpeed(event.value));
  }
  bufferChange(event: any, vehicleType: fromModel.EProductKind): void {
    this.store.dispatch(new fromModel.ProductAction.BufferChange({ kind: vehicleType, value: event.value }));
  }
  budgetChange(event: any): void {
    this.budgetStart = event.value;
    this.store.dispatch(new fromModel.CompanyMenagmentAction.BudgetChange(event.value));
  }
  changeExpertMode(event: any): void {
    this.store.dispatch(new fromModel.CompanyMenagmentAction.ExpertModeChange(event));
  }
}
