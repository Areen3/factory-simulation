import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule, Store } from '@ngxs/store';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { SpinnerModule } from 'primeng/spinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import * as fromComp from 'src/component';
import {
  FirmState,
  MarketGeneratorState,
  OfferState,
  OrderState,
  ProductionMenagmentState,
  ProductState,
  SaleSchedulerState,
  StaffState,
  TickGeneratorState,
} from 'src/store';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    fromComp.LifeCycleComponent,
    fromComp.ProductComponent,
    fromComp.MarketDemandComponent,
    fromComp.OffersHistoryComponent,
    fromComp.OrdersHistoryComponent,
    fromComp.FirmFinanceComponent,
    fromComp.ContinentComponent,
    fromComp.WorldComponent,
    fromComp.DepartamentComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot([
      TickGeneratorState,
      ProductState,
      MarketGeneratorState,
      SaleSchedulerState,
      OfferState,
      OrderState,
      ProductionMenagmentState,
      FirmState,
      StaffState
    ]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    FormsModule,
    ButtonModule,
    SliderModule,
    SpinnerModule,
    DropdownModule,
    CheckboxModule,
    ChartModule,
    TableModule,
    ToastModule
  ],
  exports: [
    AppComponent,
    fromComp.LifeCycleComponent,
    fromComp.ProductComponent,
    fromComp.MarketDemandComponent,
    fromComp.OffersHistoryComponent,
    fromComp.OrdersHistoryComponent,
    fromComp.FirmFinanceComponent,
    fromComp.ContinentComponent,
    fromComp.WorldComponent,
    fromComp.DepartamentComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  public store: Store;
}
