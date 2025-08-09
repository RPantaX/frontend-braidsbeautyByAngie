import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import {
  EcommerceProduct,
  EcommerceProductFilter,
  EcommerceProductResponse,
  ProductFilterOptions,
  CategoryOption,
  SortOption,
  CartItem,
  SortDirectionType,
  SortByType
} from '../../../../shared/models/ecommerce/ecommerce.interface';

interface ViewMode {
  value: 'grid' | 'list';
  label: string;
  icon: string;
}

interface SortOptionView {
  label: string;
  value: SortOption;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading states
  loading = true;
  loadingMore = false;
  filtersLoading = true;

  // Data
  products: EcommerceProduct[] = [];
  filterOptions: ProductFilterOptions | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 12;
  totalProducts = 0;
  totalPages = 0;
  hasMorePages = false;

  // Filters
  currentFilters: EcommerceProductFilter = {
    pageNumber: 0,
    pageSize: 12,
    sortBy: 'name',
    sortDirection: 'asc'
  };

  // UI State
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;
  searchTerm = '';
  // Price range for slider - USAR PROPIEDADES SIMPLES
  priceRangeValues: number[] = [0, 1000];
  currentSortOptionValue: SortOption = SortOption.NAME_ASC;
  // Price range for slider
  private _priceRangeValues: number[] = [0, 1000];

  // Options
  viewModes: ViewMode[] = [
    { value: 'grid', label: 'Cuadrícula', icon: 'pi pi-th-large' },
    { value: 'list', label: 'Lista', icon: 'pi pi-list' }
  ];

  sortOptions: SortOptionView[] = [
    { label: 'Nombre A-Z', value: SortOption.NAME_ASC },
    { label: 'Nombre Z-A', value: SortOption.NAME_DESC },
    { label: 'Precio: Menor a Mayor', value: SortOption.PRICE_ASC },
    { label: 'Precio: Mayor a Menor', value: SortOption.PRICE_DESC },
    { label: 'Más Nuevos', value: SortOption.NEWEST },
    { label: 'Mejor Valorados', value: SortOption.RATING_DESC }
  ];

  pageSizeOptions = [
    { label: '12 por página', value: 12 },
    { label: '24 por página', value: 24 },
    { label: '36 por página', value: 36 },
    { label: '48 por página', value: 48 }
  ];

  // Filter panel state
  activeFilters: any = {
    categories: [],
    priceRange: { min: 0, max: 1000 },
    inStock: false,
    hasPromotion: false,
    variations: []
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
    const savedViewMode = localStorage.getItem('product-view-mode') as 'grid' | 'list';
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
        this.loadProducts();
      });
  }

  /**
   * Parse query parameters into filters
   */
  private parseQueryParams(params: any): void {
    console.log('Parsing query params:', params);
    this.currentFilters = {
      pageNumber: parseInt(params.page) || 0,
      pageSize: parseInt(params.size) || 12,
      sortBy: params.sort || 'name',
      sortDirection: params.dir || 'asc',
      searchTerm: params.search || '',
      categoryIds: params.category ? [parseInt(params.category)] : undefined,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      inStock: params.inStock === 'true',
      hasPromotion: params.promotion === 'true'
    };

    // Update UI state
    this.searchTerm = this.currentFilters.searchTerm || '';
    this.currentPage = this.currentFilters.pageNumber || 0;
    this.pageSize = this.currentFilters.pageSize || 12;

    // Update active filters for UI
    this.updateActiveFilters();
    this.updateCurrentSortOption();
  }
  private updateCurrentSortOption(): void {
    const current = `${this.currentFilters.sortBy}_${this.currentFilters.sortDirection}`;

    switch (current.toLowerCase()) {
      case 'name_asc':
        this.currentSortOptionValue = SortOption.NAME_ASC;
        break;
      case 'name_desc':
        this.currentSortOptionValue = SortOption.NAME_DESC;
        break;
      case 'price_asc':
        this.currentSortOptionValue = SortOption.PRICE_ASC;
        break;
      case 'price_desc':
        this.currentSortOptionValue = SortOption.PRICE_DESC;
        break;
      case 'newest_desc':
        this.currentSortOptionValue = SortOption.NEWEST;
        break;
      case 'rating_desc':
        this.currentSortOptionValue = SortOption.RATING_DESC;
        break;
      default:
        this.currentSortOptionValue = SortOption.NAME_ASC;
    }
  }
  /**
   * Update active filters object for UI display
   */
  private updateActiveFilters(): void {
    this.activeFilters = {
      categories: this.currentFilters.categoryIds || [],
      priceRange: {
        min: this.currentFilters.minPrice || 0,
        max: this.currentFilters.maxPrice || (this.filterOptions?.priceRange?.max || 1000)
      },
      inStock: this.currentFilters.inStock || false,
      hasPromotion: this.currentFilters.hasPromotion || false,
      variations: [] // TODO: Parse variation filters
    };

    // Update price range values
    this.priceRangeValues = [
      this.activeFilters.priceRange.min,
      this.activeFilters.priceRange.max
    ];

    // Update category selection state ONLY if filterOptions is available
    if (this.filterOptions?.categories) {
      this.filterOptions.categories.forEach(category => {
        category.selected = this.currentFilters.categoryIds?.includes(category.id) || false;
      });
    }
  }

  /**
   * Setup search input debounce
   */
  private setupSearchDebounce(): void {
    // This would be implemented with a FormControl in practice
    // For now, we'll handle it in the search method
  }

  /**
   * Load filter options
   */
  private loadFilterOptions(): void {
    this.filtersLoading = true;

    this.ecommerceService.getProductFilterOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          console.log('Filter options loaded:', options);
          this.filterOptions = options;

          if (this.filterOptions?.priceRange) {
            this.activeFilters.priceRange.max = this.filterOptions.priceRange.max;
            this.priceRangeValues = [
              this.filterOptions.priceRange.min || 0,
              this.filterOptions.priceRange.max || 1000
            ];
          }
          this.filtersLoading = false;

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
   * Load products with current filters
   */
  private loadProducts(append = false): void {
    if (!append) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    console.log('Loading products with filters:', this.currentFilters);
    this.ecommerceService.filterProducts(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: EcommerceProductResponse) => {
          if (append) {
            this.products = [...this.products, ...response.responseProductList];
          } else {
            this.products = response.responseProductList;
          }

          this.totalProducts = response.totalElements;
          this.totalPages = response.totalPages;
          this.hasMorePages = !response.end;
          this.currentPage = response.pageNumber;

          this.loading = false;
          this.loadingMore = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
          this.loadingMore = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los productos',
            life: 5000
          });
        }
      });
  }

  /**
   * Update breadcrumb based on current filters
   */
  private updateBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Inicio', routerLink: '/ecommerce/home' },
      { label: 'Productos' }
    ];
    console.log('Updating breadcrumb with current filters:', this.currentFilters);
    console.log('Filter options:', this.filterOptions);
    console.log('Breadcrumb items before update:', this.breadcrumbItems);
    // Add category to breadcrumb if selected
    if (this.currentFilters.categoryIds?.length && this.filterOptions) {
      const categoryId = this.currentFilters.categoryIds[0];
      const category = this.filterOptions.categories.find(c => c.id === categoryId);
      if (category) {
        this.breadcrumbItems.push({ label: category.name });
      }
    }

    // Add search term to breadcrumb if exists
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
  onSortChange(sortOption: SortOption): void {
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
  private parseSortOption(option: SortOption): [SortByType, SortDirectionType] {
    switch (option) {
      case SortOption.NAME_ASC: return ['name', 'asc'];
      case SortOption.NAME_DESC: return ['name', 'desc'];
      case SortOption.PRICE_ASC: return ['price', 'asc'];
      case SortOption.PRICE_DESC: return ['price', 'desc'];
      case SortOption.NEWEST: return ['newest', 'desc'];
      case SortOption.RATING_DESC: return ['rating', 'desc'];
      default: return ['name', 'asc'];
    }
  }

  /**
   * Handle view mode change
   */
  onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('product-view-mode', mode);
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
   * Handle pagination
   */
  onPageChange(event: any): void {
    const page = event.page;
    if (typeof page === 'number') {
      this.updateFilters({ pageNumber: page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Load more products (infinite scroll)
   */
  loadMore(): void {
    if (this.hasMorePages && !this.loadingMore) {
      this.loadingMore = true;
      const nextPage = this.currentPage + 1;
      const newFilters = { ...this.currentFilters, pageNumber: nextPage };

      this.ecommerceService.filterProducts(newFilters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.products = [...this.products, ...response.responseProductList];
            this.currentPage = response.pageNumber;
            this.hasMorePages = !response.end;
            this.loadingMore = false;
          },
          error: (error) => {
            console.error('Error loading more products:', error);
            this.loadingMore = false;
          }
        });
    }
  }

  /**
   * Handle filter changes from filter component
   */
  onFiltersChange(filters: any): void {
    const newFilters: Partial<EcommerceProductFilter> = {
      categoryIds: filters.categories?.length ? filters.categories : undefined,
      minPrice: filters.priceRange?.min || undefined,
      maxPrice: filters.priceRange?.max || undefined,
      inStock: filters.inStock || undefined,
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
      priceRange: { min: 0, max: this.filterOptions?.priceRange?.max || 1000 },
      inStock: false,
      hasPromotion: false,
      variations: []
    };

    // Reset price range slider
    this._priceRangeValues = [0, this.filterOptions?.priceRange?.max || 1000];

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
      inStock: undefined,
      hasPromotion: undefined,
      pageNumber: 0
    });
  }

  /**
   * Update filters and navigate
   */
  private updateFilters(newFilters: Partial<EcommerceProductFilter>): void {
    this.currentFilters = { ...this.currentFilters, ...newFilters };
    this.updateActiveFilters();

    // Update category selection state

    // Convert filters to query params
    const queryParams: any = {};

    if (this.currentFilters.searchTerm) queryParams.search = this.currentFilters.searchTerm;
    if (this.currentFilters.categoryIds?.length) queryParams.category = this.currentFilters.categoryIds[0];
    if (this.currentFilters.minPrice) queryParams.minPrice = this.currentFilters.minPrice;
    if (this.currentFilters.maxPrice) queryParams.maxPrice = this.currentFilters.maxPrice;
    if (this.currentFilters.inStock) queryParams.inStock = 'true';
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
   * Check if categories are available and have data
   */
  hasCategoriesAvailable(): boolean {
    return !!(this.filterOptions?.categories?.length && this.filterOptions.categories.length > 0);
  }

  /**
   * Get safe categories list
   */
  getSafeCategories(): CategoryOption[] {
    return this.filterOptions?.categories || [];
  }
  /**
   * Toggle filters panel
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Navigate to product detail
   */
  goToProductDetail(product: EcommerceProduct): void {
    this.router.navigate(['/ecommerce/products', product.productId]);
  }

  /**
   * Add product to cart
   */
  addToCart(product: EcommerceProduct): void {
    if (!product.responseProductItemDetails.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Producto no disponible',
        detail: 'Este producto no tiene variantes disponibles',
        life: 3000
      });
      return;
    }

    const firstItem = product.responseProductItemDetails[0];

    if (firstItem.productItemQuantityInStock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin stock',
        detail: 'Este producto no está disponible en este momento',
        life: 3000
      });
      return;
    }

    const cartItem: CartItem = {
      id: firstItem.productItemId,
      type: 'product',
      productId: product.productId,
      productItemId: firstItem.productItemId,
      name: product.productName,
      description: product.productDescription,
      image: product.productImage || firstItem.productItemImage,
      price: firstItem.productItemPrice,
      quantity: 1,
      maxQuantity: firstItem.productItemQuantityInStock,
      selectedVariations: firstItem.variations.map(v => ({
        variationName: v.variationName,
        selectedOption: v.options
      }))
    };

    this.ecommerceService.addToCart(cartItem);

    this.messageService.add({
      severity: 'success',
      summary: 'Agregado al carrito',
      detail: `${product.productName} ha sido agregado al carrito`,
      life: 3000
    });
  }

  /**
   * Toggle wishlist
   */
  toggleWishlist(product: EcommerceProduct): void {
    // This would check if product is in wishlist and toggle accordingly
    this.ecommerceService.addToWishlist(product.productId);

    this.messageService.add({
      severity: 'info',
      summary: 'Agregado a favoritos',
      detail: `${product.productName} ha sido agregado a favoritos`,
      life: 3000
    });
  }

  /**
   * Get current sort option for display
   */
  getCurrentSortOption(): SortOptionView {
    const current = `${this.currentFilters.sortBy}_${this.currentFilters.sortDirection}`;
    return this.sortOptions.find(opt =>
      opt.value.toString().toLowerCase() === current.toLowerCase()
    ) || this.sortOptions[0];
  }

  /**
   * Check if product has discount
   */
  hasDiscount(product: EcommerceProduct): boolean {
    return !!(product?.responseCategory?.promotionDTOList?.length &&
              product.responseCategory.promotionDTOList.length > 0);
  }

  /**
   * Get product price
   */
  getProductPrice(product: EcommerceProduct): number {
    if (!product?.responseProductItemDetails?.length) return 0;

    const prices = product.responseProductItemDetails
      .map(item => item.productItemPrice || 0)
      .filter(price => price > 0);

    return prices.length > 0 ? Math.min(...prices) : 0;
  }

  /**
   * Check if product is in stock
   */
  isProductInStock(product: EcommerceProduct): boolean {
    if (!product?.responseProductItemDetails?.length) return false;

    return product.responseProductItemDetails.some(
      item => (item.productItemQuantityInStock || 0) > 0
    );
  }

  /**
   * Get active filters count for display
   */
  getActiveFiltersCount(): number {
    let count = 0;

    if (this.currentFilters.searchTerm) count++;
    if (this.currentFilters.categoryIds?.length) count++;
    if (this.currentFilters.minPrice || this.currentFilters.maxPrice) count++;
    if (this.currentFilters.inStock) count++;
    if (this.currentFilters.hasPromotion) count++;

    return count;
  }

  /**
   * Get category name by ID
   */
  getCategoryName(categoryId: number): string {
    if (!this.filterOptions?.categories || !categoryId) return '';
    const category = this.filterOptions.categories.find(c => c.id === categoryId);
    return category?.name || '';
  }

  /**
   * Get discount percentage for product
   */
  getDiscountPercentage(product: EcommerceProduct): number {
    if (!this.hasDiscount(product) || !product.responseCategory?.promotionDTOList?.[0]) {
      return 0;
    }

    const promotion = product.responseCategory.promotionDTOList[0];
    return Math.round((promotion.promotionDiscountRate || 0) * 100);
  }

  /**
   * Get discounted price for product
   */
  getDiscountedPrice(product: EcommerceProduct): number {
    const originalPrice = this.getProductPrice(product);

    if (!this.hasDiscount(product) || !product.responseCategory?.promotionDTOList?.[0]) {
      return originalPrice;
    }

    const discountRate = product.responseCategory.promotionDTOList[0].promotionDiscountRate || 0;
    return originalPrice * (1 - discountRate);
  }

  /**
   * Get total stock for product
   */
  getProductStock(product: EcommerceProduct): number {
    if (!product?.responseProductItemDetails?.length) return 0;

    return product.responseProductItemDetails.reduce(
      (total, item) => total + (item.productItemQuantityInStock || 0),
      0
    );
  }

  /**
   * Get variation summary for list view
   */
  getVariationSummary(item: any): string {
    if (!item?.variations?.length) return 'Estándar';

    return item.variations
      .map((v: any) => v ? `${v.variationName || ''}: ${v.options || ''}` : '')
      .filter((text: string) => text.trim().length > 0)
      .join(', ') || 'Estándar';
  }

  /**
   * Track by function for ngFor performance
   */
  trackByProductId(index: number, product: EcommerceProduct): number {
    return product.productId;
  }

  /**
   * Handle category change in filters
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
   * Debounced filter update to avoid too many calls
   */
  private debouncedFilterUpdate = this.debounce(() => {
    this.onFiltersChange(this.activeFilters);
  }, 500);
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
   * Get current sort option for dropdown
   */
  /*get currentSortOption(): SortOption {
    const current = `${this.currentFilters.sortBy}_${this.currentFilters.sortDirection}`;

    switch (current.toLowerCase()) {
      case 'name_asc': return SortOption.NAME_ASC;
      case 'name_desc': return SortOption.NAME_DESC;
      case 'price_asc': return SortOption.PRICE_ASC;
      case 'price_desc': return SortOption.PRICE_DESC;
      case 'newest_desc': return SortOption.NEWEST;
      case 'rating_desc': return SortOption.RATING_DESC;
      default: return SortOption.NAME_ASC;
    }
  }*/

  /**
   * Set current sort option
   */
  set currentSortOption(value: SortOption) {
    this.onSortChange(value);
  }

  /**
   * Get price range values for slider
   */
  /*get priceRangeValues(): number[] {
    return [
      this.activeFilters.priceRange.min,
      this.activeFilters.priceRange.max
    ];
  }*/

  /**
   * Set price range values from slider
   */
  /*set priceRangeValues(values: number[]) {
    this._priceRangeValues = values;
    this.activeFilters.priceRange = {
      min: values[0],
      max: values[1]
    };
  }*/
  /**
   * Check if category name should be displayed
   */
  shouldShowCategoryName(): boolean {
    return !!(this.currentFilters.categoryIds?.length &&
              this.filterOptions &&
              this.currentFilters.categoryIds[0]);
  }

  /**
   * Get safe category name for display
   */
  getSafeCategoryName(): string {
    if (!this.shouldShowCategoryName()) return '';
    return this.getCategoryName(this.currentFilters.categoryIds![0]);
  }
}
