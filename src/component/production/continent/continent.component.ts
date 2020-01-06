import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import * as fromModel from 'src/model';
import { DepartamentState, FirmState, ProductionMenagmentState, TickGeneratorState } from 'src/store';

@Component({
  selector: 'app-continent',
  styleUrls: ['./continent.scss'],
  templateUrl: './continent.component.html'
})
export class ContinentComponent implements OnInit, OnDestroy {
  firmModel$: Observable<fromModel.IFirmModel>;
  @Input()
  continent: fromModel.IContainent;
  linesCount$: Observable<number>;
  departaments$: Observable<Array<fromModel.IDepartamentGui>>;
  constructor(public store: Store) {
    // console.log('kontytnent utworzony');
  }

  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnDestroy(): void {
    // console.log('tworze on destroy');
  }
  ngOnInit(): void {
    // console.log('tworze on init');
    this.departaments$ = this.store.select(ProductionMenagmentState.departamentLocalizations$).pipe(
      switchMap(departamentLocalizations => {
        const depObservable = departamentLocalizations.map(dep =>
          this.store.selectInContext(DepartamentState.dataToGui$, dep.localization)
        );
        return of(depObservable).pipe(
          switchMap(item => combineLatest(...item)),
          // tap(deploc =>
          //   console.log(`dep gui changed  222222: ${deploc.reduce((acc, curr: fromModel.IDepartamentGui) => acc + curr.departamentId, '')}`)
          // ),
          map((dep: Array<fromModel.IDepartamentGui>) => dep.filter(dep2 => dep2.continent === this.continent.localization))
        );
      }),
      distinctUntilChanged()
    );
    this.linesCount$ = this.departaments$.pipe(
      map(dep => dep.reduce((acc, curr) => acc + curr.openLines, 0)),
      distinctUntilChanged()
    );

    const loc = this.store.getStateLocationByStateClass(FirmState);
    this.firmModel$ = this.store.selectInContext(FirmState.state$, loc);
    // const x = this.store.selectSnapshot(FirmState.state$);
    // const y = this.store.selectSnapshotInContext(FirmState.state$, loc);
  }
}
