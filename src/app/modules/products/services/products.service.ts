import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { ResponsePageableProducts, ResponseProduct } from '../interfaces/product.interface';
import { error } from 'console';
import { environment } from '../../../../environments/environments.prod';

@Injectable({providedIn: 'root'})
export class ProductsService {

  private baseUrl: string = environment.baseUrl + '/product-service/product';

  constructor(private http: HttpClient) { }

  getPageableProducts():Observable<ResponsePageableProducts>{
      return this.http.get<ResponsePageableProducts>(`${this.baseUrl}/list`);
  }

  getProductById(id: Number): Observable<ResponseProduct >{
    return this.http.get<ResponseProduct>(`${this.baseUrl}/${id}`);
  }
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, product);
  }

  updateProduct(productId: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${productId}`, product);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${productId}`);
  }
}
