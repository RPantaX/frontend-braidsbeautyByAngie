import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { CategoryOption, CategoryRegister, CategoryResponsePageable, ResponseCategory } from '../../../shared/models/categories/category.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class CategoryService {
   private baseUrl: string = environment.baseUrl + '/product-service/category';

      // Add refresh subject
   private refreshSource = new Subject<void>();

   // Create an observable that components can subscribe to
   refresh$ = this.refreshSource.asObservable();

   constructor(private http: HttpClient) { }

   // Add this method to trigger a refresh
   refreshCategories(): void {
     this.refreshSource.next();
   }

   findAllCategories(): Observable<CategoryOption[]> {
     return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/list`).pipe(
       // Map the response to extract the data array
       map(response => response.data || [])
       );
   }
  getPageableCategories(pageNo: number = 0, pageSize: number = 10, sortBy: string = '', sortDir: string = 'asc'): Observable<CategoryResponsePageable> {
    return this.http.get<ApiResponse<CategoryResponsePageable>>(
      `${this.baseUrl}/list/pageable?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    ).pipe(
      map(response => response.data)
    );

  }

  getCategoryById(promotionId: number): Observable<ResponseCategory> {
    return this.http.get<ApiResponse<ResponseCategory>>(`${this.baseUrl}/${promotionId}`).pipe(
      map(response => response.data)
    );
  }
  createCategory(promotion: CategoryRegister): Observable<CategoryRegister> {
    return this.http.post<ApiResponse<CategoryRegister>>(this.baseUrl, promotion).pipe(
      map(response => response.data)
    );
  }

  updateCategory(promotionId: number, promotion: CategoryRegister): Observable<ResponseCategory> {
    return this.http.put<ApiResponse<ResponseCategory>>(`${this.baseUrl}/${promotionId}`, promotion).pipe(
      map(response => response.data)
    );
  }

  deleteCategory(promotionId: number): Observable<ResponseCategory> {
    return this.http.delete<ApiResponse<ResponseCategory>>(`${this.baseUrl}/${promotionId}`).pipe(
      map(response => response.data)
    );
  }
  getCategoryByName(name: string): Observable<ResponseCategory> {
    return this.http.get<ApiResponse<ResponseCategory>>(`${this.baseUrl}/findByName/${name}`).pipe(
      map(response => response.data)
    );
  }
}
