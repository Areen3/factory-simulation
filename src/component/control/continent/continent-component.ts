import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EProductKind, IContainent, IProduct, ProductionAction, TContainentsArray } from 'src/model';
import { ProductionMenagmentState, FirmState } from 'src/store';
import { tag } from 'rxjs-spy/operators';

@Component({
  selector: 'app-continent-change',
  styleUrls: ['continent.scss'],
  templateUrl: `continent-component.html`
})
export class ContinentChangeComponent implements OnInit {
  selectedProduct: IProduct;
  productKind: typeof EProductKind = EProductKind;
  containents$: Observable<TContainentsArray>;
  maxDepartaments: number = 1;
  maxLinesPerDepartament: number = 1;
  @Select(FirmState.ekspertMode$) ekspertMode$: Observable<boolean>;
  constructor(public store: Store) {}

  ngOnInit(): void {
    this.containents$ = this.store.select(ProductionMenagmentState.containents$).pipe(
      tag('comp_continent'),
      map((item): TContainentsArray => Object.values(item)),
      map(cont => cont.map(item => ({ ...item })))
    );
    this.store.dispatch(new ProductionAction.UpdateMaxDep(this.maxDepartaments));
    this.store.dispatch(new ProductionAction.UpdateMaxLine(this.maxLinesPerDepartament));
  }
  maxLinesPerDepartamentChange(event: any, containent: IContainent): void {
    containent.maxLinesPerDepartament = event.value;
    this.store.dispatch(new ProductionAction.UpdateContainents({ ...containent, maxLinesPerDepartament: event.value }));
  }
  maxDepartamentsChange(event: any, containent: IContainent): void {
    containent.maxDepartaments = event.value;
    this.store.dispatch(new ProductionAction.UpdateContainents({ ...containent, maxDepartaments: event.value }));
  }
  allLines(event: any): void {
    this.maxLinesPerDepartament = event.value;
    this.store.dispatch(new ProductionAction.UpdateMaxLine(event.value));
  }
  allDepartamentsChange(event: any): void {
    this.maxDepartaments = event.value;
    this.store.dispatch(new ProductionAction.UpdateMaxDep(event.value));
  }
  salaryModifierChange(event: any, containent: IContainent): void {
    containent.salaryModifier = event.value;
    this.store.dispatch(new ProductionAction.UpdateContainents({ ...containent, salaryModifier: event.value }));
  }
  departamentStartUpCostChange(event: any, containent: IContainent): void {
    containent.departamentStartUpCost = event.value;
    this.store.dispatch(new ProductionAction.UpdateContainents({ ...containent, departamentStartUpCost: event.target.value }));
  }
  onDropDownChange(e: any): void {
    this.productKind = { ...e.value };
  }
}
