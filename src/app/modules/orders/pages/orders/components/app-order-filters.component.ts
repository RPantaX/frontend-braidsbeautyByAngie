import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShopOrderStatusEnum } from '../../../../../shared/models/orders/order.interface';

export interface OrderFilters {
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  searchTerm: string;
  minAmount: number | null;
  maxAmount: number | null;
}

@Component({
  selector: 'app-order-filters',
  template: `
    <p-card styleClass="filter-card">
      <ng-template pTemplate="header">
        <div class="flex align-items-center justify-content-between p-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-filter text-primary"></i>
            <span class="font-semibold">Filtros Avanzados</span>
          </div>
          <p-button
            icon="pi pi-times"
            [rounded]="true"
            [text]="true"
            size="small"
            (onClick)="clearAllFilters()"
            pTooltip="Limpiar todos los filtros">
          </p-button>
        </div>
      </ng-template>

      <form [formGroup]="filtersForm" class="filter-form">
        <div class="formgrid grid">
          <!-- Search Term -->
          <div class="field col-12 md:col-6 lg:col-3">
            <label for="searchTerm" class="font-medium text-900">Buscar</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input
                id="searchTerm"
                type="text"
                pInputText
                formControlName="searchTerm"
                placeholder="ID, factura, ciudad..."
                class="w-full"
                (input)="onFilterChange()" />
            </span>
          </div>

          <!-- Status Filter -->
          <div class="field col-12 md:col-6 lg:col-2">
            <label for="status" class="font-medium text-900">Estado</label>
            <p-dropdown
              id="status"
              formControlName="status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Todos"
              class="w-full"
              (onChange)="onFilterChange()">
            </p-dropdown>
          </div>

          <!-- Date From -->
          <div class="field col-12 md:col-6 lg:col-2">
            <label for="dateFrom" class="font-medium text-900">Desde</label>
            <p-calendar
              id="dateFrom"
              formControlName="dateFrom"
              placeholder="Fecha inicial"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              [maxDate]="maxDate"
              class="w-full"
              (onSelect)="onFilterChange()">
            </p-calendar>
          </div>

          <!-- Date To -->
          <div class="field col-12 md:col-6 lg:col-2">
            <label for="dateTo" class="font-medium text-900">Hasta</label>
            <p-calendar
              id="dateTo"
              formControlName="dateTo"
              placeholder="Fecha final"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              [maxDate]="maxDate"
              [minDate]="filtersForm.get('dateFrom')?.value"
              class="w-full"
              (onSelect)="onFilterChange()">
            </p-calendar>
          </div>

          <!-- Min Amount -->
          <div class="field col-12 md:col-6 lg:col-1">
            <label for="minAmount" class="font-medium text-900">Monto mín.</label>
            <p-inputNumber
              id="minAmount"
              formControlName="minAmount"
              mode="currency"
              currency="PEN"
              locale="es-PE"
              [min]="0"
              placeholder="0.00"
              class="w-full"
              (onInput)="onFilterChange()">
            </p-inputNumber>
          </div>

          <!-- Max Amount -->
          <div class="field col-12 md:col-6 lg:col-1">
            <label for="maxAmount" class="font-medium text-900">Monto máx.</label>
            <p-inputNumber
              id="maxAmount"
              formControlName="maxAmount"
              mode="currency"
              currency="PEN"
              locale="es-PE"
              [min]="0"
              placeholder="0.00"
              class="w-full"
              (onInput)="onFilterChange()">
            </p-inputNumber>
          </div>

          <!-- Clear Button -->
          <div class="field col-12 md:col-12 lg:col-1 flex align-items-end">
            <p-button
              label="Limpiar"
              icon="pi pi-times"
              [outlined]="true"
              severity="secondary"
              size="small"
              (onClick)="clearAllFilters()"
              class="w-full">
            </p-button>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div class="active-filters mt-3" *ngIf="hasActiveFilters()">
          <div class="flex align-items-center gap-2 flex-wrap">
            <span class="text-600 font-medium">Filtros activos:</span>

            <p-chip
              *ngIf="filtersForm.get('searchTerm')?.value"
              [label]="'Búsqueda: ' + filtersForm.get('searchTerm')?.value"
              [removable]="true"
              (onRemove)="removeFilter('searchTerm')">
            </p-chip>

            <p-chip
              *ngIf="filtersForm.get('status')?.value"
              [label]="'Estado: ' + getStatusLabel(filtersForm.get('status')?.value)"
              [removable]="true"
              (onRemove)="removeFilter('status')">
            </p-chip>

            <p-chip
              *ngIf="filtersForm.get('dateFrom')?.value"
              [label]="'Desde: ' + formatDate(filtersForm.get('dateFrom')?.value)"
              [removable]="true"
              (onRemove)="removeFilter('dateFrom')">
            </p-chip>

            <p-chip
              *ngIf="filtersForm.get('dateTo')?.value"
              [label]="'Hasta: ' + formatDate(filtersForm.get('dateTo')?.value)"
              [removable]="true"
              (onRemove)="removeFilter('dateTo')">
            </p-chip>

            <p-chip
              *ngIf="filtersForm.get('minAmount')?.value"
              [label]="'Mín: ' + formatCurrency(filtersForm.get('minAmount')?.value)"
              [removable]="true"
              (onRemove)="removeFilter('minAmount')">
            </p-chip>

            <p-chip
              *ngIf="filtersForm.get('maxAmount')?.value"
              [label]="'Máx: ' + formatCurrency(filtersForm.get('maxAmount')?.value)"
              [removable]="true"
              (onRemove)="removeFilter('maxAmount')">
            </p-chip>
          </div>
        </div>
      </form>
    </p-card>
  `,
  styles: [`
    .filter-card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 1px solid var(--surface-border);
    }

    .active-filters {
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }

    .filter-form .field {
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .filter-form .field {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class OrderFiltersComponent implements OnInit {
  @Input() initialFilters: Partial<OrderFilters> = {};
  @Output() filtersChange = new EventEmitter<OrderFilters>();
  @Output() filtersReset = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  filtersForm!: FormGroup;
  maxDate = new Date();

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Creado', value: ShopOrderStatusEnum.CREATED },
    { label: 'Aprobado', value: ShopOrderStatusEnum.APPROVED },
    { label: 'Rechazado', value: ShopOrderStatusEnum.REJECTED }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.filtersForm = this.fb.group({
      searchTerm: [this.initialFilters.searchTerm || ''],
      status: [this.initialFilters.status || ''],
      dateFrom: [this.initialFilters.dateFrom || null],
      dateTo: [this.initialFilters.dateTo || null],
      minAmount: [this.initialFilters.minAmount || null],
      maxAmount: [this.initialFilters.maxAmount || null]
    });
  }

  onFilterChange(): void {
    const filters: OrderFilters = this.filtersForm.value;
    this.filtersChange.emit(filters);
  }

  clearAllFilters(): void {
    this.filtersForm.reset();
    this.filtersReset.emit();
    this.onFilterChange();
  }

  removeFilter(filterName: string): void {
    this.filtersForm.patchValue({ [filterName]: filterName.includes('Amount') ? null : '' });
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    const values = this.filtersForm.value;
    return Object.values(values).some(value =>
      value !== null && value !== undefined && value !== ''
    );
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toLocaleDateString('es-PE');
  }

  formatCurrency(amount: number): string {
    if (!amount) return '';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }
}
