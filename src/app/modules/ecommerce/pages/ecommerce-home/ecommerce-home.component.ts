// ============================================================================
// ECOMMERCE HOME COMPONENT - TypeScript
// ============================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import {
  EcommerceProduct,
  EcommerceInterfaceService as ServiceModel,
  CategoryOption,
  CartItem
} from '../../../../shared/models/ecommerce/ecommerce.interface';

interface HeroSection {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  categoryId?: number;
}

@Component({
  selector: 'app-ecommerce-home',
  templateUrl: './ecommerce-home.component.html',
  styleUrls: ['./ecommerce-home.component.scss']
})
export class EcommerceHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading states
  loading = true;
  featuredProductsLoading = true;
  featuredServicesLoading = true;
  newProductsLoading = true;

  // Hero section
  heroSection: HeroSection = {
    title: 'AngieBraids',
    subtitle: 'Explora nuestra colección premium de productos y servicios para el cuidado del cabello',
    backgroundImage: 'assets/images/hero-bg.jpg',
    ctaText: 'Explorar Productos',
    ctaLink: '/ecommerce/products'
  };

  // Collections (categorías destacadas)
  collections: Collection[] = [
    {
      id: 'hombres',
      title: 'Hombres',
      description: 'Explora nuestros distintivos estilos de trenzas para hombres.',
      image: 'assets/images/collections/men.jpg',
      link: '/ecommerce/hairstyles/men',
      categoryId: 1
    },
    {
      id: 'premium',
      title: 'Premium',
      description: 'Explora nuestros distintivos estilos de trenzas para hombres.',
      image: 'assets/images/collections/premium.jpg',
      link: '/ecommerce/hairstyles/premium',
      categoryId: 2
    },
    {
      id: 'afro-naturals',
      title: 'Afro Naturals',
      description: 'Explora nuestros distintivos estilos de trenzas para hombres.',
      image: 'assets/images/collections/afro-naturals.jpg',
      link: '/ecommerce/hairstyles/afro-naturals',
      categoryId: 3
    },
    {
      id: 'kids',
      title: 'Kids',
      description: 'Explora nuestros distintivos estilos de trenzas para hombres.',
      image: 'assets/images/collections/kids.jpg',
      link: '/ecommerce/hairstyles/kids',
      categoryId: 4
    },
    {
      id: 'coralego',
      title: 'Coralego',
      description: 'Explora nuestros distintivos estilos de trenzas para hombres.',
      image: 'assets/images/collections/coralego.jpg',
      link: '/ecommerce/hairstyles/coralego',
      categoryId: 5
    }
  ];

  // Data
  featuredProducts: EcommerceProduct[] = [];
  featuredServices: ServiceModel[] = [];
  newProducts: EcommerceProduct[] = [];
  productCategories: CategoryOption[] = [];

  // Carousel settings
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  // Product carousel settings
  productResponsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private ecommerceService: EcommerceService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all home page data
   */
  private loadHomeData(): void {
    this.loading = true;

    forkJoin({
      featuredProducts: this.ecommerceService.getFeaturedProducts(8),
      featuredServices: this.ecommerceService.getFeaturedServices(6),
      newProducts: this.ecommerceService.getNewProducts(8),
      productFilterOptions: this.ecommerceService.getProductFilterOptions()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.featuredProducts = data.featuredProducts;
        this.featuredServices = data.featuredServices;
        this.newProducts = data.newProducts;
        this.productCategories = data.productFilterOptions.categories;

        this.loading = false;
        this.featuredProductsLoading = false;
        this.featuredServicesLoading = false;
        this.newProductsLoading = false;
      },
      error: (error) => {
        console.error('Error loading home data:', error);
        this.loading = false;
        this.featuredProductsLoading = false;
        this.featuredServicesLoading = false;
        this.newProductsLoading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos. Intenta de nuevo.',
          life: 5000
        });
      }
    });
  }

  /**
   * Navigate to collection
   */
  goToCollection(collection: Collection): void {
    if (collection.categoryId) {
      this.router.navigate(['ecommerce/hairstyles'], {
        queryParams: { category: collection.categoryId }
      });
    } else {
      this.router.navigate([collection.link]);
    }
  }

  /**
   * Navigate to product detail
   */
  goToProductDetail(product: EcommerceProduct): void {
    this.router.navigate(['ecommerce/products', product.productId]);
  }

  /**
   * Navigate to service detail
   */
  goToServiceDetail(service: ServiceModel): void {
    this.router.navigate(['ecommerce/services', service.serviceDTO.serviceId]);
  }

  /**
   * Navigate to products page
   */
  goToProducts(): void {
    this.router.navigate(['ecommerce/products']);
  }

  /**
   * Navigate to services page
   */
  goToServices(): void {
    this.router.navigate(['ecommerce/services']);
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

    // Use first available item if only one variant
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
   * Add service to cart
   */
  addServiceToCart(service: ServiceModel): void {
    const cartItem: CartItem = {
      id: service.serviceDTO.serviceId,
      type: 'service',
      serviceId: service.serviceDTO.serviceId,
      name: service.serviceDTO.serviceName,
      description: service.serviceDTO.serviceDescription,
      image: service.serviceDTO.serviceImage,
      price: service.serviceDTO.servicePrice,
      quantity: 1,
      maxQuantity: 1, // Services typically have quantity of 1
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
   * Get product price display
   */
  getProductPrice(product: EcommerceProduct): number {
    if (!product.responseProductItemDetails.length) return 0;

    const prices = product.responseProductItemDetails.map(item => item.productItemPrice);
    return Math.min(...prices);
  }

  /**
   * Get product price range display
   */
  getProductPriceRange(product: EcommerceProduct): string {
    if (!product.responseProductItemDetails.length) return 'N/A';

    const prices = product.responseProductItemDetails.map(item => item.productItemPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `S/${minPrice.toFixed(2)}`;
    }

    return `S/${minPrice.toFixed(2)} - S/${maxPrice.toFixed(2)}`;
  }

  /**
   * Check if product has discount
   */
  hasDiscount(product: EcommerceProduct): boolean {
    return product.responseCategory?.promotionDTOList?.length > 0;
  }

  /**
   * Get product discount percentage
   */
  getDiscountPercentage(product: EcommerceProduct): number {
    if (!this.hasDiscount(product)) return 0;

    const promotion = product.responseCategory.promotionDTOList[0];
    return Math.round(promotion.promotionDiscountRate * 100);
  }

  /**
   * Check if service has discount
   */
  hasServiceDiscount(service: ServiceModel): boolean {
    return service.responseCategoryWIthoutServices?.promotionDTOList?.length > 0;
  }

  /**
   * Get service discount percentage
   */
  getServiceDiscountPercentage(service: ServiceModel): number {
    if (!this.hasServiceDiscount(service)) return 0;

    const promotion = service.responseCategoryWIthoutServices.promotionDTOList[0];
    return Math.round(promotion.promotionDiscountRate * 100);
  }

  /**
   * Get discounted price for product
   */
  getDiscountedPrice(product: EcommerceProduct): number {
    if (!this.hasDiscount(product)) return this.getProductPrice(product);

    const originalPrice = this.getProductPrice(product);
    const discountRate = product.responseCategory.promotionDTOList[0].promotionDiscountRate;

    return originalPrice * (1 - discountRate);
  }

  /**
   * Get discounted price for service
   */
  getServiceDiscountedPrice(service: ServiceModel): number {
    if (!this.hasServiceDiscount(service)) return service.serviceDTO.servicePrice;

    const originalPrice = service.serviceDTO.servicePrice;
    const discountRate = service.responseCategoryWIthoutServices.promotionDTOList[0].promotionDiscountRate;

    return originalPrice * (1 - discountRate);
  }

  /**
   * Format duration from string to readable format
   */
  formatDuration(duration: string): string {
    // Assuming duration is in format "HH:mm:ss" or "HH:mm"
    const timeParts = duration.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  /**
   * Navigate to shop with search
   */
  searchProducts(searchTerm: string): void {
    this.router.navigate(['/ecommerce/products'], {
      queryParams: { search: searchTerm }
    });
  }

  /**
   * Quick view product (could open modal)
   */
  quickViewProduct(product: EcommerceProduct): void {
    // For now, navigate to detail page
    // Later this could open a modal with product details
    this.goToProductDetail(product);
  }

  /**
   * Quick view service (could open modal)
   */
  quickViewService(service: ServiceModel): void {
    // For now, navigate to detail page
    // Later this could open a modal with service details
    this.goToServiceDetail(service);
  }

  /**
   * Check if product is in stock
   */
  isProductInStock(product: EcommerceProduct): boolean {
    return product.responseProductItemDetails.some(item => item.productItemQuantityInStock > 0);
  }

  /**
   * Get total stock for product
   */
  getProductStock(product: EcommerceProduct): number {
    return product.responseProductItemDetails.reduce(
      (total, item) => total + item.productItemQuantityInStock,
      0
    );
  }

  /**
   * Get product rating display (placeholder for future implementation)
   */
  getProductRating(product: EcommerceProduct): number {
    // Placeholder - in the future this would come from reviews
    return product.rating || 0;
  }

  /**
   * Get service rating display (placeholder for future implementation)
   */
  getServiceRating(service: ServiceModel): number {
    // Placeholder - in the future this would come from reviews
    return service.rating || 0;
  }

  /**
   * Handle hero CTA click
   */
  onHeroCTA(): void {
    this.router.navigate(['ecommerce/products']);
  }
}
