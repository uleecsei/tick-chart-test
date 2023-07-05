import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { HttpClientModule } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PricesModule } from './prices/prices.module';
import { TickerModule } from './ticker/ticker.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgApexchartsModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    PricesModule,
    TickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
