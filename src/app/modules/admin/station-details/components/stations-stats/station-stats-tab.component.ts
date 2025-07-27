import { Component, ViewEncapsulation, Input, OnChanges, SimpleChanges } from '@angular/core';
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
import { StationsService } from 'app/core/stations/stations.service';

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
export class StationStatsTabComponent implements OnChanges {
    @Input() statistics: any;
    @Input() stationId: string;
    
    // Period and metric selection for each chart
    selectedPeriod = 'year';
    selectedMetrics = {
        consumedKw: 'consumed_kw',
        chargingSessions: 'charging_sessions',
        revenue: 'revenue',
        failureRate: 'failure_rate'
    };

    // Track individual chart periods and metrics
    chartFilters = {
        consumedKw: { period: 'year', metric: 'consumed_kw' },
        chargingSessions: { period: 'year', metric: 'charging_sessions' },
        revenue: { period: 'year', metric: 'revenue' },
        failureRate: { period: 'year', metric: 'failure_rate' }
    };

    // Loading states for each chart
    chartLoading = {
        consumedKw: false,
        chargingSessions: false,
        revenue: false,
        failureRate: false
    };

    constructor(private stationsService: StationsService) {
        // Initialize charts with default data to prevent errors
        this.initializeDefaultCharts();
    }

    ngOnInit() {
        this.loadFilteredStatistics();
    }

    initializeDefaultCharts() {
        const defaultSeries = [{ data: [0], name: 'Default' }];
        const defaultCategories = ['No Data'];
        
        this.consumedKwChartOptions = {
            series: defaultSeries,
            chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
            colors: ['#3168FF'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3, colors: ['#3168FF'] },
            markers: { size: 0, hover: { size: 6 } },
            xaxis: {
                categories: defaultCategories,
                labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                min: 0,
                max: 1000,
                tickAmount: 6,
                labels: {
                    style: { fontSize: '13px', colors: '#7C8DB5' },
                    formatter: (val) => `${val} KW`
                }
            },
            grid: { borderColor: '#E9EDF7', strokeDashArray: 4 },
            legend: { show: false },
            tooltip: { enabled: false },
            fill: { type: 'solid' }
        };

        this.sessionsChartOptions = { ...this.consumedKwChartOptions, colors: ['#FFB200'] };
        this.revenueChartOptions = { ...this.consumedKwChartOptions, colors: ['#00CFE8'] };
        this.failureChartOptions = { ...this.consumedKwChartOptions, colors: ['#FF5B5B'] };
    }

    selectPeriod(period: string, metric?: string) {
        if (metric) {
            // Update only the specific chart that matches the metric
            const chartType = this.getChartTypeByMetric(metric);
            if (chartType) {
                this.chartFilters[chartType].period = period;
                this.loadSingleChartData(chartType);
            }
        } else {
            // Update all charts with the new period (fallback behavior)
            this.selectedPeriod = period;
            Object.keys(this.chartFilters).forEach(chartType => {
                this.chartFilters[chartType].period = period;
                this.loadSingleChartData(chartType);
            });
        }
    }

    getChartTypeByMetric(metric: string): string | null {
        const metricToChartType = {
            'consumed_kw': 'consumedKw',
            'charging_sessions': 'chargingSessions',
            'revenue': 'revenue',
            'failure_rate': 'failureRate'
        };
        return metricToChartType[metric] || null;
    }

    loadFilteredStatistics() {
        if (!this.stationId) {
            console.warn('Station ID not available');
            return;
        }
        
        // Load data for each chart with their individual filters
        Object.keys(this.chartFilters).forEach(chartType => {
            this.loadSingleChartData(chartType);
        });
    }

    loadSingleChartData(chartType: string) {
        if (!this.stationId) {
            console.warn('Station ID not available');
            return;
        }

        // Set loading state for this chart
        this.chartLoading[chartType] = true;

        const filter = this.chartFilters[chartType];
        this.stationsService.getStationStats(this.stationId, filter.period, filter.metric)
            .subscribe({
                next: (data: any) => {
                    const chartData = data.statistics;
                    this.updateChartData(chartType, chartData);
                    // Clear loading state after successful update
                    this.chartLoading[chartType] = false;
                },
                error: (error) => {
                    console.error(`Error loading ${filter.metric} data for ${chartType}:`, error);
                    // Clear loading state on error
                    this.chartLoading[chartType] = false;
                }
            });
    }

    updateChartData(chartType: string, data: any) {
        // Update the specific chart with new data
        switch(chartType) {
            case 'consumedKw':
                this.updateConsumedKwChart(data);
                break;
            case 'chargingSessions':
                this.updateChargingSessionsChart(data);
                break;
            case 'revenue':
                this.updateRevenueChart(data);
                break;
            case 'failureRate':
                this.updateFailureRateChart(data);
                break;
        }
    }

    updateConsumedKwChart(data: any) {
        if (data && data.series && Array.isArray(data.series) && data.series.length > 0 && data.categories) {
            this.consumedKwChartOptions = {
                series: data.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#3168FF'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#3168FF'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: data.categories,
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
                    max: Math.max(...data.series[0].data, 1000),
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#3168FF;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} KW</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalKw = data.series[0].data.reduce((a: number, b: number) => a + b, 0);
            this.consumedKwValue = `${totalKw.toLocaleString()} KW`;
        }
    }

    updateChargingSessionsChart(data: any) {
        if (data && data.series && Array.isArray(data.series) && data.series.length > 0 && data.categories) {
            this.sessionsChartOptions = {
                series: data.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#FFB200'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#FFB200'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: data.categories,
                    labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    crosshairs: {
                        show: true,
                        width: 1,
                        position: 'back',
                        stroke: { color: '#FFB200', width: 1, dashArray: 4 }
                    }
                },
                yaxis: {
                    min: 0,
                    max: Math.max(...data.series[0].data, 900),
                    tickAmount: 6,
                    labels: {
                        style: { fontSize: '13px', colors: '#7C8DB5' },
                        formatter: (val) => `${val} Session`
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#FFB200;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} Session</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalSessions = data.series[0].data.reduce((a: number, b: number) => a + b, 0);
            this.sessionsValue = totalSessions.toLocaleString();
        }
    }

    updateRevenueChart(data: any) {
        if (data && data.series && Array.isArray(data.series) && data.series.length > 0 && data.categories) {
            this.revenueChartOptions = {
                series: data.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#00CFE8'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#00CFE8'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: data.categories,
                    labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    crosshairs: {
                        show: true,
                        width: 1,
                        position: 'back',
                        stroke: { color: '#00CFE8', width: 1, dashArray: 4 }
                    }
                },
                yaxis: {
                    min: 0,
                    max: Math.max(...data.series[0].data, 1200),
                    tickAmount: 6,
                    labels: {
                        style: { fontSize: '13px', colors: '#7C8DB5' },
                        formatter: (val) => `${val} EGP`
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#00CFE8;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} EGP</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalRevenue = data.series[0].data.reduce((a: number, b: number) => a + b, 0);
            this.revenueValue = `${totalRevenue.toLocaleString()} EGP`;
        }
    }

    updateFailureRateChart(data: any) {
        if (data && data.series && Array.isArray(data.series) && data.series.length > 0 && data.categories) {
            this.failureChartOptions = {
                series: data.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#FF5B5B'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#FF5B5B'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: data.categories,
                    labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    crosshairs: {
                        show: true,
                        width: 1,
                        position: 'back',
                        stroke: { color: '#FF5B5B', width: 1, dashArray: 4 }
                    }
                },
                yaxis: {
                    min: 0,
                    max: Math.max(...data.series[0].data, 900),
                    tickAmount: 6,
                    labels: {
                        style: { fontSize: '13px', colors: '#7C8DB5' },
                        formatter: (val) => `${val} %`
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#FF5B5B;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} %</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalFailure = data.series[0].data.reduce((a: number, b: number) => a + b, 0);
            this.failureValue = `${totalFailure.toLocaleString()} %`;
        }
    }

    public consumedKwChartOptions: Partial<ChartOptions> = {};
    public sessionsChartOptions: Partial<ChartOptions> = {};
    public revenueChartOptions: Partial<ChartOptions> = {};
    public failureChartOptions: Partial<ChartOptions> = {};

    consumedKwValue = '';
    consumedKwChange = '';
    sessionsValue = '';
    sessionsChange = '';
    revenueValue = '';
    revenueChange = '';
    failureValue = '';
    failureChange = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['statistics'] && this.statistics) {
            // Consumed kW/h
            this.consumedKwChartOptions = {
                series: this.statistics.consumed_kw.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#3168FF'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#3168FF'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: this.statistics.consumed_kw.categories,
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
                    max: Math.max(...this.statistics.consumed_kw.series[0].data, 1000),
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#3168FF;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} KW</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalKw = this.statistics.consumed_kw.series[0].data.reduce((a, b) => a + b, 0);
            this.consumedKwValue = `${totalKw.toLocaleString()} KW`;
            this.consumedKwChange = '+0%'; // Placeholder, update if you have change data

            // Charging Sessions
            this.sessionsChartOptions = {
                series: this.statistics.charging_sessions.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#FFB200'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#FFB200'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: this.statistics.charging_sessions.categories,
                    labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    crosshairs: {
                        show: true,
                        width: 1,
                        position: 'back',
                        stroke: { color: '#FFB200', width: 1, dashArray: 4 }
                    }
                },
                yaxis: {
                    min: 0,
                    max: Math.max(...this.statistics.charging_sessions.series[0].data, 900),
                    tickAmount: 6,
                    labels: {
                        style: { fontSize: '13px', colors: '#7C8DB5' },
                        formatter: (val) => `${val} Session`
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#FFB200;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} Session</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalSessions = this.statistics.charging_sessions.series[0].data.reduce((a, b) => a + b, 0);
            this.sessionsValue = totalSessions.toLocaleString();
            this.sessionsChange = '-0%'; // Placeholder

            // Revenue
            this.revenueChartOptions = {
                series: this.statistics.revenue.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#00CFE8'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#00CFE8'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: this.statistics.revenue.categories,
                    labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    crosshairs: {
                        show: true,
                        width: 1,
                        position: 'back',
                        stroke: { color: '#00CFE8', width: 1, dashArray: 4 }
                    }
                },
                yaxis: {
                    min: 0,
                    max: Math.max(...this.statistics.revenue.series[0].data, 1200),
                    tickAmount: 6,
                    labels: {
                        style: { fontSize: '13px', colors: '#7C8DB5' },
                        formatter: (val) => `${val} EGP`
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#00CFE8;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} EGP</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalRevenue = this.statistics.revenue.series[0].data.reduce((a, b) => a + b, 0);
            this.revenueValue = `${totalRevenue.toLocaleString()} EGP`;
            this.revenueChange = '+0%'; // Placeholder

            // Failure Rate
            this.failureChartOptions = {
                series: this.statistics.failure_rate.series,
                chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#FF5B5B'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3, colors: ['#FF5B5B'] },
                markers: { size: 0, hover: { size: 6 } },
                xaxis: {
                    categories: this.statistics.failure_rate.categories,
                    labels: { style: { fontSize: '13px', colors: '#7C8DB5' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    crosshairs: {
                        show: true,
                        width: 1,
                        position: 'back',
                        stroke: { color: '#FF5B5B', width: 1, dashArray: 4 }
                    }
                },
                yaxis: {
                    min: 0,
                    max: Math.max(...this.statistics.failure_rate.series[0].data, 900),
                    tickAmount: 6,
                    labels: {
                        style: { fontSize: '13px', colors: '#7C8DB5' },
                        formatter: (val) => `${val} %`
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
                        return `<div style='padding:8px 16px;background:#23272F;border-radius:8px;color:#fff;font-size:15px;display:flex;align-items:center;gap:8px;'>\n <span style='display:inline-block;width:10px;height:10px;background:#FF5B5B;border-radius:50%;margin-right:8px;'></span>\n <span><b>${month}</b> : ${value} %</span>\n</div>`;
                    }
                },
                fill: { type: 'solid' }
            };
            const totalFailure = this.statistics.failure_rate.series[0].data.reduce((a, b) => a + b, 0);
            this.failureValue = `${totalFailure.toLocaleString()} %`;
            this.failureChange = '-0%'; // Placeholder
        }
    }
}
