import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ItemProductResponse, ItemProductSave } from '../../../shared/models/products/item-product.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class ItemProductService {
  private baseUrl: string = environment.baseUrl + '/product-service';
  constructor(private httpClient: HttpClient) { }

  getListItemProductById(id: Number) : Observable<ItemProductResponse> {
    return this.httpClient.get<ApiResponse<ItemProductResponse>>(`${this.baseUrl}/itemProduct/${id}`).pipe(
          map(response => response.data)
        );
  }
  saveItemProduct(itemProduct: ItemProductSave): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/itemProduct`, itemProduct);
  }
  updateItemProduct(id: number, itemProduct: ItemProductSave): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/itemProduct/${id}`, itemProduct);
  }
  deleteItemproduct(id: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/itemProduct/${id}`);
  }
}
