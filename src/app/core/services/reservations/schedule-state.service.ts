// schedule-state.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { EmployeeDto } from '../../../shared/models/users/employee.interface';
import { RequestSchedule } from '../../../shared/models/reservations/schedule.interface';

export interface ScheduleFormData {
  selectedEmployee: EmployeeDto | null;
  schedules: RequestSchedule[];
  currentStep: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleStateService {
  private _scheduleData = signal<ScheduleFormData>({
    selectedEmployee: null,
    schedules: [],
    currentStep: 0
  });

  // Computed signals
  readonly scheduleData = computed(() => this._scheduleData());
  readonly selectedEmployee = computed(() => this._scheduleData().selectedEmployee);
  readonly schedules = computed(() => this._scheduleData().schedules);
  readonly currentStep = computed(() => this._scheduleData().currentStep);
  readonly isValidStep1 = computed(() => this.selectedEmployee() !== null);
  readonly isValidStep2 = computed(() => this.schedules().length > 0);

  // Actions
  setSelectedEmployee(employee: EmployeeDto | null): void {
    this._scheduleData.update(data => ({
      ...data,
      selectedEmployee: employee
    }));
  }

  addSchedule(schedule: RequestSchedule): void {
    this._scheduleData.update(data => ({
      ...data,
      schedules: [...data.schedules, schedule]
    }));
  }

  removeSchedule(index: number): void {
    this._scheduleData.update(data => ({
      ...data,
      schedules: data.schedules.filter((_, i) => i !== index)
    }));
  }

  setCurrentStep(step: number): void {
    this._scheduleData.update(data => ({
      ...data,
      currentStep: step
    }));
  }

  resetState(): void {
    this._scheduleData.set({
      selectedEmployee: null,
      schedules: [],
      currentStep: 0
    });
  }
}
