import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, Subject } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { Login, TokenResponse, TokenValidationResponse, User } from '../../../shared/models/auth/auth.interface';
import { Router } from '@angular/router';
import { KeyStorage } from '../../../../@utils/enums/KeyStorage';
import { LocalStorageService } from '../../../shared/services/storage/local-storage.service';
import { EmployeeDto } from '../../../shared/models/users/employee.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({providedIn: 'root'})
export class EmployeeService {

  private baseUrl: string = environment.baseUrl + '/user-service/employee';
  private router = inject(Router);
  private http = inject(HttpClient);
  private _localStorageService = inject(LocalStorageService);

  // Add this refresh subject
    private refreshSource = new Subject<void>();

    // Create an observable that components can subscribe to
    refresh$ = this.refreshSource.asObservable();
  constructor() { }
 // Add this method to trigger a refresh
  refreshServices(): void {
    this.refreshSource.next();
  }
  getAllSchedules(): Observable<EmployeeDto[]> {
    return this.http.get<ApiResponse<EmployeeDto[]>>(`${this.baseUrl}/list/all`).pipe(
      map(response => response.data)
    );
  }
}
