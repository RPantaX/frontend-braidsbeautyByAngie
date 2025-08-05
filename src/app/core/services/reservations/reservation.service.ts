import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { RequestReservation, ReservationCore, ReservationDTO, ResponseListPageableReservation, ResponseReservationDetail } from '../../../shared/models/reservations/reservation.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';


@Injectable({ providedIn: 'root' })
export class ReservationService {
  private baseUrl: string = environment.baseUrl + '/reservation-service/reservation';

  // Add refresh subject
  private refreshSource = new Subject<void>();

  // Create an observable that components can subscribe to
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) { }

  // Add this method to trigger a refresh
  refreshReservations(): void {
    this.refreshSource.next();
  }

  /**
   * Lista todas las reservaciones con paginación
   */
  getPageableReservations(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = 'reservationId',
    sortDir: string = 'desc'
  ): Observable<ResponseListPageableReservation> {
    return this.http.get<ApiResponse<ResponseListPageableReservation>>(
      `${this.baseUrl}/list?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene una reservación por ID
   */
  getReservationById(reservationId: number): Observable<ResponseReservationDetail> {
    return this.http.get<ApiResponse<ResponseReservationDetail>>(`${this.baseUrl}/${reservationId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crea una nueva reservación
   */
  createReservation(requestReservationList: RequestReservation[]): Observable<ReservationDTO> {
    return this.http.post<ApiResponse<ReservationDTO>>(this.baseUrl, requestReservationList).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cancela/elimina una reservación (marca como REJECTED)
   */
  cancelReservation(reservationId: number): Observable<ReservationDTO> {
    return this.http.delete<ApiResponse<ReservationDTO>>(`${this.baseUrl}/${reservationId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Reserva una reservación (cambiar estado a APPROVED)
   * Este método parece ser parte del patrón SAGA para integración con otros servicios
   */
  reserveReservation(shopOrderId: number, reservationId: number): Observable<ReservationCore> {
    return this.http.post<ApiResponse<ReservationCore>>(`${this.baseUrl}/reserve`, {
      shopOrderId,
      reservationId
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Cancela una reservación (vuelve al estado CREATED)
   * Este método parece ser parte del patrón SAGA para rollback
   */
  cancelReservationSaga(reservationId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/cancel/${reservationId}`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene todas las reservaciones activas (sin paginación)
   * Útil para dropdowns o selecciones
   */
  findAllActiveReservations(): Observable<ReservationDTO[]> {
    return this.http.get<ApiResponse<ReservationDTO[]>>(`${this.baseUrl}/all`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Busca reservaciones por estado
   */
  findReservationsByState(state: string, pageNo: number = 0, pageSize: number = 10): Observable<ResponseListPageableReservation> {
    return this.http.get<ApiResponse<ResponseListPageableReservation>>(
      `${this.baseUrl}/by-state/${state}?pageNo=${pageNo}&pageSize=${pageSize}`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Busca reservaciones por rango de fechas
   */
  findReservationsByDateRange(
    startDate: string,
    endDate: string,
    pageNo: number = 0,
    pageSize: number = 10
  ): Observable<ResponseListPageableReservation> {
    return this.http.get<ApiResponse<ResponseListPageableReservation>>(
      `${this.baseUrl}/by-date-range?startDate=${startDate}&endDate=${endDate}&pageNo=${pageNo}&pageSize=${pageSize}`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Calcula el precio total de una reservación antes de crearla
   */
  calculateReservationTotal(requestReservationList: RequestReservation[]): Observable<{ totalPrice: number }> {
    return this.http.post<ApiResponse<{ totalPrice: number }>>(`${this.baseUrl}/calculate-total`, requestReservationList).pipe(
      map(response => response.data)
    );
  }
}
