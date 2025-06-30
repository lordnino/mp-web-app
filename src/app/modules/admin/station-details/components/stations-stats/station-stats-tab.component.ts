import { Component, ViewEncapsulation } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexStroke,
    ApexTooltip,
    ApexMarkers,
    ApexYAxis,
    ApexGrid,
    ApexLegend,
    ApexFill
} from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    markers: ApexMarkers;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    legend: ApexLegend;
    colors: string[];
    fill: ApexFill;
};

@Component({
    selector     : 'station-stats-tab',
    standalone   : true,
    templateUrl  : './station-stats-tab.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        NgApexchartsModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule
    ],
    styleUrls: ['./station-stats-tab.component.scss']
})
export class StationStatsTabComponent {
    // Period selection logic
    selectedPeriod = 'Year';
    selectPeriod(period: string) {
        this.selectedPeriod = period;
    }

    // Consumed kW/h chart only
    public consumedKwChartOptions: Partial<ChartOptions> = {
        series: [
            { name: 'kW', data: [780, 800, 700, 850, 900, 1000, 825, 950, 800, 700, 800, 700] }
        ],
        chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#3168FF'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3, colors: ['#3168FF'] },
        fill: {
            type: 'solid',
            opacity: 1
        },
        markers: { size: 0, hover: { size: 6 } },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
            crosshairs: {
                show: true,
                width: 1,
                position: 'back',
                stroke: { color: '#3168FF', width: 1, dashArray: 4 }
            }
        },
        yaxis: {
            min: 0,
            max: 1200,
            tickAmount: 6,
            labels: {
                style: { fontSize: '13px', colors: '#7C8DB5' },
                formatter: (val) => `${val} KW`
            }
        },
        grid: { borderColor: '#E9EDF7', strokeDashArray: 4 },
        legend: { show: false },
        tooltip: {
            enabled: true,
            theme: 'light',
            custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                const month = w.globals.categoryLabels[dataPointIndex];
                const value = series[seriesIndex][dataPointIndex];
                return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>
                    <span style='display:inline-block;width:10px;height:10px;background:#3168FF;border-radius:50%;margin-right:8px;'></span>
                    <span><b>${month}</b> : ${value} KW</span>
                </div>`;
            }
        }
    };
    consumedKwValue = '2,026,200 KW';
    consumedKwChange = '+10%';
}
