import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PriceDto } from '../dto/price.dto';


@Injectable({
  providedIn: 'root'
})
export class TickerService {
  private _prices$: BehaviorSubject<PriceDto[]> = new BehaviorSubject<PriceDto[]>([]);
  public prices$ = this._prices$.asObservable();

  constructor(private http: HttpClient) { }

  fetchPrices() {
    this.http.get<PriceDto[]>(`${environment.apiUrl2}/price/getprices`).subscribe(res => {
      this._prices$.next(res)
    })
  }

}

