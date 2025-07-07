import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { ChipModule } from 'primeng/chip';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

import { CategoryService } from '../../../../../core/services/products/category.service';
import { ResponseCategory, CategoryResponsePageable } from '../../../../../shared/models/categories/category.interface';
import { PromotionDTO } from '../../../../../shared/models/promotions/promotion.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    InputTextModule,
    TagModule,
    DropdownModule,
    MultiSelectModule,
    ProgressBarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    SliderModule,
    ChipModule,
    RouterModule,
    TooltipModule
  ]
})
export class CategoryListComponent implements OnInit, OnDestroy {
  @Input() loading: boolean = false;
  @Input() promotions: PromotionDTO[] = [];
  @Output() deleteCategory = new EventEmitter<ResponseCategory>();
  @Output() selectedCategory = new EventEmitter<ResponseCategory>();
  @Output() refresh = new EventEmitter<void>();

  categories: ResponseCategory[] = [];

  // Pagination and sorting
  totalRecords: number = 0;
  rows: number = 10;
  currentPage: number = 0;
  sortField: string = '';
  sortOrder: number = 1; // 1 for ascending, -1 for descending

  // Filters
  filters: any = {};
  searchValue: string = '';

  // Add a field to store the subscription
  private refreshSubscription!: Subscription;

  categoryService = inject(CategoryService);

  constructor() {}

  ngOnInit() {
    this.loadCategories();

    // Subscribe to refresh events from the service
    this.refreshSubscription = this.categoryService.refresh$.subscribe(() => {
      this.loadCategories();
    });
  }

  /**
   * Load categories with pagination, sorting and filtering
   * @param event Optional lazy load event from PrimeNG Table
   */
  loadCategories(event?: TableLazyLoadEvent) {
    this.loading = true;

    // Update pagination and sorting params from table event
    if (event) {
      this.rows = event.rows || 10;
      this.currentPage = event.first ? Math.floor(event.first / this.rows) : 0;
      this.sortField = event.sortField as string || '';
      this.sortOrder = event.sortOrder || 1;

      // Process filters from the event
      if (event.filters) {
        Object.keys(event.filters).forEach(key => {
          const filterMeta = event.filters![key];
          if (Array.isArray(filterMeta)) {
            const filter = filterMeta[0];
            if (filter.value !== null && filter.value !== undefined) {
              this.filters[key] = filter.value;
            }
          }
        });
      }
    }

    // Convert sort direction
    const sortDir = this.sortOrder === 1 ? 'asc' : 'desc';

    // Map UI field names to backend field names
    let sortBy = '';
    if (this.sortField) {
      const fieldMapping: {[key: string]: string} = {
        'productCategoryId': 'productCategoryId',
        'productCategoryName': 'productCategoryName'
      };
      sortBy = fieldMapping[this.sortField] || this.sortField;
    }

    // Call service to get paginated data
    this.categoryService.getPageableCategories(
      this.currentPage,
      this.rows,
      sortBy,
      sortDir
    ).subscribe({
      next: (response: CategoryResponsePageable) => {
        this.categories = response.responseCategoryList;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Clear all filters and reload data
   * @param table Reference to PrimeNG Table
   */
  clear(table: Table) {
    table.clear();
    this.filters = {};
    this.searchValue = '';
    this.loadCategories();
    this.refresh.emit();
  }

  /**
   * Get color class for promotion chip
   * @param index Promotion index
   * @returns Color class name
   */
  getPromotionChipColor(index: number): string {
    const colors = ['info', 'success', 'warning', 'danger', 'primary'];
    return colors[index % colors.length];
  }

  /**
   * Handle global search
   * @param table Reference to PrimeNG Table
   * @param event Input event
   */
  onGlobalSearch(table: Table, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  /**
   * Get names of remaining promotions (beyond the first 3)
   * @param promotions List of promotions
   * @returns Comma-separated list of promotion names
   */
  getRemainingPromotionNames(promotions: any[]): string {
    return promotions.slice(3).map(p => p.promotionName).join(', ');
  }

  /**
   * Emit event to edit a category
   * @param category Category to edit
   */
  editCategory(category: ResponseCategory) {
    this.selectedCategory.emit(category);
  }

  /**
   * Emit event to delete a category
   * @param category Category to delete
   */
  deleteSelectedCategory(category: ResponseCategory) {
    this.deleteCategory.emit(category);
  }

  // Implement OnDestroy to clean up subscriptions
  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}
