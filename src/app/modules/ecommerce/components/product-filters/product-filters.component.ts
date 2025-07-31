import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProductFilterOptions } from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-product-filters',
  template: `
    <div class="product-filters">
      <!-- Quick Filters -->
      <div class="filter-section">
        <h4 class="filter-title">Filtros Rápidos</h4>
        <div class="quick-filters">
          <p-checkbox
            [(ngModel)]="filters.inStock"
            binary="true"
            inputId="inStock"
            (onChange)="onFiltersChangeFunction()">
          </p-checkbox>
          <label for="inStock" class="filter-label">Solo con stock</label>
        </div>
        <div class="quick-filters">
          <p-checkbox
            [(ngModel)]="filters.hasPromotion"
            binary="true"
            inputId="hasPromotion"
            (onChange)="onFiltersChangeFunction()">
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
              <span class="category-count" *ngIf="category.productCount">
                ({{ category.productCount }})
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
                (onInput)="onFiltersChangeFunction()">
              </p-inputNumber>
            </div>
            <div class="price-input-group">
              <label>Máximo</label>
              <p-inputNumber
                [(ngModel)]="filters.priceRange.max"
                mode="currency"
                currency="PEN"
                [min]="filters.priceRange.min"
                (onInput)="onFiltersChangeFunction()">
              </p-inputNumber>
            </div>
          </div>
          <p-slider
            [(ngModel)]="priceRangeValues"
            [range]="true"
            [min]="filterOptions?.priceRange?.min || 0"
            [max]="filterOptions?.priceRange?.max || 1000"
            [step]="10"
            (onChange)="onPriceRangeChange($event)">
          </p-slider>
        </div>
      </div>

      <!-- Variations -->
      <div class="filter-section" *ngIf="filterOptions?.variations?.length">
        <h4 class="filter-title">Características</h4>
        <div class="variation-filters">
          <div class="variation-group" *ngFor="let variation of filterOptions?.variations">
            <h5 class="variation-name">{{ variation.name }}</h5>
            <div class="variation-options">
              <div class="variation-option" *ngFor="let option of variation.options">
                <p-checkbox
                  [inputId]="variation.name + '-' + option"
                  binary="true"
                  (onChange)="onVariationChange(variation.name, option, $event.checked)">
                </p-checkbox>
                <label [for]="variation.name + '-' + option">{{ option }}</label>
              </div>
            </div>
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
  //styleUrls: ['./product-filters.component.scss']
})
export class ProductFiltersComponent {
  @Input() filterOptions: ProductFilterOptions | null = null;
  @Input() filters: any = {
    categories: [],
    priceRange: { min: 0, max: 1000 },
    inStock: false,
    hasPromotion: false,
    variations: []
  };

  @Output() onFiltersChange = new EventEmitter<any>();
  @Output() onClearFilters = new EventEmitter<void>();

  get priceRangeValues(): number[] {
    return [this.filters.priceRange.min, this.filters.priceRange.max];
  }

  set priceRangeValues(values: number[]) {
    this.filters.priceRange = { min: values[0], max: values[1] };
  }

  onFiltersChangeFunction(): void {
    this.onFiltersChange.emit(this.filters);
  }

  onCategoryChange(category: any): void {
    const index = this.filters.categories.indexOf(category.id);
    if (category.selected && index === -1) {
      this.filters.categories.push(category.id);
    } else if (!category.selected && index > -1) {
      this.filters.categories.splice(index, 1);
    }
    this.onFiltersChangeFunction();
  }

  onPriceRangeChange(event: any): void {
    this.filters.priceRange = { min: event.values[0], max: event.values[1] };
    this.onFiltersChangeFunction();
  }

  onVariationChange(variationName: string, option: string, checked: boolean): void {
    let variation = this.filters.variations.find((v: any) => v.name === variationName);
    if (!variation) {
      variation = { name: variationName, options: [] };
      this.filters.variations.push(variation);
    }

    const index = variation.options.indexOf(option);
    if (checked && index === -1) {
      variation.options.push(option);
    } else if (!checked && index > -1) {
      variation.options.splice(index, 1);
    }

    this.onFiltersChangeFunction();
  }

  clearFilters(): void {
    this.onClearFilters.emit();
  }
}
