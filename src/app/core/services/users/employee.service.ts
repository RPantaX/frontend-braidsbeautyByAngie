import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { CreateEmployeeRequest, EmployeeDto, ResponseListPageableEmployee } from '../../../shared/models/users/employee.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import { EmployeeTypeEnum } from '../../../shared/models/users/employee-type.enum';

@Injectable({providedIn: 'root'})
export class EmployeeService {

  private baseUrl: string = environment.baseUrl + '/user-service/employee';

  // Signals para manejo de estado
  private employeesSignal = signal<EmployeeDto[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Observables para refresh
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  // Getters para signals
  get employees() { return this.employeesSignal.asReadonly(); }
  get loading() { return this.loadingSignal.asReadonly(); }
  get error() { return this.errorSignal.asReadonly(); }

  private http = inject(HttpClient);

  constructor() { }
 // Add this method to trigger a refresh
  getAllSchedules(): Observable<EmployeeDto[]> {
    return this.http.get<ApiResponse<EmployeeDto[]>>(`${this.baseUrl}/list/all`).pipe(
      map(response => response.data)
    );
  }

    // ================= CRUD OPERATIONS =================

  /**
   * Obtiene empleados paginados
   */
  getPageableEmployees(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc',
    state: boolean = true
  ): Observable<ResponseListPageableEmployee> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('state', state.toString());

    return this.http.get<ApiResponse<ResponseListPageableEmployee>>(
      `${this.baseUrl}/list/pageable`,
      { params }
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false)),
      tap({
        error: (error) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(error.message || 'Error loading employees');
        }
      })
    );
  }

  /**
   * Obtiene empleados por tipo
   */
  getEmployeesByType(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc',
    state: boolean = true,
    employeeTypeId: number
  ): Observable<ResponseListPageableEmployee> {
    this.loadingSignal.set(true);

    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('state', state.toString())
      .set('employeeTypeId', employeeTypeId.toString());

    return this.http.get<ApiResponse<ResponseListPageableEmployee>>(
      `${this.baseUrl}/list/pageable/by-typeId`,
      { params }
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Obtiene empleados por enum de tipo
   */
  getEmployeesByTypeEnum(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc',
    employeeType: EmployeeTypeEnum
  ): Observable<ResponseListPageableEmployee> {
    this.loadingSignal.set(true);

    const params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('employeeType', employeeType);

    return this.http.get<ApiResponse<ResponseListPageableEmployee>>(
      `${this.baseUrl}/list/pageable/by-type-enum`,
      { params }
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Obtiene empleados por múltiples tipos
   */
  getEmployeesByMultipleTypes(
    pageNo: number = 0,
    pageSize: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc',
    employeeTypeIds: number[]
  ): Observable<ResponseListPageableEmployee> {
    this.loadingSignal.set(true);

    let params = new HttpParams()
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    // Add array parameter
    employeeTypeIds.forEach(id => {
      params = params.append('employeeTypeIds', id.toString());
    });

    return this.http.get<ApiResponse<ResponseListPageableEmployee>>(
      `${this.baseUrl}/list/pageable/by-multiple-typesIds`,
      { params }
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Obtiene empleados por IDs
   */
  getEmployeesByIds(employeeIds: number[]): Observable<EmployeeDto[]> {
    this.loadingSignal.set(true);

    return this.http.post<ApiResponse<EmployeeDto[]>>(
      `${this.baseUrl}/list/by-ids`,
      employeeIds
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Obtiene empleados activos por IDs
   */
  getActiveEmployeesByIds(employeeIds: number[]): Observable<EmployeeDto[]> {
    this.loadingSignal.set(true);

    return this.http.post<ApiResponse<EmployeeDto[]>>(
      `${this.baseUrl}/list/active-by-ids`,
      employeeIds
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Obtiene un empleado por ID
   */
  getEmployeeById(employeeId: number): Observable<EmployeeDto> {
    this.loadingSignal.set(true);

    return this.http.get<ApiResponse<EmployeeDto>>(
      `${this.baseUrl}/findById/${employeeId}`
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Obtiene todos los empleados sin paginación
   */
  getAllEmployees(): Observable<EmployeeDto[]> {
    this.loadingSignal.set(true);

    return this.http.get<ApiResponse<EmployeeDto[]>>(
      `${this.baseUrl}/list/all`
    ).pipe(
      map(response => response.data),
      tap(employees => {
        this.employeesSignal.set(employees);
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Crea un nuevo empleado
   */
  createEmployee(employeeData: CreateEmployeeRequest): Observable<boolean> {
    this.loadingSignal.set(true);

    const formData = this.buildFormData(employeeData);

    return this.http.post<ApiResponse<boolean>>(
      `${this.baseUrl}/save`,
      formData
    ).pipe(
      map(response => response.data),
      tap(() => {
        this.loadingSignal.set(false);
        this.refreshEmployees();
      })
    );
  }

  /**
   * Actualiza un empleado existente
   */
  updateEmployee(employeeId: number, employeeData: CreateEmployeeRequest): Observable<boolean> {
    this.loadingSignal.set(true);

    const formData = this.buildFormData(employeeData);

    return this.http.post<ApiResponse<boolean>>(
      `${this.baseUrl}/update/${employeeId}`,
      formData
    ).pipe(
      map(response => response.data),
      tap(() => {
        this.loadingSignal.set(false);
        this.refreshEmployees();
      })
    );
  }

  /**
   * Elimina un empleado
   */
  deleteEmployee(employeeId: number): Observable<boolean> {
    this.loadingSignal.set(true);

    return this.http.delete<ApiResponse<boolean>>(
      `${this.baseUrl}/delete/${employeeId}`
    ).pipe(
      map(response => response.data),
      tap(() => {
        this.loadingSignal.set(false);
        this.refreshEmployees();
      })
    );
  }

  /**
   * Construye FormData para envío de archivos
   */
  private buildFormData(employeeData: CreateEmployeeRequest): FormData {
    const formData = new FormData();

    // Agregar campos de texto
    formData.append('employeeTypeId', employeeData.employeeTypeId.toString());
    formData.append('name', employeeData.name);
    formData.append('lastName', employeeData.lastName);
    formData.append('phoneNumber', employeeData.phoneNumber);
    formData.append('emailAddress', employeeData.emailAddress);
    formData.append('street', employeeData.street);
    formData.append('city', employeeData.city);
    formData.append('state', employeeData.state);
    formData.append('postalCode', employeeData.postalCode);
    formData.append('addressDescription', employeeData.addressDescription);
    formData.append('country', employeeData.country);
    formData.append('documentNumber', employeeData.documentNumber);
    formData.append('documentTypeId', employeeData.documentTypeId.toString());

    // Agregar imagen si existe
    if (employeeData.employeeImage) {
      formData.append('employeeImage', employeeData.employeeImage);
    }

    // Agregar flag de eliminación de archivo
    formData.append('deleteFile', employeeData.deleteFile.toString());

    return formData;
  }

  /**
   * Refresh empleados
   */
  refreshEmployees(): void {
    this.refreshSubject.next();
  }

  /**
   * Reset error state
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Reset loading state
   */
  clearLoading(): void {
    this.loadingSignal.set(false);
  }
}
