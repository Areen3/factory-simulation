import { Injectable } from '@angular/core';
import { Action, NgxsOnDestroy, NgxsOnInit, Selector, State, StateContext, Store, UpdateState } from '@ngxs/store';
import { combineLatest, Observable, timer, of } from 'rxjs';
import { tag } from 'rxjs-spy/operators';
import { filter, map, scan, switchMap, tap } from 'rxjs/operators';
import * as fromModel from '../../model';
import { BaseState, initialBaseStateDataModel } from '../base';

const initialTickGeneratorDataModel: fromModel.ITickGeneratorModel = {
  ...initialBaseStateDataModel,
  lastTick: 0,
  run: false,
  speed: 500,
  duration: 0
};

@State<fromModel.ITickGeneratorModel>({
  name: 'TickGeneratorState',
  defaults: initialTickGeneratorDataModel
})
@Injectable({
  providedIn: 'root'
})
export class TickGeneratorState extends BaseState<fromModel.ITickGeneratorModel> implements NgxsOnDestroy, NgxsOnInit {
  rawState: any;
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
  @Selector()
  static duration$(state: fromModel.ITickGeneratorModel): number {
    return state.duration;
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
    ctx.patchState({ run: false });
    this.store.reset(this.rawState);
    this.store.dispatch(new UpdateState());
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
        tag('gen_tick'),
        switchMap(() => speed$),
        switchMap(speed => combineLatest([run$, timer(speed, speed)])),
        map(([run, tick]) => ({ run, tick })),
        filter(item => item.run),
        map(item => item.tick),
        // filter(tick => tick < 1000),
        scan(acc => acc + 1, 0),
        tap(tick => ctx.patchState({ lastTick: tick })),
        // tap(tick => console.log('tick: ', tick)),
        map(tick => ({ tick, start: performance.now() })),
        switchMap(tick => combineLatest([of(tick.start), this.store.dispatch(new fromModel.TickAction.Tick(tick.tick))])),
        map(([start]) => start),
        // REVIEW rxjs example of scan range of data in stream to make averrage value from it
        scan((acc: { averragePerformance: number; buffer: Array<number> }, curr) => this.prepareBuffer(curr, acc), {
          averragePerformance: 0,
          buffer: []
        }),
        tap(perform => ctx.patchState({ duration: perform.averragePerformance }))
      )
      .subscribe(() => {});
  }
  ngxsOnDestory(): void {}
  ngxsOnInit(ctx: StateContext<fromModel.ITickGeneratorModel>): void {
    this.rawState = JSON.parse(JSON.stringify(this.store.snapshot()));
    this.generateTick(ctx);
  }
  private prepareBuffer(
    start: number,
    data: {
      averragePerformance: number;
      buffer: Array<number>;
    }
  ): { averragePerformance: number; buffer: Array<number> } {
    const currentPerformance = performance.now() - start;
    data.buffer = data.buffer.length > 50 ? this.trimArray([...data.buffer, currentPerformance], 50) : [...data.buffer, currentPerformance];
    data.averragePerformance = data.buffer.reduce((acc, curr) => acc + curr, 0) / data.buffer.length;
    return data;
  }
  private trimArray(data: Array<number>, size: number): Array<number> {
    return data.length <= size ? data : data.slice(data.length - size, size);
  }
}
