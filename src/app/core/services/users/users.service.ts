// services/user.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environments.prod';
import {
  UserDto,
  UserRequest,
  CreateUserRequest,
  UpdateUserRequest,
  RoleDto,
  EmployeeMatchDto,
  EmployeeValidationResponse
} from '../../../shared/models/users/users.interface';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.baseUrl}/user-service/user`;
  private employeeBaseUrl = `${environment.baseUrl}/user-service/employee`;

  // Signals para manejo de estado
  private usersSignal = signal<UserDto[]>([]);
  private rolesSignal = signal<RoleDto[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Observables para refresh
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  // Getters para signals
  get users() { return this.usersSignal.asReadonly(); }
  get roles() { return this.rolesSignal.asReadonly(); }
  get loading() { return this.loadingSignal.asReadonly(); }
  get error() { return this.errorSignal.asReadonly(); }

  constructor(private http: HttpClient) {
    this.loadRoles();
  }

  // ================= CRUD OPERATIONS =================

  /**
   * Obtiene todos los usuarios
   */
  getAllUsers(): Observable<UserDto[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<ApiResponse<UserDto[]>>(`${this.baseUrl}`).pipe(
      map(response => response.data),
      tap(users => {
        this.usersSignal.set(users);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Error loading users');
        return of([]);
      })
    );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(userId: number): Observable<UserDto> {
    this.loadingSignal.set(true);

    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/${userId}`).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Error loading user');
        throw error;
      })
    );
  }

  /**
   * Obtiene un usuario por username
   */
  getUserByUsername(username: string): Observable<UserDto> {
    this.loadingSignal.set(true);

    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/username/${username}`).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Error loading user');
        throw error;
      })
    );
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(userData: CreateUserRequest): Observable<UserDto> {
    this.loadingSignal.set(true);

    const userRequest: UserRequest = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      enabled: userData.enabled,
      admin: userData.admin,
      document: userData.document,
      keycloakId: userData.keycloakId
    };

    return this.http.post<ApiResponse<UserDto>>(`${this.baseUrl}`, userRequest).pipe(
      map(response => response.data),
      tap(() => {
        this.loadingSignal.set(false);
        this.refreshUsers();
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Error creating user');
        throw error;
      })
    );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(userId: number, userData: UpdateUserRequest): Observable<UserDto> {
    this.loadingSignal.set(true);

    const updateData: Partial<UserDto> = {
      username: userData.username,
      email: userData.email,
      enabled: userData.enabled,
      admin: userData.admin,
      roles: userData.roles
    };

    return this.http.put<ApiResponse<UserDto>>(`${this.baseUrl}/${userId}`, updateData).pipe(
      map(response => response.data),
      tap(() => {
        this.loadingSignal.set(false);
        this.refreshUsers();
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Error updating user');
        throw error;
      })
    );
  }

  /**
   * Elimina un usuario
   */
  deleteUser(userId: number): Observable<boolean> {
    this.loadingSignal.set(true);

    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${userId}`).pipe(
      map(response => response.error ? false : true),
      tap(() => {
        this.loadingSignal.set(false);
        this.refreshUsers();
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Error deleting user');
        throw error;
      })
    );
  }

  // ================= ROLE OPERATIONS =================

  /**
   * Obtiene todos los roles disponibles
   */
  getAllRoles(): Observable<RoleDto[]> {
    return this.http.get<ApiResponse<RoleDto[]>>(`${this.baseUrl}/roles`).pipe(
      map(response => response.data),
      tap(roles => {
        this.rolesSignal.set(roles);
      }),
      catchError(error => {
        this.errorSignal.set(error.message || 'Error loading roles');
        return of([]);
      })
    );
  }

  private loadRoles(): void {
    this.getAllRoles().subscribe();
  }

  // ================= VALIDATION OPERATIONS =================

  /**
   * Valida si un usuario existe por keycloakId
   */
  validateUserExists(keycloakId: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/${keycloakId}/validate`).pipe(
      map(response => response.data),
      catchError(() => of(false))
    );
  }

  /**
   * Valida si un username está disponible
   */
  validateUsernameAvailable(username: string, excludeUserId?: number): Observable<boolean> {
    // Esta validación se puede hacer intentando obtener el usuario
    // Si existe, retorna false (no disponible), si no existe, retorna true (disponible)
    return this.getUserByUsername(username).pipe(
      map(user => {
        // Si excludeUserId está presente, verificar si es el mismo usuario
        if (excludeUserId && user.id === excludeUserId) {
          return true; // Disponible para el mismo usuario
        }
        return false; // No disponible
      }),
      catchError(() => of(true)) // Si hay error (usuario no encontrado), está disponible
    );
  }

  /**
   * Valida si un email está disponible
   */
  validateEmailAvailable(email: string, excludeUserId?: number): Observable<boolean> {
    // Similar a username, pero necesitaríamos un endpoint específico
    // Por ahora, validamos obteniendo todos los usuarios
    return this.getAllUsers().pipe(
      map(users => {
        const existingUser = users.find(user =>
          user.email.toLowerCase() === email.toLowerCase()
        );

        if (!existingUser) return true; // Disponible

        // Si excludeUserId está presente, verificar si es el mismo usuario
        if (excludeUserId && existingUser.id === excludeUserId) {
          return true; // Disponible para el mismo usuario
        }

        return false; // No disponible
      }),
      catchError(() => of(true))
    );
  }

  // ================= EMPLOYEE MATCHING =================

  /**
   * Busca un empleado por número de documento
   */
  findEmployeeByDocument(documentNumber: string): Observable<EmployeeMatchDto | null> {
    if (!documentNumber.trim()) {
      return of(null);
    }

    // Usamos el endpoint de empleados para buscar por documento
    return this.http.get<ApiResponse<EmployeeMatchDto[]>>(`${this.employeeBaseUrl}/list/all`).pipe(
      map(response => {
        const employees = response.data;
        const matchedEmployee = employees.find(emp =>
          emp.person?.documentNumber === documentNumber.trim()
        );
        return matchedEmployee || null;
      }),
      catchError(error => {
        console.warn('Error searching employee by document:', error);
        return of(null);
      })
    );
  }
/**
   * Busca empleado por email (funcionalidad adicional)
   */
  findEmployeeByEmail(email: string): Observable<EmployeeMatchDto | null> {
    if (!email.trim()) {
      return of(null);
    }

    return this.http.get<ApiResponse<EmployeeMatchDto[]>>(`${this.employeeBaseUrl}/list/all`).pipe(
      map(response => {
        const employees = response.data;
        const matchedEmployee = employees.find(emp =>
          emp.person?.emailAddress?.toLowerCase() === email.trim().toLowerCase()
        );
        return matchedEmployee || null;
      }),
      catchError(error => {
        console.warn('Error searching employee by email:', error);
        return of(null);
      })
    );
  }

  /**
   * Busca empleados por nombre (funcionalidad adicional)
   */
  searchEmployeesByName(searchTerm: string): Observable<EmployeeMatchDto[]> {
    if (!searchTerm.trim()) {
      return of([]);
    }

    return this.http.get<ApiResponse<EmployeeMatchDto[]>>(`${this.employeeBaseUrl}/list/all`).pipe(
      map(response => {
        const employees = response.data;
        const searchLower = searchTerm.trim().toLowerCase();

        return employees.filter(emp => {
          if (!emp.person) return false;

          const fullName = `${emp.person.name} ${emp.person.lastName}`.toLowerCase();
          const firstName = emp.person.name?.toLowerCase() || '';
          const lastName = emp.person.lastName?.toLowerCase() || '';

          return fullName.includes(searchLower) ||
                 firstName.includes(searchLower) ||
                 lastName.includes(searchLower);
        });
      }),
      catchError(error => {
        console.warn('Error searching employees by name:', error);
        return of([]);
      })
    );
  }
  /**
   * Valida si un empleado puede tener una cuenta de usuario
   */
  validateEmployeeForUser(documentNumber: string): Observable<EmployeeValidationResponse> {
    return this.findEmployeeByDocument(documentNumber).pipe(
      map(employee => ({
        data: employee,
        message: employee ? 'Empleado encontrado' : 'Empleado no encontrado',
        success: !!employee,
        exists: !!employee
      })),
      catchError(error => of({
        data: null,
        message: 'Error validating employee',
        success: false,
        exists: false
      }))
    );
  }
  /**
   * Verifica si un empleado ya tiene usuario asignado
   */
  checkEmployeeHasUser(employeeId: number): Observable<boolean> {
    return this.getAllUsers().pipe(
      map(users => {
        // Buscar si algún usuario tiene este empleado vinculado
        // Esto requeriría información adicional en UserDto sobre el empleado vinculado
        // Por ahora retornamos false
        return false;
      }),
      catchError(() => of(false))
    );
  }

  // ================= ADVANCED SEARCH AND FILTERING =================

  /**
   * Búsqueda avanzada de usuarios
   */
  searchUsers(searchTerm: string): Observable<UserDto[]> {
    return this.getAllUsers().pipe(
      map(users => {
        if (!searchTerm.trim()) return users;

        const search = searchTerm.toLowerCase().trim();
        return users.filter(user =>
          user.username.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.roles.some(role => role.name.toLowerCase().includes(search))
        );
      })
    );
  }

  /**
   * Obtiene usuarios por rol específico
   */
  getUsersByRole(roleName: string): Observable<UserDto[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user =>
        user.roles.some(role => role.name === roleName)
      ))
    );
  }

  /**
   * Obtiene usuarios administradores
   */
  getAdminUsers(): Observable<UserDto[]> {
    return this.getUsersByRole('ROLE_ADMIN');
  }

  /**
   * Obtiene usuarios regulares (no admin)
   */
  getRegularUsers(): Observable<UserDto[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => !this.isUserAdmin(user)))
    );
  }

  /**
   * Obtiene usuarios activos
   */
  getActiveUsers(): Observable<UserDto[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => user.enabled))
    );
  }

  /**
   * Obtiene usuarios inactivos
   */
  getInactiveUsers(): Observable<UserDto[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => !user.enabled))
    );
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  getUserStatistics(): Observable<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    regular: number;
    byRole: { [key: string]: number };
  }> {
    return this.getAllUsers().pipe(
      map(users => {
        const stats = {
          total: users.length,
          active: users.filter(u => u.enabled).length,
          inactive: users.filter(u => !u.enabled).length,
          admins: users.filter(u => this.isUserAdmin(u)).length,
          regular: users.filter(u => !this.isUserAdmin(u)).length,
          byRole: {} as { [key: string]: number }
        };

        // Count by role
        const roles = this.roles();
        roles.forEach(role => {
          stats.byRole[role.name] = users.filter(u =>
            u.roles.some(r => r.name === role.name)
          ).length;
        });

        return stats;
      })
    );
  }
  // ================= UTILITY METHODS =================

  /**
   * Filtra usuarios según criterios
   */
  filterUsers(users: UserDto[], filters: any): UserDto[] {
    return users.filter(user => {
      // Filtro por estado
      if (filters.enabled !== null && filters.enabled !== undefined) {
        if (user.enabled !== filters.enabled) return false;
      }

      // Filtro por admin
      if (filters.admin !== null && filters.admin !== undefined) {
        const isAdmin = this.isUserAdmin(user);
        if (isAdmin !== filters.admin) return false;
      }

      // Filtro por rol
      if (filters.roleId) {
        const hasRole = user.roles.some(role => role.id === filters.roleId);
        if (!hasRole) return false;
      }

      // Búsqueda global
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const matchesUsername = user.username.toLowerCase().includes(searchTerm);
        const matchesEmail = user.email.toLowerCase().includes(searchTerm);
        const matchesRoles = user.roles.some(role =>
          role.name.toLowerCase().includes(searchTerm)
        );

        if (!matchesUsername && !matchesEmail && !matchesRoles) return false;
      }

      return true;
    });
  }

  /**
   * Verifica si un usuario es administrador
   */
  isUserAdmin(user: UserDto): boolean {
    return user.roles.some(role => role.name === 'ROLE_ADMIN');
  }

  /**
   * Obtiene los nombres de roles de un usuario
   */
  getUserRoleNames(user: UserDto): string[] {
    return user.roles.map(role => role.name);
  }

  /**
   * Formatea los roles para mostrar
   */
  formatUserRoles(user: UserDto): string {
    return user.roles.map(role => {
      // Remover prefijo ROLE_ para mostrar
      return role.name.replace('ROLE_', '');
    }).join(', ');
  }

  /**
   * Valida fortaleza de contraseña
   */
  validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isValid: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Debe tener al menos 8 caracteres');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Debe contener al menos una mayúscula');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Debe contener al menos una minúscula');

    if (/\d/.test(password)) score++;
    else feedback.push('Debe contener al menos un número');

    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;
    else feedback.push('Debe contener al menos un carácter especial');

    return {
      score,
      feedback,
      isValid: score >= 4
    };
  }

  // ================= REFRESH METHODS =================

  /**
   * Refresh usuarios
   */
  refreshUsers(): void {
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

  // ================= AVATAR METHODS =================

  /**
   * Genera avatar placeholder basado en username
   */
  generateUserAvatar(username: string): string {
    // Por ahora retornamos un avatar por defecto
    // En el futuro se puede implementar generación de avatars
    return 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
  }

  /**
   * Obtiene las iniciales del usuario
   */
  getUserInitials(user: UserDto): string {
    if (user.username.length >= 2) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  }
}
