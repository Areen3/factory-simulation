import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import * as fromModel from 'src/model';
import { BaseLineProductionState, ProductionMenagmentState, TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-line',
  styleUrls: ['./line.scss'],
  template: `
    <!-- <p class="reset style__p"></p> -->
    <ng-container *ngIf="line !== undefined">
      <div class="ui-g">
        <div class="ui-g-2">
          <!-- <span class="style__span">{{ line.lineId }}: {{ line.productionCapacity - line.freeCapacity }}/{{ line.productionCapacity }}:</span> -->
          <span class="style__span"
            >{{ line.lineId }}: {{ line.productionCapacity - line.freeCapacity }}/{{ line.productionCapacity }}:</span
          >
        </div>
        <ng-container *ngIf="inProduces$ | async as inProduces">
          <ng-container *ngIf="inProduces !== undefined">
            <ng-container *ngFor="let inProduce of inProduces | keyvalue">
              <div class="ui-g-2">
                <app-in-progress [inProgress]="inProduce.value"></app-in-progress>
              </div>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent implements OnInit {
  @Input()
  line: fromModel.ILineGui;
  inProduces$: Observable<Array<fromModel.IInProduceOnTheLine>>;
  constructor(public store: Store) {}

  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.inProduces$ = this.store.select(ProductionMenagmentState.productionLineLocalizations$).pipe(
      map(item => item.find(l => this.line.lineId === l.lineId)),
      filter(item => item !== undefined),
      switchMap(item => {
        return this.store.selectInContext(BaseLineProductionState.production$, item!.location);
      }),
      map((item): Array<fromModel.IInProduceOnTheLine> => (item === undefined ? [] : Object.values(item))),
      filter(items => items.length !== 0),
      map(items => items.filter(item => item.tickTaken !== 0)),
      distinctUntilChanged((a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
      })
    );
  }
}
