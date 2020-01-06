import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import * as fromModel from 'src/model';
import { TickGeneratorState } from 'src/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-life-cycle',
  styleUrls: ['./life-cycle.scss'],
  templateUrl: './life-cycle-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LifeCycleComponent implements OnInit {
  constructor(public store: Store) {}
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  @Select(TickGeneratorState.speed$) speed$: Observable<number>;
  timeSpeed: number = 50;
  salary: number = 50;
  sales: number = 50;
  ngOnInit(): void {
    this.store.dispatch(new fromModel.TickAction.ChangeSpeed(this.timeSpeed));
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
  salaryChange(event: any): void {
    this.salary = event.value;
    this.store.dispatch(new fromModel.TickAction.ChangeSpeed(event.value));
  }
  marginChange(event: any): void {
    this.sales = event.value;
    this.store.dispatch(new fromModel.TickAction.ChangeSpeed(event.value));
  }
}
