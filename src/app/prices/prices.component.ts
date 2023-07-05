import { Component, OnInit } from '@angular/core';
import { RxStompState, } from '@stomp/rx-stomp';
import { ColDef, GetRowIdFunc, GridApi, GridReadyEvent } from 'ag-grid-community';
import { cellClassCallback, columnsCallback, minColumnWidth, TableColumnDefinition, TableData, valueFormatterCallback } from 'ag-grid-lib';

import { Observable, Subject, take, takeUntil, map, Subscription } from 'rxjs';
import { ChartService } from '../service/chart-service.service';
import { PricesDefinition } from './constants/prices-definition';
import { AssetDto } from './dto/asset.dto';
import { PriceDto } from './dto/price.dto';
import { ServerDto } from './dto/server.dto';

import { RxStompService } from './services/rx-stomp.service';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.scss']
})
export class PricesComponent implements OnInit {
  public columnDefs: TableColumnDefinition[] = PricesDefinition;
  public columnsToDisplay: ColDef[] = this.columnDefs.map(columnsCallback.bind(this, cellClassCallback, valueFormatterCallback, minColumnWidth));
  public tableData!: TableData<PriceDto[]>;
  public api!: GridApi;

  public servers$: Observable<ServerDto[]>;
  public assetsClasses: AssetDto[] = [];
  public assets: AssetDto[] = [];

  public selectedServers: number[] = [];
  public selectedAssetsClasses: AssetDto[] = [];
  public selectedAssets: AssetDto[] = [];

  public subscribedTopics: any = {};

  public getRowId: GetRowIdFunc;

  private subscriptions: Subscription = new Subscription();
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private rxStomp: RxStompService, private chartService: ChartService) {
    this.servers$ = this.chartService.servers$;

    this.chartService.fetchAssets();
    this.chartService.fetchServers();
    this.chartService.fetchPrices();

    this.getRowId = params => {
      return params.data.b;
    };
  }

  ngOnInit(): void {
    this.rxStomp.connectionState$.subscribe(state => {
      console.log(RxStompState[state]);
    });

    this.chartService.prices$.pipe(
      takeUntil(this.unsubscribe$),
      map(tableData => this.formatTableData(tableData)))
      .subscribe((tableData) => {
        this.tableData = tableData
      })
  }

  onServerChanged(serverIds: number[]) {
    this.chartService.assets$.pipe(take(1)).subscribe(assets => this.assetsClasses = assets.filter(a => serverIds.includes(a.ServerId)))
    this.selectedServers = serverIds;
    this.setSubscriptionStrings()
  }

  onAssetsClassChanged(selectedAssets: AssetDto[]) {
    this.assets = this.assetsClasses.filter(a => selectedAssets.find(ac => ac.AssetClass === a.AssetClass));

    this.selectedAssetsClasses = selectedAssets
    this.setSubscriptionStrings()
  }

  onAssetsChanged(assets: AssetDto[]) {
    this.selectedAssets = assets;
    this.setSubscriptionStrings()
  }

  onGridReady(event: GridReadyEvent) {
    this.api = event.api;
  }

  onSubscribe() {
    if (!this.selectedServers.length) {
      return
    }

    const topics: string[] = [];
    Object.keys(this.subscribedTopics).map(serverId => {
      if (!Object.keys(this.subscribedTopics[serverId]).length) return topics.push(`${serverId}.*.*`);
      return Object.keys(this.subscribedTopics[serverId]).map(assetClass => {
        const assets = this.subscribedTopics[serverId][assetClass]
        if (!assets.length) return topics.push(`${serverId}.${assetClass}.*`)
        return assets.map((asset: string) => {
          return topics.push(`${serverId}.${assetClass}.${asset}`)
        })
      })
    })

    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();

    topics.map(topic => {
      const obs = this.rxStomp.watch(`/exchange/prices/${topic}`).subscribe((frame) => {
        const price = JSON.parse(frame.body)
        this.api.applyTransactionAsync({
          update: [this.formatFrame(price)]
        });
      })

      this.subscriptions.add(obs);
    })
  }

  setSubscriptionStrings() {
    this.subscribedTopics = {};

    this.selectedServers.map(serverId => {
      this.subscribedTopics[serverId] = {}
    })

    this.selectedAssetsClasses.map(selectedAsset => {
      this.assetsClasses.map(asset => {
        if (asset.AssetClass === selectedAsset.AssetClass) {
          this.subscribedTopics[asset.ServerId][selectedAsset.AssetClass] = []
        }
      });
    })

    this.selectedAssets.map(selectedAsset => {
      this.assetsClasses.map(asset => {
        if (asset.Name === selectedAsset.Name && this.subscribedTopics[asset.ServerId] && this.subscribedTopics[asset.ServerId][asset.AssetClass]) {
          this.subscribedTopics[asset.ServerId][asset.AssetClass].push(selectedAsset.Name)
        }
      })
    })
  }

  handleEventClick(params: any): void { }

  // formatDigits function is used in columnsCallback
  formatDigits(value: number, digits: string): string | null {
    return null
  }

  //formatDate function is used in columnsCallback
  formatDate(value: string | Date, format: string): string | null {
    return null
  }

  formatTableData(prices: PriceDto[]): TableData<PriceDto[]> {
    return {
      Data: prices,
      TotalItems: prices.length
    }
  }

  formatFrame(frame: any) {
    return {
      a: frame.ServerId,
      b: frame.Asset,
      c: frame.Bid,
      d: frame.Ask,
      e: frame.Spread,
      f: frame.Timestamp,
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
