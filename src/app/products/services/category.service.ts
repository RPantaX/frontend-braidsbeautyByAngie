import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryOption } from '../interfaces/categories/category.interface';

@Injectable({providedIn: 'root'})
export class CategoryService {
   private baseUrl: string = environment.baseUrl + '/category';

   constructor(private http: HttpClient) { }

   findAllCategories(): Observable<CategoryOption[]> {
     return this.http.get<any[]>(`${this.baseUrl}/list`);
   }


}
