// schedules-list.component.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ScheduleService } from '../../../../../core/services/reservations/schedule.service';
import { CsvExportService } from '../../../../../core/services/reservations/csv-export.service';
import { ResponseScheduleWithEmployee } from '../../../../../shared/models/reservations/schedule.interface';
import { AdvancedFilterCriteria } from '../components/filters/advanced-filters.component';

interface DateFilter {
  type: 'today' | 'week' | 'month' | 'custom' | 'from';
  label: string;
  value: string;
}

interface WeekDay {
  name: string;
  value: number; // 0 = domingo, 1 = lunes, etc.
}

interface EmployeeScheduleGroup {
  employee: any;
  schedules: ResponseScheduleWithEmployee[];
}

type TagSeverity = "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined;

@Component({
  selector: 'app-schedules-list',
  templateUrl: './schedules-list.component.html',
  styleUrls: ['./schedules-list.component.scss'],
  providers: [MessageService]
})
export class SchedulesListComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly csvExportService = inject(CsvExportService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  // Signals
  readonly schedules = signal<ResponseScheduleWithEmployee[]>([]);
  readonly loading = signal(false);
  readonly selectedDateFilter = signal<DateFilter | null>(null);
  readonly customFromDate = signal<Date | null>(null);
  readonly customToDate = signal<Date | null>(null);
  readonly showAdvancedFilters = signal(false);
  readonly activeFilters = signal<AdvancedFilterCriteria>({});

  // Computed
  readonly filteredSchedules = computed(() => {
    return this.schedules();
  });

  readonly groupedSchedules = computed(() => {
    const schedules = this.filteredSchedules();
    const grouped: EmployeeScheduleGroup[] = [];

    // Agrupar horarios por empleado
    const employeeMap = new Map<number, EmployeeScheduleGroup>();

    schedules.forEach(schedule => {
      const employeeId = schedule.employeeDto?.id;
      if (!employeeId) return;

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee: schedule.employeeDto,
          schedules: []
        });
      }

      employeeMap.get(employeeId)?.schedules.push(schedule);
    });

    // Convertir Map a array y ordenar horarios por fecha
    employeeMap.forEach(group => {
      group.schedules.sort((a, b) => {
        return new Date(a.scheduleDTO.scheduleDate).getTime() -
               new Date(b.scheduleDTO.scheduleDate).getTime();
      });
      grouped.push(group);
    });

    return grouped;
  });

  readonly totalSchedules = computed(() => this.filteredSchedules().length);

  // Week days configuration
  readonly weekDays: WeekDay[] = [
    { name: 'Lunes', value: 1 },
    { name: 'Martes', value: 2 },
    { name: 'Miércoles', value: 3 },
    { name: 'Jueves', value: 4 },
    { name: 'Viernes', value: 5 },
    { name: 'Sábado', value: 6 },
    { name: 'Domingo', value: 0 }
  ];

  // Date filter options
  readonly dateFilterOptions: DateFilter[] = [
    { type: 'today', label: 'Hoy', value: 'today' },
    { type: 'week', label: 'Esta semana', value: 'week' },
    { type: 'month', label: 'Este mes', value: 'month' },
    { type: 'from', label: 'Desde fecha...', value: 'from' },
    { type: 'custom', label: 'Rango personalizado', value: 'custom' }
  ];

  ngOnInit(): void {
    this.loadThisWeekSchedules();

    // Suscribirse a refreshes
    this.scheduleService.refresh$.subscribe(() => {
      this.applyCurrentFilter();
    });
  }

  loadThisWeekSchedules(): void {
    this.selectedDateFilter.set(this.dateFilterOptions[1]); // Esta semana
    this.loading.set(true);

    this.scheduleService.getThisWeekSchedules().subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar horarios'
        });
        this.loading.set(false);
      }
    });
  }

  onDateFilterChange(filter: DateFilter): void {
    this.selectedDateFilter.set(filter);
    this.applyFilter(filter);
  }

  onCustomFromDateChange(date: Date): void {
    this.customFromDate.set(date);
    if (this.selectedDateFilter()?.type === 'from') {
      this.applyFromDateFilter(date);
    }
  }

  onCustomDateRangeChange(): void {
    const fromDate = this.customFromDate();
    const toDate = this.customToDate();

    if (fromDate && toDate && this.selectedDateFilter()?.type === 'custom') {
      this.applyCustomRangeFilter(fromDate, toDate);
    }
  }

  private applyFilter(filter: DateFilter): void {
    this.loading.set(true);

    let observable;

    switch (filter.type) {
      case 'today':
        observable = this.scheduleService.getTodaySchedules();
        break;
      case 'week':
        observable = this.scheduleService.getThisWeekSchedules();
        break;
      case 'month':
        observable = this.scheduleService.getThisMonthSchedules();
        break;
      default:
        this.loading.set(false);
        return;
    }

    observable.subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al aplicar filtro'
        });
        this.loading.set(false);
      }
    });
  }

  private applyFromDateFilter(fromDate: Date): void {
    this.loading.set(true);
    const dateString = this.scheduleService.formatDateForBackend(fromDate);

    this.scheduleService.getSchedulesFromDate(dateString).subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al aplicar filtro de fecha'
        });
        this.loading.set(false);
      }
    });
  }

  private applyCustomRangeFilter(fromDate: Date, toDate: Date): void {
    this.loading.set(true);
    const fromDateString = this.scheduleService.formatDateForBackend(fromDate);
    const toDateString = this.scheduleService.formatDateForBackend(toDate);

    this.scheduleService.getSchedulesBetweenDates(fromDateString, toDateString).subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al aplicar rango de fechas'
        });
        this.loading.set(false);
      }
    });
  }

  private applyCurrentFilter(): void {
    const currentFilter = this.selectedDateFilter();
    if (currentFilter) {
      this.applyFilter(currentFilter);
    }
  }

  // Method to get schedules for a specific day
  getSchedulesForDay(schedules: ResponseScheduleWithEmployee[], dayValue: number): ResponseScheduleWithEmployee[] {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduleDTO.scheduleDate + 'T00:00:00');
      return scheduleDate.getDay() === dayValue;
    });
  }

  // Method to get CSS classes for time slots
  getTimeSlotClasses(schedule: ResponseScheduleWithEmployee): string {
    const status = schedule.scheduleDTO.scheduleState?.toUpperCase();
    return `time-slot-${status?.toLowerCase() || 'unknown'}`;
  }

  // Method to get status badge CSS class
  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'FREE':
        return 'status-free';
      case 'RESERVED':
        return 'status-reserved';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  // Handle time slot click
  onTimeSlotClick(schedule: ResponseScheduleWithEmployee): void {
    // Implementar lógica para manejar click en slot de tiempo
    console.log('Time slot clicked:', schedule);
  }

  exportToCsv(): void {
    const schedules = this.filteredSchedules();
    if (schedules.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay horarios para exportar'
      });
      return;
    }

    this.csvExportService.exportSchedulesToCsv(schedules, 'horarios_empleados');
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Horarios exportados correctamente'
    });
  }

  navigateToCreateSchedule(): void {
    this.router.navigate(['/reservations/schedules/create']);
  }

  viewEmployeeDetail(employeeId: number): void {
    this.router.navigate(['/reservations/schedules/employee', employeeId]);
  }

  getScheduleStatusSeverity(status: string): TagSeverity {
    switch (status?.toUpperCase()) {
      case 'FREE':
        return 'success';
      case 'RESERVED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getScheduleStatusText(status: string): string {
    switch (status?.toUpperCase()) {
      case 'FREE':
        return 'Libre';
      case 'RESERVED':
        return 'Reservado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  formatTime(timeString: string): string {
    return timeString?.substring(0, 5) || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(show => !show);
  }

  onAdvancedFiltersChange(filters: AdvancedFilterCriteria): void {
    this.activeFilters.set(filters);
    this.applyAdvancedFilters(filters);
  }

  private applyAdvancedFilters(filters: AdvancedFilterCriteria): void {
    let filteredSchedules = this.schedules();

    if (filters.employeeType) {
      filteredSchedules = filteredSchedules.filter(schedule =>
        schedule.employeeDto?.employeeType?.value === filters.employeeType
      );
    }

    if (filters.scheduleState) {
      filteredSchedules = filteredSchedules.filter(schedule =>
        schedule.scheduleDTO.scheduleState === filters.scheduleState
      );
    }

    // Aplicar otros filtros según sea necesario
  }

  hasActiveFilters(): boolean {
    const filters = this.activeFilters();
    return Object.keys(filters).length > 0;
  }

  clearAllFilters(): void {
    this.activeFilters.set({});
    this.selectedDateFilter.set(this.dateFilterOptions[1]); // Reset to "Esta semana"
    this.loadThisWeekSchedules();
  }
}
