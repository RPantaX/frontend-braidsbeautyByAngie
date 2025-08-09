import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environments.prod';
import {
  DashboardSummary,
  SalesAnalytics,
  TodayTransaction,
  TopProduct
} from '../../../shared/models/dashboard/dashboard.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl: string = environment.baseUrl + '/orders-service/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/summary`).pipe(
      map(response => response.data)
    );
  }

  getSalesAnalytics(
    type: string = 'PRODUCT',
    period: string = 'MONTHLY',
    startDate?: string,
    endDate?: string
  ): Observable<SalesAnalytics[]> {
    let params = new HttpParams()
      .set('type', type)
      .set('period', period);

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ApiResponse<SalesAnalytics[]>>(`${this.baseUrl}/analytics`, { params }).pipe(
      map(response => response.data)
    );
  }

  getTodayTransactions(): Observable<TodayTransaction[]> {
    return this.http.get<ApiResponse<TodayTransaction[]>>(`${this.baseUrl}/transactions/today`).pipe(
      map(response => response.data)
    );
  }

  getTopProducts(period: string = 'MONTHLY'): Observable<TopProduct[]> {
    const params = new HttpParams().set('period', period);

    return this.http.get<ApiResponse<TopProduct[]>>(`${this.baseUrl}/top-products`, { params }).pipe(
      map(response => response.data)
    );
  }
  /* getDashboardSummary(): Observable<DashboardSummary> {
    // Mock data temporalmente
    const mockData: DashboardSummary = {
      totalSalesThisMonth: 15482.50,
      inStoreOrdersCount: 25,
      onlineOrdersPercentage: 75.5,
      starProductsCount: 8
    };

    return of(mockData).pipe(delay(500)); // Simular delay de API
  }

  getSalesAnalytics(
    type: string = 'PRODUCT',
    period: string = 'MONTHLY',
    startDate?: string,
    endDate?: string
  ): Observable<SalesAnalytics[]> {
    const mockData: SalesAnalytics[] = [
      { period: 'Ene', productOrders: 120, serviceOrders: 80, totalOrders: 200 },
      { period: 'Feb', productOrders: 150, serviceOrders: 95, totalOrders: 245 },
      { period: 'Mar', productOrders: 180, serviceOrders: 110, totalOrders: 290 },
      { period: 'Abr', productOrders: 165, serviceOrders: 105, totalOrders: 270 },
      { period: 'May', productOrders: 200, serviceOrders: 130, totalOrders: 330 }
    ];

    return of(mockData).pipe(delay(800));
  }

  getTodayTransactions(): Observable<TodayTransaction[]> {
    const mockData: TodayTransaction[] = [
      {
        orderId: '#12345',
        customerName: 'María García',
        orderType: 'Product',
        orderDate: new Date(),
        status: 'APPROVED',
        amount: 250.00
      },
      {
        orderId: '#12346',
        customerName: 'Ana López',
        orderType: 'Service',
        orderDate: new Date(),
        status: 'PENDING',
        amount: 180.00
      }
    ];

    return of(mockData).pipe(delay(600));
  }

  getTopProducts(period: string = 'MONTHLY'): Observable<TopProduct[]> {
    const mockData: TopProduct[] = [
      {
        productImage: 'assets/images/product1.jpg',
        productName: 'Shampoo Premium',
        category: 'Cuidado Capilar',
        price: 45.00,
        totalSold: 150
      },
      {
        productImage: 'assets/images/product2.jpg',
        productName: 'Mascarilla Nutritiva',
        category: 'Tratamientos',
        price: 65.00,
        totalSold: 120
      }
    ];

    return of(mockData).pipe(delay(700));
  }*/
}
