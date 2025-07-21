// select-employee.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EmployeeService } from '../../../../../../../core/services/users/employee.service';
import { EmployeeDto } from '../../../../../../../shared/models/users/employee.interface';
import { ScheduleStateService } from '../../../../../../../core/services/reservations/schedule-state.service';

@Component({
  selector: 'app-select-employee',
  templateUrl: './select-employee.component.html',
  styleUrls: ['./select-employee.component.scss']
})
export class SelectEmployeeComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly scheduleState = inject(ScheduleStateService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly employees = signal<EmployeeDto[]>([]);
  readonly filteredEmployees = signal<EmployeeDto[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly selectedEmployeeFromDropdown = signal<EmployeeDto | null>(null);

  // Computed
  readonly selectedEmployee = computed(() => this.scheduleState.selectedEmployee());
  readonly dropdownOptions = computed(() =>
    this.employees().map(emp => ({
      label: `${emp.person?.name} ${emp.person?.lastName} - ${emp.employeeType?.value}`,
      value: emp
    }))
  );

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);

    this.employeeService.getAllSchedules().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.filteredEmployees.set(employees);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar empleados'
        });
        this.loading.set(false);
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.filterEmployees(searchTerm);
  }

  private filterEmployees(term: string): void {
    if (!term) {
      this.filteredEmployees.set(this.employees());
      return;
    }

    const filtered = this.employees().filter(employee => {
      const fullName = `${employee.person?.name} ${employee.person?.lastName}`.toLowerCase();
      const employeeType = employee.employeeType?.value?.toLowerCase() || '';
      const searchLower = term.toLowerCase();

      return fullName.includes(searchLower) || employeeType.includes(searchLower);
    });

    this.filteredEmployees.set(filtered);
  }

  onDropdownChange(employee: EmployeeDto): void {
    this.selectedEmployeeFromDropdown.set(employee);
    this.scheduleState.setSelectedEmployee(employee);
  }

  selectEmployee(employee: EmployeeDto): void {
    this.scheduleState.setSelectedEmployee(employee);
    this.selectedEmployeeFromDropdown.set(employee);
  }

  isEmployeeSelected(employee: EmployeeDto): boolean {
    const selected = this.selectedEmployee();
    return selected?.id === employee.id;
  }

  proceedToNextStep(): void {
    const selected = this.selectedEmployee();
    if (!selected) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor selecciona un empleado'
      });
      return;
    }

    this.router.navigate(['/reservations/schedules/create/select-datetime']);
  }
}
