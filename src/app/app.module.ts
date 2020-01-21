import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
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
  TickGeneratorState
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
    fromComp.DepartamentComponent,
    fromComp.LineComponent,
    fromComp.InProgressComponent,
    fromComp.ContinentChangeComponent,
    fromComp.ProductChartComponent,
    fromComp.ContainentChartComponent
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
    CardModule,
    SpinnerModule,
    DropdownModule,
    CheckboxModule,
    ChartModule,
    TableModule,
    ToastModule,
    ProgressBarModule,
    RadioButtonModule,
    NgxChartsModule
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
    fromComp.DepartamentComponent,
    fromComp.LineComponent,
    fromComp.InProgressComponent,
    fromComp.ContinentChangeComponent,
    fromComp.ProductChartComponent,
    fromComp.ContainentChartComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  public store: Store;
  // public spy: Spy = create();
}
