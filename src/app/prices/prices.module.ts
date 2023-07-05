import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricesComponent } from './prices.component';
import { RxStompService } from './services/rx-stomp.service';
import { rxStompServiceFactory } from './utils/rx-stomp-service-factory';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LightweightChartsComponent } from '../lightweight-charts/lightweight-charts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { UniqPipe } from './pipes/uniq.pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AgGridTableModule } from 'ag-grid-lib'


@NgModule({
  declarations: [
    PricesComponent,
    LightweightChartsComponent,
    UniqPipe
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    AgGridTableModule
  ],
  exports: [
    PricesComponent
  ],
  providers: [
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
    },
  ]
})
export class PricesModule { }
