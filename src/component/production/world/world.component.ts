import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { DepartamentState, ProductionMenagmentState } from 'src/store';

import * as fromModel from '../../../model';
import { BaseComponent } from 'src/component/base/base.component';

@Component({
  selector: 'app-world',
  styleUrls: ['./world.scss'],
  templateUrl: './world.component.html'
})
export class WorldComponent extends BaseComponent implements OnInit {
  departaments$: Observable<any>;
  continent: any;
  constructor(public store: Store) {
    super();
  }

  @Select(ProductionMenagmentState.containents$) containents$: Observable<fromModel.TContainentsIndex>;
  ngOnInit(): void {
    this.departaments$ = this.store.select(ProductionMenagmentState.departamentLocalizations$).pipe(
      switchMap(departamentLocalizations => {
        console.log('lokalizacja departamentu' + departamentLocalizations.reduce((acc, curr) => acc + curr.localization.path + ';', ''));
        const depObservable: Array<Observable<any>> = departamentLocalizations
          .map(dep => {
            // const s1 = DepartamentState.dataToGui$;
            // const s2 = this.store.selectInContext2([DepartamentState], DepartamentState.dataToGui2$, dep.localization);
            // const obs2 = this.store.select(s2);
            const obs1 = this.store.selectInContext(DepartamentState.dataToGui$, dep.localization);
            // const obs1 = this.store.selectInContext(s1, dep.localization);
            // return [obs1, obs2];
            return [obs1];
            // return [obs2];
          })
          .reduce((acc, curr) => [...acc, ...curr], []);

        return of(depObservable).pipe(
          switchMap(item => combineLatest(...item)),
          tap(deploc => {
            // console.log(`dep gui changed: ${deploc.reduce((acc, curr: fromModel.IDepartamentGui) => acc + curr.departamentId, '')}`);
            console.log('dep gui changed: ', deploc);
          })
          // map((dep: Array<fromModel.IDepartamentGui>) => dep.filter(dep2 => dep2.continent === this.continent.localization))
        );
      }),
      distinctUntilChanged()
    );
    this.subscriptons.add(this.departaments$.subscribe(() => {}));
  }
}
