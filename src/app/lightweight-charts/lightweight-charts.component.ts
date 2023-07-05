import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { createChart, IChartApi, ISeriesApi, LineData, LogicalRange } from 'lightweight-charts';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { EAsset, IChartPriceData } from '../interface/chart-data.interface';
import { ChartService } from '../service/chart-service.service';
import * as moment from 'moment';

@Component({
  selector: 'app-lightweight-charts',
  templateUrl: './lightweight-charts.component.html',
  styleUrls: ['./lightweight-charts.component.scss']
})

export class LightweightChartsComponent implements OnInit, OnDestroy, AfterViewInit {
  public chart!: IChartApi;
  public lineSeries!: ISeriesApi<"Line">;
  public markerSeries!: ISeriesApi<"Line">;

  public asset = EAsset.EURUSD
  public dateFrom = '2022-03-17';
  public dateTo = '2022-03-17';
  public loading: boolean = true;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private chartService: ChartService) { }

  ngOnInit(): void {
    this.chartService.chartsData$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      if (!data.length) {
        return this.chartService.fetchCharts(this.asset, this.dateFrom, this.dateTo)
      }

      this.setChartData(data);
    });
  }

  ngAfterViewInit(): void {
    this.initChart()
    this.initListeners()
  }

  initChart() {
    this.chart = createChart('lightweight-chart', {
      height: 500,
      localization: {
        timeFormatter: this.formatToolTipTime,
      },
      timeScale: {
        rightBarStaysOnScroll: true,
        shiftVisibleRangeOnNewBar: false,
        tickMarkFormatter: this.formatTime
      },
      handleScale: {
        mouseWheel: false,
      },
      handleScroll: {
        pressedMouseMove: false,
      },
    });

    this.lineSeries = this.chart.addLineSeries();
    // this.markerSeries = this.chart.addLineSeries({ color: '#fff0' });
  }

  initListeners() {
    const obs$ = new Observable<LogicalRange>(observer => this.chart.timeScale().subscribeVisibleLogicalRangeChange(x => x && observer.next(x)))
    obs$.pipe(debounceTime(300), takeUntil(this.unsubscribe$)).subscribe(value => {
      const barsInfo = this.lineSeries.barsInLogicalRange(value);
      if (!barsInfo || (barsInfo && (barsInfo.barsAfter >= 0 && barsInfo.barsBefore >= 0))) return

      this.disableChart();

      if (barsInfo.barsAfter < 0) {
        this.dateFrom = this.dateTo = this.calculateDate(barsInfo.to as number, 1);

      } else {
        this.dateFrom = this.dateTo = this.calculateDate(barsInfo.from as number, -1);
      }
      this.chartService.fetchCharts(this.asset, this.dateFrom, this.dateTo, barsInfo.barsAfter < 0)
    })
  }

  setChartData(data: IChartPriceData[]) {
    const _data = data.map((datum) => ({ time: datum.f, value: datum.c })).sort((x, y) => x.time! - y.time!);

    // ======= EXAMPLE FOR MARKERS =======
    // const markers: any[] = []
    //
    // const _data2 = data.map(datum => {
    // if (index === 1 || index === 30 || index === 70) {
    //   markers.push({
    //     crosshairMarkerVisible: false,
    //     time: datum.d,
    //     position: "inBar",
    //     color: "green",
    //     shape: "circle",
    //   })
    // }
    //   return ({ time: datum.f, value: datum.d })
    // }).sort((x, y) => {
    //   return x.time! - y.time!;
    // });
    //
    // markerSeries.setData(_data2 as LineData[])
    // markerSeries.setMarkers(markers);
    // ===================================

    this.lineSeries.setData(_data as LineData[])
    this.enableChart();

    // ======= Listeners =======
  }

  calculateDate(date: number, diff: number): string {
    return moment(date).utc().add(diff, 'day').format('yyyy-MM-D')
  }

  formatTime(e: number) {
    return moment(e).utc().format('HH:mm:ss')
  }

  formatToolTipTime(e: number) {
    return moment(e).utc().format('yyyy-MM-DD HH:mm:ss')
  }

  enableChart() {
    this.loading = false
    this.chart.applyOptions({ handleScroll: { pressedMouseMove: true }, handleScale: { mouseWheel: true } })
  }

  disableChart() {
    this.loading = true
    this.chart.applyOptions({ handleScroll: { pressedMouseMove: false }, handleScale: { mouseWheel: false } })
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
