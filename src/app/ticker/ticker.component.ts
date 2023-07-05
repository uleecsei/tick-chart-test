import { Component, OnInit } from '@angular/core';
import { RxStompState } from '@stomp/rx-stomp';
import { UntypedFormControl } from '@angular/forms';

import { takeUntil, Subscription, Subject, map } from 'rxjs';

import { RxStompService } from './services/rx-stomp.service';
import { TickerService } from './services/ticker.service';
import { PriceTableDto } from './dto/price-table.dto';
import { FrameDto } from './dto/frame.dto';
import { PriceDto } from './dto/price.dto';
import * as moment from 'moment';

let sortedColumn = '';
let sorting = '';

@Component({
  selector: 'app-ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.scss']
})
export class TickerComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  private unsubscribe$: Subject<void> = new Subject();

  prices: PriceTableDto = {
    value: {
      a: '1',
      b: 2,
      c: 3,
      d: 3
    }
  };
  filteredPrices: PriceTableDto = {
    value: {
      a: '1',
      b: 2,
      c: 3,
      d: 3
    }
  };
  showSubscribeButton = false;

  filter = new UntypedFormControl('');
  sortedColumn = '';
  sorting = '';
  nextDirection = 'asc';

  constructor(private rxStomp: RxStompService, private tickerService: TickerService) {
    this.tickerService.fetchPrices();
  }

  ngOnInit(): void {
    this.rxStomp.connectionState$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(state => {
      console.log(RxStompState[state]);
    });

    this.tickerService.prices$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((prices) => {
      prices.map((item) => {
        this.prices[item.a] = item;
        this.filteredPrices[item.a] = item;
      });
      this.showSubscribeButton = !!prices.length;
    });

    this.filter.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      map((filterValue) => this.filterPrices(filterValue)),
    ).subscribe((prices) => {
      this.filteredPrices = prices;
    });
  }

  filterPrices(searchString: string): PriceTableDto {
    if (searchString) {
      const newPrices: PriceTableDto = {};
      for(let [key, value] of Object.entries(this.prices)) {
        if (key.toLowerCase().indexOf(searchString.toLowerCase()) >= 0 || this.formatTime(value.d).indexOf(searchString) >= 0) {
          newPrices[key] = value;
        }
      }
      return newPrices;
    } else {
      return JSON.parse(JSON.stringify(this.prices));
    }
  }

  resetSearch(): void {
    this.filter.setValue('');
  }

  onSubscribe() {
    if (!Object.keys(this.prices).length) {
      return
    }

    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();

    const obs = this.rxStomp.watch('/exchange/prices/assets.*').subscribe((frame) => {
      const price = this.formatFrame(JSON.parse(frame.body));
      if (this.prices[price.a]) {
        price.isBidGreater = price.b > this.prices[price.a].b;
        price.isBidLess = price.b < this.prices[price.a].b;
        price.isAskGreater = price.c > this.prices[price.a].c;
        price.isAskLess = price.c < this.prices[price.a].c;
        this.prices[price.a] = price;
      }

      if (this.filteredPrices[price.a]) {
        price.isBidGreater = price.b > this.filteredPrices[price.a].b;
        price.isBidLess = price.b < this.filteredPrices[price.a].b;
        price.isAskGreater = price.c > this.filteredPrices[price.a].c;
        price.isAskLess = price.c < this.filteredPrices[price.a].c;
        this.filteredPrices[price.a] = price;
      }
    });

    this.subscriptions.add(obs);
  }

  onSortChange(columnName: string): void {
    let dir = '';

    if (this.sortedColumn !== columnName) {
      dir = 'asc';
      this.nextDirection = 'asc';
      this.sorting = '';
    } else {
      dir = this.nextDirection;
    }

    this.sortedColumn = columnName;
    sortedColumn = this.sortedColumn;
    this.sorting = dir;
    sorting = this.sorting;
    this.nextDirection = this.nextDirection === 'asc' ? 'desc'
      : this.nextDirection === 'desc' ? 'no sort'
        : 'asc';

    this.filteredPrices = JSON.parse(JSON.stringify(this.filteredPrices));
  }

  defaultSortKeyValuePipe(this: any, a: any, b: any): number {
    if (!sortedColumn || sorting === 'no sort') {
      return 1;
    }
    if (a.value[sortedColumn] < b.value[sortedColumn]){
      return sorting === 'asc' ? -1 : 1;
    }
    if (a.value[sortedColumn] > b.value[sortedColumn]){
      return sorting === 'asc' ? 1 : -1;
    }
    return 0;
  }

  formatFrame(frame: FrameDto): PriceDto {
    return {
      a: frame.Symbol,
      b: frame.Bid,
      c: frame.Ask,
      d: frame.Ctm,
    }
  }

  formatTime(e: number): string {
    return moment(e).utc().format('HH:mm:ss');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
