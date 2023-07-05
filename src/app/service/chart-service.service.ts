import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IChartPriceData } from '../interface/chart-data.interface';
import { environment } from 'src/environments/environment';

import { AssetDto } from '../prices/dto/asset.dto';
import { ServerDto } from '../prices/dto/server.dto';
import { PriceDto } from '../prices/dto/price.dto';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private _chartsData$: BehaviorSubject<IChartPriceData[]> = new BehaviorSubject<IChartPriceData[]>([]);
  public chartsData$ = this._chartsData$.asObservable();

  private _servers$: BehaviorSubject<ServerDto[]> = new BehaviorSubject<ServerDto[]>([]);
  public servers$ = this._servers$.asObservable();

  private _assets$: BehaviorSubject<AssetDto[]> = new BehaviorSubject<AssetDto[]>([]);
  public assets$ = this._assets$.asObservable();

  private _prices$: BehaviorSubject<PriceDto[]> = new BehaviorSubject<PriceDto[]>([]);
  public prices$ = this._prices$.asObservable();

  constructor(private http: HttpClient) { }

  fetchCharts(asset: string, dateFrom: string, dateTo: string, append?: boolean) {
    this.http.get<IChartPriceData[]>(`${environment.apiUrl}/Price/GetHistoricTicks?asset=${asset}&dateFrom=${dateFrom}&dateTo=${dateTo}`).subscribe((data) => {
      this._chartsData$.next(append ? [...this._chartsData$.value, ...data] : [...data, ...this._chartsData$.value])
    })
  }

  fetchServers() {
    this.http.get<ServerDto[]>(`${environment.apiUrl}/Servers/GetServers`).subscribe(res => {
      this._servers$.next(res)
    })
  }

  fetchAssets() {
    this.http.get<AssetDto[]>(`${environment.apiUrl}/Asset/GetAssets`).subscribe(res => {
      this._assets$.next(res)
    })
  }

  fetchPrices() {
    this.http.get<PriceDto[]>(`${environment.apiUrl}/Price/GetPrices`).subscribe(res => {
      this._prices$.next(res)
    })
  }

}

