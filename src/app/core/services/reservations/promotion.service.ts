import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { PromotionDTO, PromotionResponsePageable, PromotionWithCategories } from '../../../shared/models/promotions/promotion.interface';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class PromotionService {

  private baseUrl: string = environment.baseUrl + '/reservation-service/promotion';

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
    return this.http.get<ApiResponse<PromotionResponsePageable>>(
      `${this.baseUrl}/list/pageable?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    ).pipe(
          map(response => response.data)
        )
  }

  getPromotionById(promotionId: number): Observable<PromotionDTO> {
    return this.http.get<ApiResponse<PromotionDTO>>(`${this.baseUrl}/${promotionId}`).pipe(
          map(response => response.data)
        )
  }

  getAllPromotions(): Observable<PromotionDTO[]> {
    return this.http.get<ApiResponse<PromotionDTO[]>>(`${this.baseUrl}/list`).pipe(
          map(response => response.data )
        )
  }

  createPromotion(promotion: any): Observable<PromotionDTO> {
    return this.http.post<ApiResponse<PromotionDTO>>(this.baseUrl, promotion).pipe(
          map(response => response.data)
        )
  }

  updatePromotion(promotionId: number, promotion: any): Observable<PromotionDTO> {
    return this.http.put<ApiResponse<PromotionDTO>>(`${this.baseUrl}/${promotionId}`, promotion).pipe(
          map(response => response.data)
        )
  }

  deletePromotion(promotionId: number): Observable<PromotionDTO> {
    return this.http.delete<ApiResponse<PromotionDTO>>(`${this.baseUrl}/${promotionId}`).pipe(
          map(response => response.data)
        )
  }
}
