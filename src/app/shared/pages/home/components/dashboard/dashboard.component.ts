import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Chart } from 'chart.js/auto';
import { DashboardSummary, SalesAnalytics, TodayTransaction, TopProduct } from '../../../../models/dashboard/dashboard.interface';
import { DashboardService } from '../../../../../core/services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit,AfterViewInit ,OnDestroy {
  @ViewChild('chartCanvas') chartCanvas: any;

  private destroy$ = new Subject<void>();

  // Dashboard data
  dashboardSummary: DashboardSummary | null = null;
  salesAnalytics: SalesAnalytics[] = [];
  todayTransactions: TodayTransaction[] = [];
  topProducts: TopProduct[] = [];

  // Chart configuration
  chart: Chart | null = null;
  chartData: any;
  chartOptions: any;

  // Controls
  analyticsType = 'PRODUCT';
  analyticsPeriod = 'MONTHLY';
  topProductsPeriod = 'MONTHLY';
  customDateRange: Date[] | null = null;

  // Options
  analyticsTypeOptions = [
    { label: 'Productos', value: 'PRODUCT' },
    { label: 'Servicios', value: 'SERVICE' },
    { label: 'Órdenes Totales', value: 'ALL' }
  ];

  periodOptions = [
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
    { label: 'Anual', value: 'YEARLY' }
  ];

  // Loading states
  loading = {
    summary: false,
    analytics: false,
    transactions: false,
    topProducts: false
  };

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) {
    this.initializeChart();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }
 ngAfterViewInit(): void {
    this.loadAnalyticsData();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadDashboardData(): void {
    this.loadSummaryData();
    this.loadAnalyticsData();
    this.loadTodayTransactions();
    this.loadTopProducts();
  }

  private loadSummaryData(): void {
    this.loading.summary = true;
    this.dashboardService.getDashboardSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardSummary = data;
          this.loading.summary = false;
        },
        error: (error) => {
          this.handleError('Error al cargar resumen del dashboard', error);
          this.loading.summary = false;
        }
      });
  }

  private loadAnalyticsData(): void {
    this.loading.analytics = true;
    const startDate = this.customDateRange?.[0] ? this.formatDate(this.customDateRange[0]) : undefined;
    const endDate = this.customDateRange?.[1] ? this.formatDate(this.customDateRange[1]) : undefined;

    this.dashboardService.getSalesAnalytics(this.analyticsType, this.analyticsPeriod, startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.salesAnalytics = data;
          this.updateChart();
          this.loading.analytics = false;
        },
        error: (error) => {
          this.handleError('Error al cargar análisis de ventas', error);
          this.loading.analytics = false;
        }
      });
  }

  private loadTodayTransactions(): void {
    this.loading.transactions = true;
    this.dashboardService.getTodayTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.todayTransactions = data;
          this.loading.transactions = false;
        },
        error: (error) => {
          this.handleError('Error al cargar transacciones del día', error);
          this.loading.transactions = false;
        }
      });
  }

  private loadTopProducts(): void {
    this.loading.topProducts = true;
    this.dashboardService.getTopProducts(this.topProductsPeriod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topProducts = data;
          this.loading.topProducts = false;
        },
        error: (error) => {
          this.handleError('Error al cargar productos más vendidos', error);
          this.loading.topProducts = false;
        }
      });
  }

  onAnalyticsTypeChange(): void {
    this.loadAnalyticsData();
  }

  onAnalyticsPeriodChange(): void {
    this.customDateRange = null; // Reset custom date range
    this.loadAnalyticsData();
  }

  onCustomDateRangeChange(): void {
    if (this.customDateRange && this.customDateRange.length === 2) {
      this.loadAnalyticsData();
    }
  }

  onTopProductsPeriodChange(): void {
    this.loadTopProducts();
  }

  downloadChart(): void {
    if (this.chart) {
      const link = document.createElement('a');
      link.download = `sales-analytics-${new Date().getTime()}.png`;
      link.href = this.chart.toBase64Image();
      link.click();
    }
  }

  exportToXML(): void {
    const xmlData = this.createXMLFromAnalytics();
    const blob = new Blob([xmlData], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-analytics-${new Date().getTime()}.xml`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private createXMLFromAnalytics(): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<SalesAnalytics>\n';
    xml += `  <Type>${this.analyticsType}</Type>\n`;
    xml += `  <Period>${this.analyticsPeriod}</Period>\n`;
    xml += `  <GeneratedDate>${new Date().toISOString()}</GeneratedDate>\n`;
    xml += '  <Data>\n';

    this.salesAnalytics.forEach(item => {
      xml += '    <Period>\n';
      xml += `      <Name>${item.period}</Name>\n`;
      xml += `      <ProductOrders>${item.productOrders}</ProductOrders>\n`;
      xml += `      <ServiceOrders>${item.serviceOrders}</ServiceOrders>\n`;
      xml += `      <TotalOrders>${item.totalOrders}</TotalOrders>\n`;
      xml += '    </Period>\n';
    });

    xml += '  </Data>\n';
    xml += '</SalesAnalytics>';
    return xml;
  }

  private initializeChart(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#495057'
          }
        },
        title: {
          display: true,
          text: 'Análisis de Ventas',
          color: '#495057',
          font: {
            size: 16
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('analyticsChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = this.salesAnalytics.map(item => item.period);
    const datasets = [];

    if (this.analyticsType === 'PRODUCT' || this.analyticsType === 'ALL') {
      datasets.push({
        label: 'Órdenes de Productos',
        data: this.salesAnalytics.map(item => item.productOrders),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      });
    }

    if (this.analyticsType === 'SERVICE' || this.analyticsType === 'ALL') {
      datasets.push({
        label: 'Órdenes de Servicios',
        data: this.salesAnalytics.map(item => item.serviceOrders),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      });
    }

    if (this.analyticsType === 'ALL') {
      datasets.push({
        label: 'Total de Órdenes',
        data: this.salesAnalytics.map(item => item.totalOrders),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      });
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: this.chartOptions
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'CREATED': return 'info';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'Aprobado';
      case 'CREATED': return 'Creado';
      case 'PENDING': return 'Pendiente';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  }

  getOrderTypeIcon(orderType: string): string {
    switch (orderType?.toLowerCase()) {
      case 'product': return 'pi pi-shopping-bag';
      case 'service': return 'pi pi-calendar';
      case 'mixed': return 'pi pi-shopping-cart';
      default: return 'pi pi-question-circle';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  }

  refreshDashboard(): void {
    this.loadDashboardData();
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Dashboard actualizado correctamente',
      life: 2000
    });
  }
}
