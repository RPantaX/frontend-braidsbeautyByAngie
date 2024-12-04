import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponsePageableProducts } from '../interfaces/product.interface';
import { environment } from '../../../environments/environments';

@Injectable({providedIn: 'root'})
export class ProductsService {

  private baseUrl: string = environment.baseUrl;

  constructor(private httpClient: HttpClient) { }

  getPageableProducts():Observable<ResponsePageableProducts>{
      return this.httpClient.get<ResponsePageableProducts>(`${this.baseUrl}/responseListPageableProduct`);
  }

}
