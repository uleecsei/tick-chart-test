import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightweightChartsComponent } from './lightweight-charts.component';

describe('LightweightChartsComponent', () => {
  let component: LightweightChartsComponent;
  let fixture: ComponentFixture<LightweightChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LightweightChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LightweightChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
