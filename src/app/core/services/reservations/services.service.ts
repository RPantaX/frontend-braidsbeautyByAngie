import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { RequestService, ResponseService, ResponseServicePageable, ServiceDTO } from '../../../shared/models/reservations/services.interface';

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
    return this.http.get<ResponseServicePageable>(
      `${this.baseUrl}/list?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  getServiceById(serviceId: number): Observable<ResponseService> {
    return this.http.get<ResponseService>(`${this.baseUrl}/${serviceId}`);
  }

  createService(service: RequestService ): Observable<ServiceDTO> {
    return this.http.post<ServiceDTO>(this.baseUrl, service);
  }

  updateService(serviceId: number, service: RequestService): Observable<ServiceDTO> {
    return this.http.put<ServiceDTO>(`${this.baseUrl}/${serviceId}`, service);
  }

  deleteService(serviceId: number): Observable<ServiceDTO> {
    return this.http.delete<ServiceDTO>(`${this.baseUrl}/${serviceId}`);
  }
}
