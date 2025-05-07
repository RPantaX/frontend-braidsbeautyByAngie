import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
import { DatePipe } from '@angular/common';

import { PromotionService } from '../../../services/promotion.service';
import { PromotionDTO, PromotionResponsePageable, PromotionWithCategories } from '../../../interfaces/promotions/promotion.interface';
import { Subscription } from 'rxjs';

interface Status {
  label: string;
  value: string;
}

@Component({
  selector: 'app-promotion-list-page',
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
  ],
  providers: [DatePipe]
})
export class PromotionListComponent implements OnInit, OnDestroy {
  @Input() loading: boolean = false;
  @Output() deleteProduct = new EventEmitter<PromotionDTO>();
  @Output() selectedProduct = new EventEmitter<PromotionDTO>();
  @Output() refresh = new EventEmitter<void>();

  promotions: PromotionWithCategories[] = [];
  statuses: Status[] = [];

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
  constructor(private promotionService: PromotionService, private datePipe: DatePipe) {}

  ngOnInit() {
    this.initializeStatuses();
    this.loadPromotions();

     // Subscribe to refresh events from the service
     this.refreshSubscription = this.promotionService.refresh$.subscribe(() => {
      this.loadPromotions();
    });
  }

  /**
   * Initialize status options
   */
  initializeStatuses() {
    this.statuses = [
      { label: 'Activo', value: 'active' },
      { label: 'Inactivo', value: 'inactive' },
      { label: 'Pendiente', value: 'pending' },
      { label: 'Expirado', value: 'expired' }
    ];
  }

  /**
   * Load promotions with pagination, sorting and filtering
   * @param event Optional lazy load event from PrimeNG Table
   */
  loadPromotions(event?: TableLazyLoadEvent) {
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
        'promotionDTO.promotionId': 'promotionId',
        'promotionDTO.promotionName': 'promotionName',
        'promotionDTO.promotionDescription': 'promotionDescription',
        'promotionDTO.promotionDiscountRate': 'promotionDiscountRate',
        'promotionDTO.promotionStartDate': 'promotionStartDate',
        'promotionDTO.promotionEndDate': 'promotionEndDate'
      };
      sortBy = fieldMapping[this.sortField] || this.sortField;
    }

    // Call service to get paginated data
    this.promotionService.getPageablePromotions(
      this.currentPage,
      this.rows,
      sortBy,
      sortDir
    ).subscribe({
      next: (response: PromotionResponsePageable) => {
        this.promotions = response.responsePromotionList;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
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
    this.loadPromotions();
    this.refresh.emit();
  }

  /**
   * Get severity class for status tag
   * @param status Status value
   * @returns Severity class name
   */
  getSeverity(status: string): string | null {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warning';
      case 'expired': return 'info';
      default: return null;
    }
  }

  /**
   * Get color class for category chip
   * @param index Category index
   * @returns Color class name
   */
  getCategoryChipColor(index: number): string {
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
   * Format date for display
   * @param date Date to format
   * @returns Formatted date string
   */
  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  /**
   * Format discount percentage
   * @param discount Decimal discount value
   * @returns Formatted percentage string
   */
  formatDiscount(discount: number): string {
    return `${(discount * 100).toFixed(0)}%`;
  }

  /**
   * Get names of remaining categories (beyond the first 3)
   * @param categories List of categories
   * @returns Comma-separated list of category names
   */
  getRemainingCategoryNames(categories: any[]): string {
    return categories.slice(3).map(c => c.productCategoryName).join(', ');
  }

  /**
   * Emit event to edit a promotion
   * @param promotion Promotion to edit
   */
  editPromotion(promotion: PromotionDTO) {
    this.selectedProduct.emit(promotion);
  }

  /**
   * Emit event to delete a promotion
   * @param promotion Promotion to delete
   */
  deletePromotion(promotion: PromotionDTO) {
    this.deleteProduct.emit(promotion);
  }

    // Implement OnDestroy to clean up subscriptions
  ngOnDestroy() {
      if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
      }
  }
}
