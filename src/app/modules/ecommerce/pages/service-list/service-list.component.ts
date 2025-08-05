import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import {
  EcommerceInterfaceService,
  EcommerceServiceFilter,
  EcommerceServiceResponse,
  ServiceFilterOptions,
  CategoryOption,
  CartItem,
  SortByServiceType,
  SortDirectionType,
  ServiceDetail
} from '../../../../shared/models/ecommerce/ecommerce.interface';

interface ViewMode {
  value: 'grid' | 'list';
  label: string;
  icon: string;
}

interface SortOptionView {
  label: string;
  value: string;
}

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading states
  loading = true;
  loadingMore = false;
  filtersLoading = true;

  // Data
  services: EcommerceInterfaceService[] = [];
  filterOptions: ServiceFilterOptions | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 12;
  totalServices = 0;
  totalPages = 0;
  hasMorePages = false;

  // Filters
  currentFilters: EcommerceServiceFilter = {
    pageNumber: 0,
    pageSize: 12,
    sortBy: 'name',
    sortDirection: 'asc'
  };

  // UI State
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;
  searchTerm = '';

  // USAR PROPIEDADES SIMPLES EN LUGAR DE GETTERS/SETTERS
  priceRangeValues: number[] = [0, 500];
  durationRangeValues: number[] = [0, 240];
  currentSortOptionValue: string = 'name_asc';

  // Options
  viewModes: ViewMode[] = [
    { value: 'grid', label: 'Cuadrícula', icon: 'pi pi-th-large' },
    { value: 'list', label: 'Lista', icon: 'pi pi-list' }
  ];

  sortOptions: SortOptionView[] = [
    { label: 'Nombre A-Z', value: 'name_asc' },
    { label: 'Nombre Z-A', value: 'name_desc' },
    { label: 'Precio: Menor a Mayor', value: 'price_asc' },
    { label: 'Precio: Mayor a Menor', value: 'price_desc' },
    { label: 'Duración: Menor a Mayor', value: 'duration_asc' },
    { label: 'Duración: Mayor a Menor', value: 'duration_desc' },
    { label: 'Mejor Valorados', value: 'rating_desc' }
  ];

  pageSizeOptions = [
    { label: '12 por página', value: 12 },
    { label: '24 por página', value: 24 },
    { label: '36 por página', value: 36 }
  ];

  // Filter panel state
  activeFilters: any = {
    categories: [],
    priceRange: { min: 0, max: 500 },
    durationRange: { min: 0, max: 240 },
    isAvailable: false,
    hasPromotion: false
  };

  // Breadcrumb
  breadcrumbItems: any[] = [];

  constructor(
    private ecommerceService: EcommerceService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    // Load view mode from localStorage
    const savedViewMode = localStorage.getItem('service-view-mode') as 'grid' | 'list';
    if (savedViewMode) {
      this.viewMode = savedViewMode;
    }
    this.loadFilterOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup route parameter subscription
   */
  private setupRouteSubscription(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.parseQueryParams(params);
        this.updateBreadcrumb();
        this.loadServices();
      });
  }

  /**
   * Parse query parameters into filters
   */
  private parseQueryParams(params: any): void {
    this.currentFilters = {
      pageNumber: parseInt(params.page) || 0,
      pageSize: parseInt(params.size) || 12,
      sortBy: params.sort || 'name',
      sortDirection: params.dir || 'asc',
      searchTerm: params.search || '',
      categoryIds: params.category ? [parseInt(params.category)] : undefined,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      minDuration: params.minDuration ? parseInt(params.minDuration) : undefined,
      maxDuration: params.maxDuration ? parseInt(params.maxDuration) : undefined,
      isAvailable: params.available === 'true',
      hasPromotion: params.promotion === 'true'
    };

    // Update UI state
    this.searchTerm = this.currentFilters.searchTerm || '';
    this.currentPage = this.currentFilters.pageNumber || 0;
    this.pageSize = this.currentFilters.pageSize || 12;

    this.updateActiveFilters();
    this.updateCurrentSortOption();
  }
  private updateCurrentSortOption(): void {
    this.currentSortOptionValue = `${this.currentFilters.sortBy}_${this.currentFilters.sortDirection}`;
  }
   /**
   * Update active filters object for UI display
   */
  private updateActiveFilters(): void {
    // Create new object to avoid circular references
    const newActiveFilters = {
      categories: [...(this.currentFilters.categoryIds || [])],
      priceRange: {
        min: this.currentFilters.minPrice || 0,
        max: this.currentFilters.maxPrice || (this.filterOptions?.priceRange?.max || 500)
      },
      durationRange: {
        min: this.currentFilters.minDuration || 0,
        max: this.currentFilters.maxDuration || (this.filterOptions?.durationRange?.maxMinutes || 240)
      },
      isAvailable: this.currentFilters.isAvailable || false,
      hasPromotion: this.currentFilters.hasPromotion || false
    };

    // Assign all at once to avoid multiple updates
    this.activeFilters = newActiveFilters;

    // Update range values safely
    this.priceRangeValues = [
      this.activeFilters.priceRange.min,
      this.activeFilters.priceRange.max
    ];

    this.durationRangeValues = [
      this.activeFilters.durationRange.min,
      this.activeFilters.durationRange.max
    ];

    // Update category selection state ONLY if filterOptions is available
    if (this.filterOptions?.categories?.length) {
      // Use setTimeout to avoid change detection issues
      setTimeout(() => {
        this.filterOptions!.categories.forEach(category => {
          category.selected = this.currentFilters.categoryIds?.includes(category.id) || false;
        });
      }, 0);
    }
  }

  /**
   * Setup search input debounce
   */
  private setupSearchDebounce(): void {
    // Implementation would use FormControl in practice
    // For now, the search is triggered on enter or button click
  }

  /**
   * Load filter options
   */
  private loadFilterOptions(): void {
    this.filtersLoading = true;
    console.log('Loading filter options...');
    this.ecommerceService.getServiceFilterOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          console.log('Filter options loaded:', options);
          this.filterOptions = options;
          if (this.filterOptions?.priceRange) {
            this.activeFilters.priceRange.max = this.filterOptions.priceRange.max;
            this.priceRangeValues = [
              this.filterOptions.priceRange.min || 0,
              this.filterOptions.priceRange.max || 500
            ];
          }

          if (this.filterOptions?.durationRange) {
            this.activeFilters.durationRange.max = this.filterOptions.durationRange.maxMinutes;
            this.durationRangeValues = [
              this.filterOptions.durationRange.minMinutes || 0,
              this.filterOptions.durationRange.maxMinutes || 240
            ];
          }

          this.filtersLoading = false;

          // NOW setup route subscription after filter options are loaded
          this.setupRouteSubscription();
        },
        error: (error) => {
          console.error('Error loading filter options:', error);
          this.filtersLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las opciones de filtro',
            life: 5000
          });
          this.setupRouteSubscription();
        }
      });
  }

  /**
   * Load services with current filters
   */
  private loadServices(append = false): void {
    if (!append) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.ecommerceService.filterServices(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: EcommerceServiceResponse) => {
          if (append) {
            this.services = [...this.services, ...response.responseServiceList];
          } else {
            this.services = response.responseServiceList;
          }

          this.totalServices = response.totalElements;
          this.totalPages = response.totalPages;
          this.hasMorePages = !response.end;
          this.currentPage = response.pageNumber;

          this.loading = false;
          this.loadingMore = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.loading = false;
          this.loadingMore = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los servicios',
            life: 5000
          });
        }
      });
  }

  /**
   * Load more services (append to current list)
   */
  loadMore(): void {
    if (this.hasMorePages && !this.loadingMore) {
      const nextPage = this.currentPage + 1;
      const loadMoreFilters = {
        ...this.currentFilters,
        pageNumber: nextPage
      };

      this.loadingMore = true;

      this.ecommerceService.filterServices(loadMoreFilters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: EcommerceServiceResponse) => {
            this.services = [...this.services, ...response.responseServiceList];
            this.hasMorePages = !response.end;
            this.currentPage = response.pageNumber;
            this.loadingMore = false;
          },
          error: (error) => {
            console.error('Error loading more services:', error);
            this.loadingMore = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron cargar más servicios',
              life: 3000
            });
          }
        });
    }
  }

  /**
   * Update breadcrumb based on current filters
   */
  private updateBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Inicio', routerLink: '/ecommerce/home' },
      { label: 'Servicios' }
    ];

    if (this.currentFilters.categoryIds?.length && this.filterOptions) {
      const categoryId = this.currentFilters.categoryIds[0];
      const category = this.filterOptions.categories.find(c => c.id === categoryId);
      if (category) {
        this.breadcrumbItems.push({ label: category.name });
      }
    }

    if (this.currentFilters.searchTerm) {
      this.breadcrumbItems.push({
        label: `Búsqueda: "${this.currentFilters.searchTerm}"`
      });
    }
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    this.updateFilters({
      searchTerm: this.searchTerm || undefined,
      pageNumber: 0
    });
  }

  /**
   * Handle sort change
   */
  onSortChange(sortOption: string): void {
    const [sortBy, sortDirection] = this.parseSortOption(sortOption);
    this.updateFilters({
      sortBy,
      sortDirection,
      pageNumber: 0
    });
  }

  /**
   * Parse sort option into sortBy and sortDirection
   */
  private parseSortOption(option: string): [SortByServiceType, SortDirectionType] {
    switch (option) {
      case 'name_asc': return ['name', 'asc'];
      case 'name_desc': return ['name', 'desc'];
      case 'price_asc': return ['price', 'asc'];
      case 'price_desc': return ['price', 'desc'];
      case 'duration_asc': return ['duration', 'asc'];
      case 'duration_desc': return ['duration', 'desc'];
      case 'rating_desc': return ['rating', 'desc'];
      default: return ['name', 'asc'];
    }
  }

  /**
   * Handle view mode change
   */
  onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('service-view-mode', mode);
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(size: number): void {
    this.updateFilters({
      pageSize: size,
      pageNumber: 0
    });
  }

  /**
   * Handle pagination - Fixed type issue
   */
  onPageChange(page: number | undefined): void {
    if (page !== undefined) {
      this.updateFilters({ pageNumber: page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Handle category change
   */
  onCategoryChange(category: CategoryOption): void {
    if (!category || typeof category.id !== 'number') {
      console.warn('Invalid category object provided to onCategoryChange');
      return;
    }

    const currentCategories = [...(this.activeFilters.categories || [])];

    if (category.selected) {
      if (!currentCategories.includes(category.id)) {
        currentCategories.push(category.id);
      }
    } else {
      const index = currentCategories.indexOf(category.id);
      if (index > -1) {
        currentCategories.splice(index, 1);
      }
    }

    this.activeFilters = {
      ...this.activeFilters,
      categories: currentCategories
    };

    this.onFiltersChange(this.activeFilters);
  }
  /**
   * Handle price range change
   */
  onPriceRangeChange(event: any): void {
    console.log('💰 Price range changed:', event);
    if (event && event.values && Array.isArray(event.values)) {
      this.priceRangeValues = [...event.values]; // Create new array
      this.activeFilters.priceRange = {
        min: event.values[0],
        max: event.values[1]
      };

      // Debounce this call to avoid too many updates
      this.debouncedFilterUpdate();
    }
  }

  /**
   * Handle duration range change
   */
  onDurationRangeChange(event: any): void {
    console.log('⏱️ Duration range changed:', event);
    if (event && event.values && Array.isArray(event.values)) {
      this.durationRangeValues = [...event.values]; // Create new array
      this.activeFilters.durationRange = {
        min: event.values[0],
        max: event.values[1]
      };

      // Debounce this call to avoid too many updates
      this.debouncedFilterUpdate();
    }
  }
    /**
   * Debounced filter update to avoid too many calls
   */
  debouncedFilterUpdate = this.debounce(() => {
    this.onFiltersChange(this.activeFilters);
  }, 500);

    /**
   * Simple debounce function
   */
  private debounce(func: Function, wait: number) {
    let timeout: any;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  /**
   * Handle filter changes from filter component
   */
  onFiltersChange(filters: any): void {
    const newFilters: Partial<EcommerceServiceFilter> = {
      categoryIds: filters.categories?.length ? filters.categories : undefined,
      minPrice: filters.priceRange?.min || undefined,
      maxPrice: filters.priceRange?.max || undefined,
      minDuration: filters.durationRange?.min || undefined,
      maxDuration: filters.durationRange?.max || undefined,
      isAvailable: filters.isAvailable || undefined,
      hasPromotion: filters.hasPromotion || undefined,
      pageNumber: 0
    };

    this.updateFilters(newFilters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilters = {
      categories: [],
      priceRange: { min: 0, max: this.filterOptions?.priceRange?.max || 500 },
      durationRange: { min: 0, max: this.filterOptions?.durationRange?.maxMinutes || 240 },
      isAvailable: false,
      hasPromotion: false
    };

    // Reset range values
    this.priceRangeValues = [0, this.filterOptions?.priceRange?.max || 500];
    this.durationRangeValues = [0, this.filterOptions?.durationRange?.maxMinutes || 240];

    // Reset category selections
    if (this.filterOptions?.categories) {
      this.filterOptions.categories.forEach(category => {
        category.selected = false;
      });
    }

    this.updateFilters({
      searchTerm: undefined,
      categoryIds: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minDuration: undefined,
      maxDuration: undefined,
      isAvailable: undefined,
      hasPromotion: undefined,
      pageNumber: 0
    });
  }

  /**
   * Update filters and navigate
   */
  private updateFilters(newFilters: Partial<EcommerceServiceFilter>): void {
    this.currentFilters = { ...this.currentFilters, ...newFilters };
    this.updateActiveFilters();

    // Convert filters to query params
    const queryParams: any = {};

    if (this.currentFilters.searchTerm) queryParams.search = this.currentFilters.searchTerm;
    if (this.currentFilters.categoryIds?.length) queryParams.category = this.currentFilters.categoryIds[0];
    if (this.currentFilters.minPrice) queryParams.minPrice = this.currentFilters.minPrice;
    if (this.currentFilters.maxPrice) queryParams.maxPrice = this.currentFilters.maxPrice;
    if (this.currentFilters.minDuration) queryParams.minDuration = this.currentFilters.minDuration;
    if (this.currentFilters.maxDuration) queryParams.maxDuration = this.currentFilters.maxDuration;
    if (this.currentFilters.isAvailable) queryParams.available = 'true';
    if (this.currentFilters.hasPromotion) queryParams.promotion = 'true';
    if (this.currentFilters.pageNumber) queryParams.page = this.currentFilters.pageNumber;
    if (this.currentFilters.pageSize !== 12) queryParams.size = this.currentFilters.pageSize;
    if (this.currentFilters.sortBy !== 'name') queryParams.sort = this.currentFilters.sortBy;
    if (this.currentFilters.sortDirection !== 'asc') queryParams.dir = this.currentFilters.sortDirection;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  /**
   * Toggle filters panel
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Navigate to service detail
   */
  goToServiceDetail(service: EcommerceInterfaceService): void {
    this.router.navigate(['/ecommerce/services', service.serviceDTO.serviceId]);
  }
  quickBookService(service: EcommerceInterfaceService): void {
    // Navigate to service detail with booking focus
    this.router.navigate(['/ecommerce/services', service.serviceDTO.serviceId], {
      fragment: 'booking'
    });
  }
  /**
   * Add service to cart
   */
  addToCart(service: EcommerceInterfaceService): void {
    const cartItem: CartItem = {
      id: `service_${service.serviceDTO.serviceId}_${Date.now()}`,
      type: 'service',
      serviceId: service.serviceDTO.serviceId,
      name: service.serviceDTO.serviceName,
      description: service.serviceDTO.serviceDescription,
      image: service.serviceDTO.serviceImage,
      price: this.getDiscountedPrice(service),
      originalPrice: this.hasDiscount(service) ? service.serviceDTO.servicePrice : undefined,
      quantity: 1,
      maxQuantity: 1,
      duration: service.serviceDTO.durationTimeAprox
    };

    this.ecommerceService.addToCart(cartItem);

    this.messageService.add({
      severity: 'success',
      summary: 'Agregado al carrito',
      detail: `${service.serviceDTO.serviceName} ha sido agregado al carrito`,
      life: 3000
    });
  }

  /**
   * Get current sort option for display
   */
  getCurrentSortOption(): SortOptionView {
    const current = `${this.currentFilters.sortBy}_${this.currentFilters.sortDirection}`;
    return this.sortOptions.find(opt =>
      opt.value.toLowerCase() === current.toLowerCase()
    ) || this.sortOptions[0];
  }

  /**
   * Check if service has discount
   */
  hasDiscount(service: EcommerceInterfaceService): boolean {
    return service.responseCategoryWIthoutServices?.promotionDTOList?.length > 0;
  }

  /**
   * Get service price
   */
  getServicePrice(service: EcommerceInterfaceService): number {
    return service.serviceDTO.servicePrice;
  }

  /**
   * Get active filters count for display
   */
  getActiveFiltersCount(): number {
    let count = 0;

    if (this.currentFilters.searchTerm) count++;
    if (this.currentFilters.categoryIds?.length) count++;
    if (this.currentFilters.minPrice || this.currentFilters.maxPrice) count++;
    if (this.currentFilters.minDuration || this.currentFilters.maxDuration) count++;
    if (this.currentFilters.isAvailable) count++;
    if (this.currentFilters.hasPromotion) count++;

    return count;
  }

  /**
   * Get category name by ID
   */
  getCategoryName(categoryId: number): string {
    if (!this.filterOptions?.categories) return '';
    const category = this.filterOptions.categories.find(c => c.id === categoryId);
    return category?.name || '';
  }

  /**
   * Get discount percentage for service
   */
  getDiscountPercentage(service: EcommerceInterfaceService): number {
    if (!this.hasDiscount(service)) return 0;

    const promotion = service.responseCategoryWIthoutServices.promotionDTOList[0];
    return Math.round(promotion.promotionDiscountRate * 100);
  }

  /**
   * Get discounted price for service
   */
  getDiscountedPrice(service: EcommerceInterfaceService): number {
    if (!this.hasDiscount(service)) return this.getServicePrice(service);

    const originalPrice = this.getServicePrice(service);
    const discountRate = service.responseCategoryWIthoutServices.promotionDTOList[0].promotionDiscountRate;

    return originalPrice * (1 - discountRate);
  }

  /**
   * Format duration
   */
  formatDuration(duration: string): string {
    const timeParts = duration.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByServiceId(index: number, service: EcommerceInterfaceService): number {
    return service.serviceDTO.serviceId;
  }
}
