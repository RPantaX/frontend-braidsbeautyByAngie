import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { RequestService, ResponseService, ResponseServicePageable, ServiceDTO } from '../../../shared/models/reservations/services.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { RequestSchedule, ResponseListPageableSchedule, ResponseSchedule, ResponseScheduleWithEmployee, ScheduleDTO } from '../../../shared/models/reservations/schedule.interface';

@Injectable({providedIn: 'root'})
export class ScheduleService {

  private baseUrl: string = environment.baseUrl + '/reservation-service/schedule';

  // Add this refresh subject
  private refreshSource = new Subject<void>();

  // Create an observable that components can subscribe to
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) { }

  // Add this method to trigger a refresh
  refreshServices(): void {
    this.refreshSource.next();
  }
/**
   * Obtiene schedules paginados
   */
  getPageableSchedules(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = '',
    sortDir: string = 'asc'
  ): Observable<ResponseListPageableSchedule> {
    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ApiResponse<ResponseListPageableSchedule>>(
      `${this.baseUrl}/list/pageable`, { params }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene un schedule por ID
   */
  getScheduleById(scheduleId: number): Observable<ResponseSchedule> {
    return this.http.get<ApiResponse<ResponseSchedule>>(`${this.baseUrl}/${scheduleId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene todos los schedules con empleados
   */
  getAllSchedules(): Observable<ResponseScheduleWithEmployee[]> {
    return this.http.get<ApiResponse<ResponseScheduleWithEmployee[]>>(`${this.baseUrl}/list`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crea un nuevo schedule
   */
  createSchedule(schedule: RequestSchedule): Observable<ScheduleDTO> {
    return this.http.post<ApiResponse<ScheduleDTO>>(this.baseUrl, schedule).pipe(
      map(response => response.data)
    );
  }
  createSchedulesBulk(schedules: RequestSchedule[]): Observable<ScheduleDTO[]> {
        return this.http.post<ApiResponse<ScheduleDTO[]>>(this.baseUrl + '/bulk', schedules).pipe(
          map(response => response.data)
        );
    }
  /**
   * Actualiza un schedule existente
   */
  updateSchedule(scheduleId: number, schedule: RequestSchedule): Observable<ScheduleDTO> {
    return this.http.put<ApiResponse<ScheduleDTO>>(`${this.baseUrl}/${scheduleId}`, schedule).pipe(
      map(response => response.data)
    );
  }

  /**
   * Elimina un schedule
   */
  deleteSchedule(scheduleId: number): Observable<ScheduleDTO> {
    return this.http.delete<ApiResponse<ScheduleDTO>>(`${this.baseUrl}/${scheduleId}`).pipe(
      map(response => response.data)
    );
  }

  // ================= MÉTODOS NUEVOS PARA FILTROS POR FECHA =================

  /**
   * Obtiene schedules desde una fecha específica
   */
  getSchedulesFromDate(fromDate: string): Observable<ResponseScheduleWithEmployee[]> {
    const params = new HttpParams().set('fromDate', fromDate);

    return this.http.get<ApiResponse<ResponseScheduleWithEmployee[]>>(
      `${this.baseUrl}/list/from-date`, { params }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene schedules entre un rango de fechas
   */
  getSchedulesBetweenDates(fromDate: string, toDate: string): Observable<ResponseScheduleWithEmployee[]> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<ApiResponse<ResponseScheduleWithEmployee[]>>(
      `${this.baseUrl}/list/between-dates`, { params }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene schedules para una fecha específica
   */
  getSchedulesBySpecificDate(date: string): Observable<ResponseScheduleWithEmployee[]> {
    const params = new HttpParams().set('date', date);

    return this.http.get<ApiResponse<ResponseScheduleWithEmployee[]>>(
      `${this.baseUrl}/list/by-date`, { params }
    ).pipe(
      map(response => response.data)
    );
  }

  // ================= MÉTODOS HELPER =================

  /**
   * Convierte Date a string formato ISO para el backend
   */
  formatDateForBackend(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Convierte time a string formato para el backend
   */
  formatTimeForBackend(time: Date): string {
    return time.toTimeString().split(' ')[0]; // HH:mm:ss
  }

  /**
   * Convierte string de fecha del backend a Date
   */
  parseBackendDate(dateString: string): Date {
    return new Date(dateString + 'T00:00:00');
  }

  /**
   * Convierte string de tiempo del backend a Date (solo para mostrar tiempo)
   */
  parseBackendTime(timeString: string): Date {
    const today = new Date();
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    today.setHours(hours, minutes, seconds || 0, 0);
    return today;
  }

  /**
   * Obtiene schedules de hoy
   */
  getTodaySchedules(): Observable<ResponseScheduleWithEmployee[]> {
    const today = this.formatDateForBackend(new Date());
    return this.getSchedulesBySpecificDate(today);
  }

  /**
   * Obtiene schedules de esta semana
   */
  getThisWeekSchedules(): Observable<ResponseScheduleWithEmployee[]> {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    return this.getSchedulesBetweenDates(
      this.formatDateForBackend(startOfWeek),
      this.formatDateForBackend(endOfWeek)
    );
  }

  /**
   * Obtiene schedules de este mes
   */
  getThisMonthSchedules(): Observable<ResponseScheduleWithEmployee[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.getSchedulesBetweenDates(
      this.formatDateForBackend(startOfMonth),
      this.formatDateForBackend(endOfMonth)
    );
  }

  /**
   * Obtiene schedules futuros (desde mañana)
   */
  getFutureSchedules(): Observable<ResponseScheduleWithEmployee[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getSchedulesFromDate(this.formatDateForBackend(tomorrow));
  }
}

