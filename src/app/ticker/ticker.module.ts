import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { TickerComponent } from './ticker.component';
import { RxStompService } from './services/rx-stomp.service';
import { rxStompServiceFactory } from './utils/rx-stomp-service-factory';
import { PricesModule } from '../prices/prices.module';


@NgModule({
  declarations: [
    TickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    PricesModule,
    ScrollingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [
    TickerComponent,
  ],
  providers: [
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
    },
  ]
})
export class TickerModule { }
