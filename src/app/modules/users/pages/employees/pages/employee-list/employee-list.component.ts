// pages/employee-list/employee-list.component.ts
import { Component, OnInit, OnDestroy, signal, computed, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';

import {
  EmployeeDto,
  ResponseListPageableEmployee,
  EmployeeFilter,
  EmployeeTypeDto,
  DropdownOption
} from '../../../../../../shared/models/users/employee.interface';
import { EmployeeService } from '../../../../../../core/services/users/employee.service';
import { PaginationState, SortState } from '../../../../../../../@utils/interfaces/Utility';
import { UtilsService } from '../../../../../../core/services/users/utils.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;

  private destroy$ = new Subject<void>();

  // Signals para manejo de estado
  employees = signal<EmployeeDto[]>([]);
  employeeTypes = signal<EmployeeTypeDto[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  // Filtros y paginación
  filters = signal<EmployeeFilter>({
    state: true,
    searchTerm: ''
  });

  pagination = signal<PaginationState>({
    first: 0,
    rows: 10,
    page: 0,
    pageCount: 0
  });

  sort = signal<SortState>({
    sortField: 'id',
    sortOrder: 1
  });

  // Computed values
  filteredEmployeeTypes = computed(() => [
    { label: 'Todos los tipos', value: null },
    ...this.employeeTypes().map(type => ({
      label: type.value,
      value: type.id
    }))
  ]);

  statusOptions = computed(() => [
    { label: 'Todos', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false }
  ]);

  // UI State
  selectedEmployees = signal<EmployeeDto[]>([]);
  globalFilterValue = signal<string>('');

  // Options for dropdowns
  rowsPerPageOptions = [5, 10, 15, 20, 50];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.loadEmployeeTypes();
    this.setupRefreshSubscription();
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= DATA LOADING =================

  private loadEmployeeTypes(): void {
    this.utilsService.getAllEmployeeTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.employeeTypes.set(types);
        },
        error: (error: any) => {
          this.showError('Error al cargar tipos de empleado: ' + error.message);
        }
      });
  }

  private setupRefreshSubscription(): void {
    this.employeeService.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadEmployees();
      });
  }

  loadEmployees(event?: TableLazyLoadEvent): void {
    this.loading.set(true);

    // Update pagination if event provided
    if (event) {
      this.pagination.update(current => ({
        ...current,
        first: event.first || 0,
        rows: event.rows || 10,
        page: Math.floor((event.first || 0) / (event.rows || 10))
      }));

      // Update sort if provided
      if (event.sortField) {
        this.sort.update(current => ({
          sortField: event.sortField as string,
          sortOrder: event.sortOrder || 1
        }));
      }
    }

    const currentPagination = this.pagination();
    const currentSort = this.sort();
    const currentFilters = this.filters();

    // Determine which API to call based on filters
    let apiCall;

    if (currentFilters.employeeTypeId) {
      apiCall = this.employeeService.getEmployeesByType(
        currentPagination.page,
        currentPagination.rows,
        currentSort.sortField,
        currentSort.sortOrder === 1 ? 'asc' : 'desc',
        currentFilters.state ?? true,
        currentFilters.employeeTypeId
      );
    } else {
      apiCall = this.employeeService.getPageableEmployees(
        currentPagination.page,
        currentPagination.rows,
        currentSort.sortField,
        currentSort.sortOrder === 1 ? 'asc' : 'desc',
        currentFilters.state ?? true
      );
    }

    apiCall.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResponseListPageableEmployee) => {
          this.employees.set(response.employeeDtoList);
          this.totalRecords.set(response.totalElements);
          this.pagination.update(current => ({
            ...current,
            pageCount: response.totalPages
          }));
          this.loading.set(false);
        },
        error: (error: any) => {
          this.loading.set(false);
          this.showError('Error al cargar empleados: ' + error.message);
        }
      });
  }

  // ================= FILTER METHODS =================

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.globalFilterValue.set(value);

    this.table.filterGlobal(value, 'contains');
  }

  onStateFilterChange(selectedState: boolean | null): void {
    this.filters.update(current => ({
      ...current,
      state: selectedState ?? true
    }));
    this.resetPaginationAndReload();
  }

  onEmployeeTypeFilterChange(selectedTypeId: number | null): void {
    this.filters.update(current => ({
      ...current,
      employeeTypeId: selectedTypeId || undefined
    }));
    this.resetPaginationAndReload();
  }

  private resetPaginationAndReload(): void {
    this.pagination.update(current => ({
      ...current,
      first: 0,
      page: 0
    }));
    this.loadEmployees();
  }

  clearFilters(): void {
    this.filters.set({
      state: true,
      searchTerm: ''
    });
    this.globalFilterValue.set('');
    this.table.clear();
    this.resetPaginationAndReload();
  }

  // ================= NAVIGATION METHODS =================

  navigateToCreate(): void {
    this.router.navigate(['/test/employees/create']);
  }

  navigateToEdit(employee: EmployeeDto): void {
    this.router.navigate(['/test/employees/edit', employee.id]);
  }

  navigateToDetail(employee: EmployeeDto): void {
    this.router.navigate(['/test/employees/detail', employee.id]);
  }

  // ================= ACTION METHODS =================

  confirmDelete(employee: EmployeeDto): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al empleado ${this.getEmployeeFullName(employee)}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        this.deleteEmployee(employee.id);
      }
    });
  }

  deleteEmployee(employeeId: number): void {
    this.loading.set(true);

    this.employeeService.deleteEmployee(employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Empleado eliminado exitosamente');
          this.loadEmployees();
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al eliminar empleado: ' + error.message);
        }
      });
  }

  confirmDeleteSelected(): void {
    const selectedCount = this.selectedEmployees().length;

    if (selectedCount === 0) {
      this.showWarn('No hay empleados seleccionados para eliminar');
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selectedCount} empleado(s) seleccionado(s)?`,
      header: 'Confirmar Eliminación Múltiple',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar todos',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        this.deleteSelectedEmployees();
      }
    });
  }

  private deleteSelectedEmployees(): void {
    const employeeIds = this.selectedEmployees().map(emp => emp.id);
    let deletedCount = 0;
    let errors = 0;

    this.loading.set(true);

    // Delete employees one by one (since there's no bulk delete endpoint)
    employeeIds.forEach((id, index) => {
      this.employeeService.deleteEmployee(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            deletedCount++;
            if (index === employeeIds.length - 1) {
              this.handleBulkDeleteComplete(deletedCount, errors);
            }
          },
          error: () => {
            errors++;
            if (index === employeeIds.length - 1) {
              this.handleBulkDeleteComplete(deletedCount, errors);
            }
          }
        });
    });
  }

  private handleBulkDeleteComplete(deletedCount: number, errors: number): void {
    this.loading.set(false);
    this.selectedEmployees.set([]);

    if (errors === 0) {
      this.showSuccess(`${deletedCount} empleado(s) eliminado(s) exitosamente`);
    } else {
      this.showWarn(`${deletedCount} empleado(s) eliminado(s), ${errors} error(es)`);
    }

    this.loadEmployees();
  }

  // ================= UTILITY METHODS =================

  getEmployeeFullName(employee: EmployeeDto): string {
    if (employee.person) {
      return `${employee.person.name} ${employee.person.lastName}`;
    }
    return employee.employeeName || 'Sin nombre';
  }

  getEmployeeAvatar(employee: EmployeeDto): string {
    return employee.employeeImage ||
           'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
  }

  getEmployeeStatusSeverity(state: boolean): 'success' | 'danger' {
    return state ? 'success' : 'danger';
  }

  getEmployeeStatusLabel(state: boolean): string {
    return state ? 'Activo' : 'Inactivo';
  }

  getEmployeeTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'STYLIST': 'bg-purple-100 text-purple-800',
      'RECEPTIONIST': 'bg-blue-100 text-blue-800',
      'MANAGER': 'bg-green-100 text-green-800',
      'ASSISTANT': 'bg-yellow-100 text-yellow-800',
      'CLEANER': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // ================= MESSAGE METHODS =================

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  private showWarn(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      life: 3000
    });
  }

  // ================= EXPORT METHODS =================

  exportExcel(): void {
    // Implementation for Excel export
    this.showSuccess('Funcionalidad de exportación en desarrollo');
  }

  exportPDF(): void {
    // Implementation for PDF export
    this.showSuccess('Funcionalidad de exportación en desarrollo');
  }

  // ================= RESPONSIVE METHODS =================

  getTableStyleClass(): string {
    return 'p-datatable-sm p-datatable-striped p-datatable-responsive-demo';
  }

  isSmallScreen(): boolean {
    return window.innerWidth < 768;
  }
}
