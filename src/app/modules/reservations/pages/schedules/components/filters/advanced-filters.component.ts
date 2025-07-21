// advanced-filters.component.ts
import { Component, OnInit, inject, signal, output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface AdvancedFilterCriteria {
  employeeType?: string;
  scheduleState?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  timeRange?: {
    start: string;
    end: string;
  };
}

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.scss']
})
export class AdvancedFiltersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly filtersChanged = output<AdvancedFilterCriteria>();
  readonly visible = signal(false);

  filterForm: FormGroup;

  readonly employeeTypes = [
    { label: 'Todos', value: null },
    { label: 'Trenzadoras', value: 'TRENZADORAS' },
    { label: 'Peluquera', value: 'PELUQUERA' },
    { label: 'Uñas', value: 'UNIAS' },
    { label: 'Oficina', value: 'OFICINA' }
  ];

  readonly scheduleStates = [
    { label: 'Todos', value: null },
    { label: 'Libre', value: 'FREE' },
    { label: 'Reservado', value: 'RESERVED' },
    { label: 'Cancelado', value: 'CANCELLED' }
  ];

  constructor() {
    this.filterForm = this.fb.group({
      employeeType: [null],
      scheduleState: [null],
      startDate: [null],
      endDate: [null],
      startTime: [null],
      endTime: [null]
    });
  }

  ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.emitFilters();
    });
  }

  show(): void {
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  private emitFilters(): void {
    const formValue = this.filterForm.value;
    const filters: AdvancedFilterCriteria = {};

    if (formValue.employeeType) {
      filters.employeeType = formValue.employeeType;
    }

    if (formValue.scheduleState) {
      filters.scheduleState = formValue.scheduleState;
    }

    if (formValue.startDate && formValue.endDate) {
      filters.dateRange = {
        start: formValue.startDate,
        end: formValue.endDate
      };
    }

    if (formValue.startTime && formValue.endTime) {
      filters.timeRange = {
        start: formValue.startTime,
        end: formValue.endTime
      };
    }

    this.filtersChanged.emit(filters);
  }
}
