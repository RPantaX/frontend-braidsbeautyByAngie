import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ResponsePageableProducts, ResponseProduct } from '../../../shared/models/products/product.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class ProductsService {

  private baseUrl: string = environment.baseUrl + '/product-service/product';

  constructor(private http: HttpClient) { }

  getPageableProducts():Observable<ResponsePageableProducts>{
      return this.http.get<ApiResponse<ResponsePageableProducts> >(`${this.baseUrl}/list`).pipe(
      map(response => response.data) );
  }

  getProductById(id: Number): Observable<ResponseProduct >{
    return this.http.get<ApiResponse<ResponseProduct> >(`${this.baseUrl}/${id}`).pipe(
      map(response => response.data) );
  }
  getProducts(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/list`).pipe(
      map(response => response.data) );
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, product);
  }

  updateProduct(productId: number, product: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${productId}`, product);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${productId}`);
  }
}
