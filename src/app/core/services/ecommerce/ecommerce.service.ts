import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { ApiResponse } from '../../../../@utils/interfaces/ApiResponse';
import {
  EcommerceProduct,
  EcommerceInterfaceService,
  EcommerceProductFilter,
  EcommerceServiceFilter,
  EcommerceProductResponse,
  EcommerceServiceResponse,
  ProductFilterOptions,
  ServiceFilterOptions,
  Cart,
  CartItem,
  ProductDetail,
  ServiceDetail
} from '../../../shared/models/ecommerce/ecommerce.interface';

@Injectable({
  providedIn: 'root'
})
export class EcommerceService {
  private baseUrlProducts = environment.baseUrl + '/product-service/product';
  private baseUrlServices = environment.baseUrl + '/reservation-service/service';

  // Cart state management
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();

  // Wishlist state management
  private wishlistSubject = new BehaviorSubject<number[]>(this.getInitialWishlist());
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load cart from localStorage on service initialization
    this.loadCartFromStorage();
    this.loadWishlistFromStorage();
  }

  // ============================================================================
  // PRODUCT METHODS
  // ============================================================================

  /**
   * Filter products for e-commerce
   */
  filterProducts(filter: EcommerceProductFilter): Observable<EcommerceProductResponse> {
    return this.http.post<ApiResponse<EcommerceProductResponse>>(
      `${this.baseUrlProducts}/filter`,
      this.transformProductFilter(filter)
    ).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  /**
   * Get product by ID with full details
   */
  getProductDetail(productId: number): Observable<ProductDetail> {
    return this.http.get<ApiResponse<ProductDetail>>(
      `${this.baseUrlProducts}/${productId}`
    ).pipe(
      map(response => {
        console.log('Product detail loaded:', response.data);
        return response.data})
    );
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(limit: number = 8): Observable<EcommerceProduct[]> {
    const filter: EcommerceProductFilter = {
      featured: true,
      pageSize: limit,
      pageNumber: 0
    };
    return this.filterProducts(filter).pipe(
      map(response => response.responseProductList)
    );
  }

  /**
   * Get new products
   */
  getNewProducts(limit: number = 8): Observable<EcommerceProduct[]> {
    const filter: EcommerceProductFilter = {
      newProducts: true,
      pageSize: limit,
      pageNumber: 0,
      sortBy: 'newest'
    };
    return this.filterProducts(filter).pipe(
      map(response => response.responseProductList)
    );
  }

  /**
   * Get related products
   */
  getRelatedProducts(productId: number, categoryId: number, limit: number = 4): Observable<EcommerceProduct[]> {
    const filter: EcommerceProductFilter = {
      categoryIds: [categoryId],
      pageSize: limit,
      pageNumber: 0
    };
    return this.filterProducts(filter).pipe(
      map(response => response.responseProductList.filter(p => p.productId !== productId))
    );
  }

  /**
   * Search products
   */
  searchProducts(searchTerm: string, filters?: Partial<EcommerceProductFilter>): Observable<EcommerceProductResponse> {
    const filter: EcommerceProductFilter = {
      searchTerm,
      pageSize: 12,
      pageNumber: 0,
      ...filters
    };
    return this.filterProducts(filter);
  }

  /**
   * Get product filter options
   */
  getProductFilterOptions(): Observable<ProductFilterOptions> {
    return this.http.get<ApiResponse<ProductFilterOptions>>(
      `${this.baseUrlProducts}/filter-options`
    ).pipe(
      tap(response => console.log('Product filter options loaded:', response.data)),
      map(response => response.data)
    );
  }

  // ============================================================================
  // SERVICE METHODS
  // ============================================================================

  /**
   * Filter services for e-commerce
   */
  filterServices(filter: EcommerceServiceFilter): Observable<EcommerceServiceResponse> {
    return this.http.post<ApiResponse<EcommerceServiceResponse>>(
      `${this.baseUrlServices}/filter`,
      this.transformServiceFilter(filter)
    ).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  /**
   * Get service by ID with full details
   */
  getServiceDetail(serviceId: number): Observable<ServiceDetail> {
    console.log('Service: Getting service detail for ID:', serviceId);

    return this.http.get<ApiResponse<ServiceDetail>>(
      `${this.baseUrlServices}/${serviceId}`
    ).pipe(
      tap(response => {
        console.log('Service: Raw API response:', response);
      }),
      map(response => {
        if (!response || !response.data) {
          throw new Error('Invalid API response structure');
        }

        const serviceData = response.data;
        console.log('Service: Service data extracted:', serviceData);

        // Asegurar que los campos opcionales existan con valores por defecto
        const enrichedService: ServiceDetail = {
          ...serviceData,
          reviews: serviceData.reviews || [],
          averageRating: serviceData.averageRating || 0,
          relatedServices: serviceData.relatedServices || [],
          availableEmployees: serviceData.availableEmployees || [],
          availableTimeSlots: serviceData.availableTimeSlots || [],
          // Asegurar que responseCategoryWIthoutServices tenga promotionDTOList
          responseCategoryWIthoutServices: {
            ...serviceData.responseCategoryWIthoutServices,
            promotionDTOList: serviceData.responseCategoryWIthoutServices?.promotionDTOList || [],
            serviceCategoryDTO: serviceData.responseCategoryWIthoutServices?.serviceCategoryDTO || {
              categoryId: 0,
              categoryName: 'Sin categoría'
            },
            responseSubCategoryList: serviceData.responseCategoryWIthoutServices?.responseSubCategoryList || []
          },
          // Asegurar que serviceDTO existe
          serviceDTO: {
            ...serviceData.serviceDTO,
            serviceId: serviceData.serviceDTO?.serviceId || serviceId,
            serviceName: serviceData.serviceDTO?.serviceName || 'Servicio sin nombre',
            serviceDescription: serviceData.serviceDTO?.serviceDescription || '',
            servicePrice: serviceData.serviceDTO?.servicePrice || 0,
            serviceImage: serviceData.serviceDTO?.serviceImage || '',
            durationTimeAprox: serviceData.serviceDTO?.durationTimeAprox || '01:00'
          }
        };

        console.log('Service: Enriched service data:', enrichedService);
        return enrichedService;
      }),
      catchError(error => {
        console.error('Service: Error getting service detail:', error);
        throw error;
      })
    );
  }

  /**
   * Get featured services
   */
  getFeaturedServices(limit: number = 6): Observable<EcommerceInterfaceService[]> {
    const filter: EcommerceServiceFilter = {
      featured: true,
      pageSize: limit,
      pageNumber: 0
    };
    return this.filterServices(filter).pipe(
      map(response => response.responseServiceList)
    );
  }

  /**
   * Get available services
   */
  getAvailableServices(limit: number = 8): Observable<EcommerceInterfaceService[]> {
    const filter: EcommerceServiceFilter = {
      isAvailable: true,
      pageSize: limit,
      pageNumber: 0
    };
    return this.filterServices(filter).pipe(
      map(response => response.responseServiceList)
    );
  }

  /**
   * Search services
   */
  searchServices(searchTerm: string, filters?: Partial<EcommerceServiceFilter>): Observable<EcommerceServiceResponse> {
    const filter: EcommerceServiceFilter = {
      searchTerm,
      pageSize: 12,
      pageNumber: 0,
      ...filters
    };
    return this.filterServices(filter);
  }

  /**
   * Get service filter options
   */
  getServiceFilterOptions(): Observable<ServiceFilterOptions> {
    return this.http.get<ApiResponse<ServiceFilterOptions>>(
      `${this.baseUrlServices}/filter-options`
    ).pipe(
      map(response => response.data)
    );
  }

  // ============================================================================
  // CART METHODS
  // ============================================================================

  /**
   * Add item to cart
   */
  addToCart(item: CartItem): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(
      cartItem => cartItem.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      currentCart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      currentCart.items.push(item);
    }

    this.updateCart(currentCart);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(itemId: string): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.id !== itemId);
    this.updateCart(currentCart);
  }

  /**
   * Update item quantity in cart
   */
  updateCartItemQuantity(itemId: string, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.id === itemId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        currentCart.items[itemIndex].quantity = quantity;
        this.updateCart(currentCart);
      }
    }
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    const emptyCart = this.getInitialCart();
    this.updateCart(emptyCart);
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.itemCount)
    );
  }

  // ============================================================================
  // WISHLIST METHODS
  // ============================================================================

  /**
   * Add item to wishlist
   */
  addToWishlist(productId: number): void {
    const currentWishlist = this.wishlistSubject.value;
    if (!currentWishlist.includes(productId)) {
      currentWishlist.push(productId);
      this.updateWishlist(currentWishlist);
    }
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(productId: number): void {
    const currentWishlist = this.wishlistSubject.value;
    const updatedWishlist = currentWishlist.filter(id => id !== productId);
    this.updateWishlist(updatedWishlist);
  }

  /**
   * Check if item is in wishlist
   */
  isInWishlist(productId: number): Observable<boolean> {
    return this.wishlist$.pipe(
      map(wishlist => wishlist.includes(productId))
    );
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private transformProductFilter(filter: EcommerceProductFilter): any {
    return {
      searchTerm: filter.searchTerm,
      categoryIds: filter.categoryIds,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice,
      inStock: filter.inStock,
      hasPromotion: filter.hasPromotion,
      variationNames: filter.variations?.map(v => v.variationName),
      variationValues: filter.variations?.flatMap(v => v.selectedOptions),
      sortBy: this.mapSortBy(filter.sortBy),
      sortDirection: filter.sortDirection?.toUpperCase() || 'ASC',
      pageNumber: filter.pageNumber || 0,
      pageSize: filter.pageSize || 12,
      activeOnly: true
    };
  }

  private transformServiceFilter(filter: EcommerceServiceFilter): any {
    return {
      searchTerm: filter.searchTerm,
      categoryIds: filter.categoryIds,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice,
      minDurationMinutes: filter.minDuration,
      maxDurationMinutes: filter.maxDuration,
      hasPromotion: filter.hasPromotion,
      isAvailable: filter.isAvailable,
      sortBy: this.mapServiceSortBy(filter.sortBy),
      sortDirection: filter.sortDirection?.toUpperCase() || 'ASC',
      pageNumber: filter.pageNumber || 0,
      pageSize: filter.pageSize || 12,
      activeOnly: true
    };
  }

  private mapSortBy(sortBy?: string): string {
    switch (sortBy) {
      case 'name': return 'productName';
      case 'price': return 'price';
      case 'newest': return 'createdAt';
      default: return 'productName';
    }
  }

  private mapServiceSortBy(sortBy?: string): string {
    switch (sortBy) {
      case 'name': return 'serviceName';
      case 'price': return 'servicePrice';
      case 'duration': return 'durationTimeAprox';
      default: return 'serviceName';
    }
  }

  private updateCart(cart: Cart): void {
    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total = cart.subtotal + cart.shipping + cart.tax - cart.discount;

    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  private updateWishlist(wishlist: number[]): void {
    this.wishlistSubject.next(wishlist);
    this.saveWishlistToStorage(wishlist);
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,
      itemCount: 0
    };
  }

  private getInitialWishlist(): number[] {
    return [];
  }

  private saveCartToStorage(cart: Cart): void {
    localStorage.setItem('angie_cart', JSON.stringify(cart));
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('angie_cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        this.cartSubject.next(cart);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    }
  }

  private saveWishlistToStorage(wishlist: number[]): void {
    localStorage.setItem('angie_wishlist', JSON.stringify(wishlist));
  }

  private loadWishlistFromStorage(): void {
    const savedWishlist = localStorage.getItem('angie_wishlist');
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist);
        this.wishlistSubject.next(wishlist);
      } catch (error) {
        console.error('Error loading wishlist from storage:', error);
      }
    }
  }
}
