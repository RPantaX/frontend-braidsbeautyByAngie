import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { RequestService, ResponseService, ResponseServicePageable, ServiceDTO } from '../../../shared/models/reservations/services.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class ServiceService {

  private baseUrl: string = environment.baseUrl + '/reservation-service/service';

  // Add this refresh subject
  private refreshSource = new Subject<void>();

  // Create an observable that components can subscribe to
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) { }

  // Add this method to trigger a refresh
  refreshServices(): void {
    this.refreshSource.next();
  }

  getPageableServices(pageNo: number = 0, pageSize: number = 10, sortBy: string = '', sortDir: string = 'asc'): Observable<ResponseServicePageable> {
    return this.http.get<ApiResponse<ResponseServicePageable>>(
      `${this.baseUrl}/list?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    ).pipe(
              map(response => response.data)
            )
  }

  getServiceById(serviceId: number): Observable<ResponseService> {
    return this.http.get<ApiResponse<ResponseService>>(`${this.baseUrl}/${serviceId}`).pipe(
              map(response => response.data)
            )
  }
  //get paginable by categoryId
  getPageableServicesByCategoryId(categoryId: number, pageNo: number = 0, pageSize: number = 10, sortBy: string = '', sortDir: string = 'asc'): Observable<ResponseServicePageable> {
    return this.http.get<ApiResponse<ResponseServicePageable>>(
      `${this.baseUrl}/list/category/${categoryId}?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    ).pipe(
              map(response => response.data)
            )
  }

  createService(service: RequestService ): Observable<ServiceDTO> {
    return this.http.post<ApiResponse<ServiceDTO>>(this.baseUrl, service).pipe(
              map(response => response.data)
            )
  }

  updateService(serviceId: number, service: RequestService): Observable<ServiceDTO> {
    return this.http.put<ApiResponse<ServiceDTO>>(`${this.baseUrl}/${serviceId}`, service).pipe(
              map(response => response.data)
            )
  }

  deleteService(serviceId: number): Observable<ServiceDTO> {
    return this.http.delete<ApiResponse<ServiceDTO>>(`${this.baseUrl}/${serviceId}`).pipe(
              map(response => response.data)
            )
  }
}
