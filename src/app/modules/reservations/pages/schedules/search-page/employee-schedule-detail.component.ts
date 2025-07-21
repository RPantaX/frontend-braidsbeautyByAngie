// employee-schedule-detail.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ScheduleService } from '../../../../../core/services/reservations/schedule.service';
import { EmployeeService } from '../../../../../core/services/users/employee.service';
import { EmployeeDto } from '../../../../../shared/models/users/employee.interface';
import { ResponseScheduleWithEmployee } from '../../../../../shared/models/reservations/schedule.interface';


type TagSeverity = "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined;

@Component({
  selector: 'app-employee-schedule-detail',
  templateUrl: './employee-schedule-detail.component.html',
  styleUrls: ['./employee-schedule-detail.component.scss'],
  providers: [MessageService]
})
export class EmployeeScheduleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly scheduleService = inject(ScheduleService);
  private readonly employeeService = inject(EmployeeService);
  private readonly messageService = inject(MessageService);

  readonly employee = signal<EmployeeDto | null>(null);
  readonly schedules = signal<ResponseScheduleWithEmployee[]>([]);
  readonly loading = signal(false);
  readonly employeeId = signal<number>(0);

  // Computed
  readonly groupedSchedules = computed(() => {
    const scheduleList = this.schedules();
    const grouped = new Map<string, ResponseScheduleWithEmployee[]>();

    scheduleList.forEach(schedule => {
      const date = schedule.scheduleDTO.scheduleDate;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(schedule);
    });

    // Sort by date and time
    const sortedEntries = Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Most recent first
      .map(([date, schedules]) => ({
        date,
        schedules: schedules.sort((a, b) =>
          a.scheduleDTO.scheduleHourStart.localeCompare(b.scheduleDTO.scheduleHourStart)
        )
      }));

    return sortedEntries;
  });

  readonly totalSchedules = computed(() => this.schedules().length);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const employeeId = +params['employeeId'];
      if (employeeId) {
        this.employeeId.set(employeeId);
        this.loadEmployeeData(employeeId);
        this.loadEmployeeSchedules(employeeId);
      }
    });
  }

  private loadEmployeeData(employeeId: number): void {
    this.loading.set(true);

    // Load all employees and find the specific one
    this.employeeService.getAllSchedules().subscribe({
      next: (employees) => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (employee) {
          this.employee.set(employee);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Empleado no encontrado'
          });
          this.router.navigate(['/reservations/schedules']);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar datos del empleado'
        });
        this.loading.set(false);
      }
    });
  }

  private loadEmployeeSchedules(employeeId: number): void {
    // Get all schedules and filter by employee
    this.scheduleService.getAllSchedules().subscribe({
      next: (allSchedules) => {
        const employeeSchedules = allSchedules.filter(
          schedule => schedule.employeeDto?.id === employeeId
        );
        this.schedules.set(employeeSchedules);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar horarios del empleado'
        });
        this.loading.set(false);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return timeString?.substring(0, 5) || '';
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

  goBack(): void {
    this.router.navigate(['/reservations/schedules']);
  }

  exportEmployeeSchedules(): void {
    // Implementation for CSV export specific to this employee
    const schedules = this.schedules();
    if (schedules.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay horarios para exportar'
      });
      return;
    }

    // Use the CSV export service (inject it)
    // this.csvExportService.exportSchedulesToCsv(schedules, `horarios_${employee.name}`);
  }
}
