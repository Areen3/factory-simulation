import { Injectable } from '@angular/core';
import { Action, NgxsOnDestroy, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { combineLatest, Observable, timer } from 'rxjs';
import { filter, map, scan, switchMap } from 'rxjs/operators';

import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';

const initialTickGeneratorDataModel: fromModel.ITickGeneratorModel = {
  ...initialBaseStateDataModel,
  lastTick: 0,
  run: false,
  speed: 500
};

@State<fromModel.ITickGeneratorModel>({
  name: 'TickGeneratorState',
  defaults: initialTickGeneratorDataModel
})
@Injectable({
  providedIn: 'root'
})
export class TickGeneratorState extends BaseState<fromModel.ITickGeneratorModel> implements NgxsOnDestroy, NgxsOnInit {
  constructor(protected store: Store) {
    super(store);
  }
  @Selector()
  static run$(state: fromModel.ITickGeneratorModel): boolean {
    // console.log(`run: ${state.run}`);
    return state.run;
  }
  @Selector()
  static speed$(state: fromModel.ITickGeneratorModel): number {
    return state.speed;
  }
  @Action(fromModel.TickAction.Start)
  startFactoryAction(ctx: StateContext<fromModel.ITickGeneratorModel>): void {
    ctx.patchState({ run: true });
  }
  @Action(fromModel.TickAction.ChangeSpeed)
  changeTickSpeedAction(ctx: StateContext<fromModel.ITickGeneratorModel>, action: fromModel.TickAction.ChangeSpeed): void {
    ctx.patchState({ speed: action.payload });
  }
  @Action(fromModel.TickAction.Pause)
  pauseFactoryAction(ctx: StateContext<fromModel.ITickGeneratorModel>): void {
    ctx.patchState({ run: false });
  }
  @Action(fromModel.TickAction.NewBuisness)
  newBuisnessFactoryAction(ctx: StateContext<fromModel.ITickGeneratorModel>): void {
    ctx.patchState({ run: false, speed: 100, lastTick: 0 });
  }
  @Action(fromModel.TickAction.Bankrupt)
  bankrupt(ctx: StateContext<fromModel.ITickGeneratorModel>): void {
    ctx.patchState({ run: false, speed: 100, lastTick: 0 });
  }
  generateTick(ctx: StateContext<fromModel.ITickGeneratorModel>): void {
    const speed$: Observable<number> = this.store.select(TickGeneratorState.speed$);
    const run$: Observable<boolean> = this.store.select(TickGeneratorState.run$);
    run$
      .pipe(
        filter(run => run),
        switchMap(() => speed$),
        switchMap(speed => combineLatest([run$, timer(speed, speed)])),
        map(([run, tick]) => ({ run, tick })),
        filter(item => item.run),
        map(item => item.tick),
        filter(tick => tick < 100),
        scan(acc => acc + 1, 0)
      )
      .subscribe(tick => {
        // console.log('generate tick', tick);
        ctx.patchState({ lastTick: tick });
        this.store.dispatch(new fromModel.TickAction.Tick(tick));
      });
  }
  ngxsOnDestory(): void {}
  ngxsOnInit(ctx: StateContext<fromModel.ITickGeneratorModel>): void {
    this.generateTick(ctx);
  }
}
