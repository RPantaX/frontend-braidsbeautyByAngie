import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Variation } from '../../../shared/models/vatiations/variation.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class VariationService {
 private baseUrl: string = environment.baseUrl + '/product-service/variation';
   constructor(private httpClient: HttpClient) { }

   getVariationList() : Observable<Variation[]> {
     return this.httpClient.get<ApiResponse<Variation[]>>(`${this.baseUrl}/list`).pipe(
      map(response => response.data) );
   }
}
