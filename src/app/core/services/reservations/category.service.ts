import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { CategoryOption, CategoryRegister, CategoryResponsePageable, ResponseCategory } from '../../../shared/models/categories/category.interface';
import { environment } from '../../../../environments/environments.prod';

@Injectable({providedIn: 'root'})
export class CategoryService {
   private baseUrl: string = environment.baseUrl + '/reservation-service/category';

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
     return this.http.get<any[]>(`${this.baseUrl}/list`);
   }
  getPageableCategories(pageNo: number = 0, pageSize: number = 10, sortBy: string = '', sortDir: string = 'asc'): Observable<CategoryResponsePageable> {
    return this.http.get<CategoryResponsePageable>(
      `${this.baseUrl}/list?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  getCategoryById(promotionId: number): Observable<ResponseCategory> {
    return this.http.get<ResponseCategory>(`${this.baseUrl}/${promotionId}`);
  }
  createCategory(promotion: CategoryRegister): Observable<CategoryRegister> {
    return this.http.post<CategoryRegister>(this.baseUrl, promotion);
  }

  updateCategory(promotionId: number, promotion: CategoryRegister): Observable<ResponseCategory> {
    return this.http.put<ResponseCategory>(`${this.baseUrl}/${promotionId}`, promotion);
  }

  deleteCategory(promotionId: number): Observable<ResponseCategory> {
    return this.http.delete<ResponseCategory>(`${this.baseUrl}/${promotionId}`);
  }

}
