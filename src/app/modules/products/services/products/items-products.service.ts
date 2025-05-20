import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemProductResponse, ItemProductSave } from '../../interfaces/item-product.interface';
import { environment } from '../../../../../environments/environments.prod';

@Injectable({providedIn: 'root'})
export class ItemProductService {
  private baseUrl: string = environment.baseUrl + '/product-service';
  constructor(private httpClient: HttpClient) { }

  getListItemProductById(id: Number) : Observable<ItemProductResponse> {
    return this.httpClient.get<ItemProductResponse>(`${this.baseUrl}/itemProduct/${id}`);
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
