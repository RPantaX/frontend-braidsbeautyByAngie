import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { CreateEmployeeRequest, DocumentTypeDto, EmployeeDto, EmployeeTypeDto, ResponseListPageableEmployee } from '../../../shared/models/users/employee.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { EmployeeTypeEnum } from '../../../shared/models/users/employee-type.enum';

@Injectable({providedIn: 'root'})
export class UtilsService {

  private baseUrl: string = environment.baseUrl + '/user-service/utils';

  private http = inject(HttpClient);

  constructor() { }
 // Add this method to trigger a refresh
 getAllDocumentTypes(): Observable<DocumentTypeDto[]> {
    return this.http.get<ApiResponse<DocumentTypeDto[]>>(
      `${this.baseUrl}/list/document-types`
    ).pipe(
      map(response => response.data)
    );
  }
  getAllEmployeeTypes(): Observable<EmployeeTypeDto[]> {
    return this.http.get<ApiResponse<EmployeeTypeDto[]>>(
      `${this.baseUrl}/list/employee-types`
    ).pipe(
      map(response => response.data)
    );
  }
}
