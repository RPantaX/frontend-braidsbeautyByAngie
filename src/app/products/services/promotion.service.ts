import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environments';
import { PromotionDTO, PromotionResponsePageable, PromotionWithCategories } from '../interfaces/promotions/promotion.interface';

@Injectable({providedIn: 'root'})
export class PromotionService {

  private baseUrl: string = environment.baseUrl + '/promotion';

  // Add this refresh subject
  private refreshSource = new Subject<void>();

  // Create an observable that components can subscribe to
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) { }

  // Add this method to trigger a refresh
  refreshPromotions(): void {
    this.refreshSource.next();
  }
  getPageablePromotions(pageNo: number = 0, pageSize: number = 10, sortBy: string = '', sortDir: string = 'asc'): Observable<PromotionResponsePageable> {
    return this.http.get<PromotionResponsePageable>(
      `${this.baseUrl}/list/pageable?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  getPromotionById(promotionId: number): Observable<PromotionDTO> {
    return this.http.get<PromotionDTO>(`${this.baseUrl}/${promotionId}`);
  }

  getAllPromotions(): Observable<PromotionDTO[]> {
    return this.http.get<PromotionDTO[]>(`${this.baseUrl}/list`);
  }

  createPromotion(promotion: any): Observable<PromotionDTO> {
    return this.http.post<PromotionDTO>(this.baseUrl, promotion);
  }

  updatePromotion(promotionId: number, promotion: any): Observable<PromotionDTO> {
    return this.http.put<PromotionDTO>(`${this.baseUrl}/${promotionId}`, promotion);
  }

  deletePromotion(promotionId: number): Observable<PromotionDTO> {
    return this.http.delete<PromotionDTO>(`${this.baseUrl}/${promotionId}`);
  }
}
