import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Variation } from '../../interfaces/vatiations/variation.interface';
import { environment } from '../../../../../environments/environments.prod';

@Injectable({providedIn: 'root'})
export class VariationService {
 private baseUrl: string = environment.baseUrl + '/product-service/variation';
   constructor(private httpClient: HttpClient) { }

   getVariationList() : Observable<Variation[]> {
     return this.httpClient.get<Variation[]>(`${this.baseUrl}/list`);
   }
}
