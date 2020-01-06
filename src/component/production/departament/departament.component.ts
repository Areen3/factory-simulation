import { Component, Input, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import * as fromModel from 'src/model';
import { ProductionMenagmentState, TickGeneratorState, DepartamentState, BaseLineProductionState } from 'src/store';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-departament',
  styleUrls: ['./departament.scss'],
  templateUrl: './departament.component.html'
})
export class DepartamentComponent implements OnInit {
  @Input()
  departamentId: fromModel.TDepartamentId;
  departament$: Observable<fromModel.IDepartamentGui>;
  lines$: Observable<Array<fromModel.ILineGui>>;
  constructor(public store: Store) {
    console.log('tworze departament');
  }

  @Select(ProductionMenagmentState.containents$) containents$: Observable<fromModel.TContainentsIndex>;
  @Select(TickGeneratorState.run$) run$: Observable<boolean>;
  ngOnInit(): void {
    this.departament$ = this.store.select(ProductionMenagmentState.departamentLocalizations$).pipe(
      map(dep => dep.find(item => item.departamentId === this.departamentId)),
      switchMap(dep => this.store.selectInContext(DepartamentState.dataToGui$, dep!.localization))
    );
    this.lines$ = this.store.select(ProductionMenagmentState.productionLineDescription$).pipe(
      map(lines => lines.filter(line => line.departamentId === this.departamentId)),
      switchMap(lines =>
        combineLatest(...lines.map(line => this.store.selectInContext(BaseLineProductionState.dataToGui$, line.localization)))
      )
    );
  }
}
