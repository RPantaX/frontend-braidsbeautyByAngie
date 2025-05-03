import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { Variation } from '../../interfaces/vatiations/variation.interface';

@Injectable({providedIn: 'root'})
export class VariationService {
 private baseUrl: string = environment.baseUrl;
   constructor(private httpClient: HttpClient) { }

   getVariationList() : Observable<Variation[]> {
     return this.httpClient.get<Variation[]>(`${this.baseUrl}/variation/list`);
   }
}
