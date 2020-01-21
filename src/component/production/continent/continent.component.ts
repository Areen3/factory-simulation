import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import * as fromModel from 'src/model';
import { DepartamentState, ProductionMenagmentState, TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-continent',
  styleUrls: ['./continent.scss'],
  template: `
    <p class="reset" style="font-size: 12px;">
      <span style="font-weight: bold; font-size: 13px;">{{ continent.localization }}:</span> Department: {{ continent.openDepartaments }}
      <!--Salary modifier: {{ continent.salaryModifier }} -->
      Lines: {{ linesCount$ | async }}
    </p>
    <ng-container *ngFor="let departament of departaments$ | async | keyvalue">
      <div class="ui-g-12">
        <app-departament [departamentId]="departament.value.departamentId"></app-departament>
      </div>
    </ng-container>
  `
})
export class ContinentComponent implements OnInit, OnDestroy {
  @Input()
  continent: fromModel.IContainent;
  linesCount$: Observable<number>;
  departaments$: Observable<Array<fromModel.IDepartamentGui>>;
  constructor(public store: Store) {}

  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnDestroy(): void {}
  ngOnInit(): void {
    this.departaments$ = this.store.select(ProductionMenagmentState.departamentLocalizations$).pipe(
      distinctUntilChanged((a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
      }),
      switchMap(departamentLocalizations => {
        const depObservable = departamentLocalizations.map(dep =>
          this.store.selectInContext(DepartamentState.dataToGui$, dep.localization)
        );
        return of(depObservable).pipe(
          switchMap(item => combineLatest(...item)),
          filter(() => this.continent !== undefined),
          distinctUntilChanged((a, b) => {
            return JSON.stringify(a) === JSON.stringify(b);
          }),
          map((dep: Array<fromModel.IDepartamentGui>) => dep.filter(dep2 => dep2.continent === this.continent.localization))
        );
      })
    );
    this.linesCount$ = this.departaments$.pipe(
      map(dep => dep.reduce((acc, curr) => acc + curr.openLines, 0)),
      distinctUntilChanged()
    );
  }
}
