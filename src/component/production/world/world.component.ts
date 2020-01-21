import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BaseComponent } from 'src/component/base/base.component';
import { DepartamentState, ProductionMenagmentState } from 'src/store';
import * as fromModel from '../../../model';

// REVIEW angular example of tree child component strucuture word/conatinet/departament/line/progress
@Component({
  selector: 'app-world',
  styleUrls: ['./world.scss'],
  template: `
    <ng-container *ngFor="let containent of containents$ | async | keyvalue">
      <div class="ui-g-2">
        <app-continent [continent]="containent.value"></app-continent>
      </div>
    </ng-container>
  `
})
export class WorldComponent extends BaseComponent implements OnInit {
  departaments$: Observable<any>;
  constructor(public store: Store) {
    super();
  }

  @Select(ProductionMenagmentState.containents$) containents$: Observable<fromModel.TContainentsIndex>;
  ngOnInit(): void {
    this.departaments$ = this.store.select(ProductionMenagmentState.departamentLocalizations$).pipe(
      // REVIEW ngxs example how to subscribe dynamicliy on created new element of store
      switchMap(departamentLocalizations => {
        const depObservable: Array<Observable<any>> = departamentLocalizations
          .map(dep => {
            const obs1 = this.store.selectInContext(DepartamentState.dataToGui$, dep.localization);
            return [obs1];
          })
          .reduce((acc, curr) => [...acc, ...curr], []);
        return of(depObservable).pipe(switchMap(item => combineLatest(...item)));
      }),
      distinctUntilChanged()
    );
    this.subscriptons.add(this.departaments$.subscribe(() => {}));
  }
}
