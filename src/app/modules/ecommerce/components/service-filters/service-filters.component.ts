import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ServiceFilterOptions } from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-service-filters',
  template: `
    <div class="service-filters">
      <!-- Quick Filters -->
      <div class="filter-section">
        <h4 class="filter-title">Filtros Rápidos</h4>
        <div class="quick-filters">
          <p-checkbox
            [(ngModel)]="filters.isAvailable"
            binary="true"
            inputId="isAvailable"
            (onChange)="onFiltersChange()">
          </p-checkbox>
          <label for="isAvailable" class="filter-label">Solo disponibles</label>
        </div>
        <div class="quick-filters">
          <p-checkbox
            [(ngModel)]="filters.hasPromotion"
            binary="true"
            inputId="hasPromotion"
            (onChange)="onFiltersChange()">
          </p-checkbox>
          <label for="hasPromotion" class="filter-label">En promoción</label>
        </div>
      </div>

      <!-- Categories -->
      <div class="filter-section" *ngIf="filterOptions?.categories?.length">
        <h4 class="filter-title">Categorías</h4>
        <div class="category-filters">
          <div class="category-item" *ngFor="let category of filterOptions?.categories">
            <p-checkbox
              [(ngModel)]="category.selected"
              binary="true"
              [inputId]="'cat-' + category.id"
              (onChange)="onCategoryChange(category)">
            </p-checkbox>
            <label [for]="'cat-' + category.id" class="category-label">
              {{ category.name }}
              <span class="category-count" *ngIf="category.serviceCount">
                ({{ category.serviceCount }})
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Price Range -->
      <div class="filter-section">
        <h4 class="filter-title">Precio</h4>
        <div class="price-filter">
          <div class="price-inputs">
            <div class="price-input-group">
              <label>Mínimo</label>
              <p-inputNumber
                [(ngModel)]="filters.priceRange.min"
                mode="currency"
                currency="PEN"
                [min]="0"
                (onInput)="onFiltersChange()">
              </p-inputNumber>
            </div>
            <div class="price-input-group">
              <label>Máximo</label>
              <p-inputNumber
                [(ngModel)]="filters.priceRange.max"
                mode="currency"
                currency="PEN"
                [min]="filters.priceRange.min"
                (onInput)="onFiltersChange()">
              </p-inputNumber>
            </div>
          </div>
          <p-slider
            [(ngModel)]="priceRangeValues"
            [range]="true"
            [min]="filterOptions?.priceRange?.min || 0"
            [max]="filterOptions?.priceRange?.max || 500"
            [step]="10"
            (onChange)="onPriceRangeChange($event)">
          </p-slider>
        </div>
      </div>

      <!-- Duration Range -->
      <div class="filter-section">
        <h4 class="filter-title">Duración (minutos)</h4>
        <div class="duration-filter">
          <div class="duration-inputs">
            <div class="duration-input-group">
              <label>Mínimo</label>
              <p-inputNumber
                [(ngModel)]="filters.durationRange.min"
                [min]="0"
                suffix=" min"
                (onInput)="onFiltersChange()">
              </p-inputNumber>
            </div>
            <div class="duration-input-group">
              <label>Máximo</label>
              <p-inputNumber
                [(ngModel)]="filters.durationRange.max"
                [min]="filters.durationRange.min"
                suffix=" min"
                (onInput)="onFiltersChange()">
              </p-inputNumber>
            </div>
          </div>
          <p-slider
            [(ngModel)]="durationRangeValues"
            [range]="true"
            [min]="filterOptions?.durationRange?.minMinutes || 0"
            [max]="filterOptions?.durationRange?.maxMinutes || 240"
            [step]="15"
            (onChange)="onDurationRangeChange($event)">
          </p-slider>
        </div>
      </div>

      <!-- Employees -->
      <div class="filter-section" *ngIf="filterOptions?.employees?.length">
        <h4 class="filter-title">Especialistas</h4>
        <div class="employee-filters">
          <div class="employee-item" *ngFor="let employee of filterOptions?.employees">
            <!--<p-checkbox
              [(ngModel)]="employee.selected"
              binary="true"
              [inputId]="'emp-' + employee.id"
              (onChange)="onEmployeeChange(employee)">
            </p-checkbox> -->
            <label [for]="'emp-' + employee.id" class="employee-label">
              {{ employee.name }}
              <span class="employee-specialty" *ngIf="employee.specialty">
                - {{ employee.specialty }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Clear Filters -->
      <div class="filter-actions">
        <p-button
          label="Limpiar Filtros"
          icon="pi pi-refresh"
          [outlined]="true"
          styleClass="w-full"
          (onClick)="clearFilters()">
        </p-button>
      </div>
    </div>
  `,
  //styleUrls: ['./service-filters.component.scss']
})
export class ServiceFiltersComponent {
  @Input() filterOptions: ServiceFilterOptions | null = null;
  @Input() filters: any = {
    categories: [],
    priceRange: { min: 0, max: 500 },
    durationRange: { min: 0, max: 240 },
    isAvailable: false,
    hasPromotion: false,
    employees: []
  };

  @Output() filtersChange = new EventEmitter<any>();
  @Output() onClearFilters = new EventEmitter<void>();

  get priceRangeValues(): number[] {
    return [this.filters.priceRange.min, this.filters.priceRange.max];
  }

  set priceRangeValues(values: number[]) {
    this.filters.priceRange = { min: values[0], max: values[1] };
  }

  get durationRangeValues(): number[] {
    return [this.filters.durationRange.min, this.filters.durationRange.max];
  }

  set durationRangeValues(values: number[]) {
    this.filters.durationRange = { min: values[0], max: values[1] };
  }

  onFiltersChange(): void {
    this.filtersChange.emit(this.filters);
  }

  onCategoryChange(category: any): void {
    const index = this.filters.categories.indexOf(category.id);
    if (category.selected && index === -1) {
      this.filters.categories.push(category.id);
    } else if (!category.selected && index > -1) {
      this.filters.categories.splice(index, 1);
    }
    this.onFiltersChange();
  }

  onPriceRangeChange(event: any): void {
    this.filters.priceRange = { min: event.values[0], max: event.values[1] };
    this.onFiltersChange();
  }

  onDurationRangeChange(event: any): void {
    this.filters.durationRange = { min: event.values[0], max: event.values[1] };
    this.onFiltersChange();
  }

  onEmployeeChange(employee: any): void {
    const index = this.filters.employees.indexOf(employee.id);
    if (employee.selected && index === -1) {
      this.filters.employees.push(employee.id);
    } else if (!employee.selected && index > -1) {
      this.filters.employees.splice(index, 1);
    }
    this.onFiltersChange();
  }

  clearFilters(): void {
    this.onClearFilters.emit();
  }
}
