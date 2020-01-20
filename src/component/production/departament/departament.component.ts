import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, filter } from 'rxjs/operators';
import * as fromModel from 'src/model';
import { BaseLineProductionState, DepartamentState, ProductionMenagmentState, TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-departament',
  styleUrls: ['./departament.scss'],
  template: `
    <div class="ui-g">
      <div class="ui-g-12">
        <p class="reset style__p">
          <span class="style__span">Deparament:</span> {{ (departament$ | async).departamentId }}
          <span class="style__span">Employment:</span> {{ (departament$ | async).employment }} <span class="style__span">Lines:</span>
          {{ (departament$ | async).openLines }}
        </p>
      </div>
      <ng-container *ngFor="let line of lines$ | async | keyvalue">
        <div class="ui-g-12">
          <app-line [line]="line.value"></app-line>
        </div>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartamentComponent implements OnInit {
  @Input()
  departamentId: fromModel.TDepartamentId;
  departament$: Observable<fromModel.IDepartamentGui>;
  lines$: Observable<Array<fromModel.ILineGui>>;
  constructor(public store: Store) {
    // console.log('tworze departament');
  }

  @Select(ProductionMenagmentState.containents$) containents$: Observable<fromModel.TContainentsIndex>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.departament$ = this.store.select(ProductionMenagmentState.departamentLocalizations$).pipe(
      map(dep => dep.find(item => item.departamentId === this.departamentId)),
      filter(dep => dep !== undefined),
      switchMap(dep => this.store.selectInContext(DepartamentState.dataToGui$, dep!.localization))
    );
    this.lines$ = this.store.select(ProductionMenagmentState.productionLineLocalizations$).pipe(
      map(lines => lines.filter(line => line.departamentId === this.departamentId)),
      // tap(lines => console.log('lindes changed: ', lines)),
      switchMap(lines => combineLatest(lines.map(line => this.store.selectInContext(BaseLineProductionState.dataToGui$, line.location))))
    );
  }
}
