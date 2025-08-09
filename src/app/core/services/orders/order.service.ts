import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import {
  RequestShopOrder,
  ResponseShopOrderDetail,
  ResponseListPageableShopOrder,
  ShopOrderDTO
} from '../../../shared/models/orders/order.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class OrderService {
  private baseUrl: string = environment.baseUrl + '/orders-service/order';

  // Add refresh subject
  private refreshSource = new Subject<void>();

  // Create an observable that components can subscribe to
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) { }

  // Add this method to trigger a refresh
  refreshOrders(): void {
    this.refreshSource.next();
  }

  /**
   * Get pageable list of orders
   * @param pageNo Page number (default: 0)
   * @param pageSize Page size (default: 10)
   * @param sortBy Sort field (default: '')
   * @param sortDir Sort direction (default: 'asc')
   * @returns Observable with pageable order list
   */
  getPageableOrders(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = '',
    sortDir: string = 'asc'
  ): Observable<ResponseListPageableShopOrder> {
    return this.http.get<ApiResponse<ResponseListPageableShopOrder>>(
      `${this.baseUrl}/list?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get order by ID
   * @param shopOrderId Order ID
   * @returns Observable with order details
   */
  getOrderById(shopOrderId: number): Observable<ResponseShopOrderDetail> {
    return this.http.get<ApiResponse<ResponseShopOrderDetail>>(`${this.baseUrl}/${shopOrderId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create a new order
   * @param requestShopOrder Order data
   * @returns Observable with created order
   */
  createOrder(requestShopOrder: RequestShopOrder): Observable<ShopOrderDTO> {
    return this.http.post<ApiResponse<ShopOrderDTO>>(this.baseUrl, requestShopOrder).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all orders (non-pageable) - if needed
   * @returns Observable with all orders
   */
  findAllOrders(): Observable<ResponseListPageableShopOrder> {
    return this.http.get<ApiResponse<ResponseListPageableShopOrder>>(`${this.baseUrl}/list`).pipe(
      map(response => response.data || {
        responseShopOrderList: [],
        pageNumber: 0,
        pageSize: 0,
        totalPages: 0,
        totalElements: 0,
        end: true
      })
    );
  }

  /**
   * Get orders by user ID - if this endpoint exists
   * @param userId User ID
   * @returns Observable with user orders
   */
  getOrdersByUserId(userId: number): Observable<ResponseListPageableShopOrder> {
    return this.http.get<ApiResponse<ResponseListPageableShopOrder>>(`${this.baseUrl}/user/${userId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get orders by status - if this endpoint exists
   * @param status Order status
   * @returns Observable with orders by status
   */
  getOrdersByStatus(status: string): Observable<ResponseListPageableShopOrder> {
    return this.http.get<ApiResponse<ResponseListPageableShopOrder>>(`${this.baseUrl}/status/${status}`).pipe(
      map(response => response.data)
    );
  }
}
