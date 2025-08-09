import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import {
  EcommerceProduct,
  ProductDetail,
  CartItem,
  ProductItemDetail,
  ProductVariation,
  SelectedVariation,
  Review
} from '../../../../shared/models/ecommerce/ecommerce.interface';
declare var gtag: Function;
interface VariationGroup {
  name: string;
  options: VariationOption[];
  selectedOption?: string;
}

interface VariationOption {
  value: string;
  available: boolean;
  items: ProductItemDetail[];
}

interface ProductImage {
  src: string;
  alt: string;
  thumbnail: string;
}

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
 private destroy$ = new Subject<void>();

  // Loading states
  loading = true;
  addingToCart = false;
  loadingRelated = true;

  // Data
  product: ProductDetail | null = null;
  relatedProducts: EcommerceProduct[] = [];
  selectedItem: ProductItemDetail | null = null;

  // Variations
  variationGroups: VariationGroup[] = [];
  selectedVariations: { [key: string]: string } = {};

  // Images
  productImages: ProductImage[] = [];
  selectedImageIndex = 0;

  // Quantity
  selectedQuantity = 1;
  maxQuantity = 0;

  // UI State
  activeTab = 0;
  showImageGallery = false;
  isInWishlist = false;

  // Breadcrumb
  breadcrumbItems: any[] = [];

  // Reviews
  reviews: Review[] = [];
  averageRating = 0;
  totalReviews = 0;

  // Tabs
  tabs = [
    { label: 'Descripción', icon: 'pi pi-align-left' },
    { label: 'Especificaciones', icon: 'pi pi-list' },
    { label: 'Reseñas', icon: 'pi pi-star' },
    { label: 'Información Adicional', icon: 'pi pi-info-circle' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ecommerceService: EcommerceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = Number(params['id']);
        if (productId) {
          this.loadProductDetail(productId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load product detail and related data
   */
  private loadProductDetail(productId: number): void {
    console.log('Loading product detail for ID:', productId);
    this.loading = true;

    // Cargar producto primero
    this.ecommerceService.getProductDetail(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          console.log('Product detail loaded successfully:', product);
          this.product = product;

          // Cargar estado de wishlist por separado
          this.loadWishlistStatus(productId);

          // Configurar datos del producto
          this.setupProductData();
          this.loadRelatedProducts();
          this.updateBreadcrumb();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product detail:', error);
          this.loading = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el producto',
            life: 5000
          });

          // Redirect back to products list
          this.router.navigate(['/ecommerce/products']);
        }
      });
    }
    private loadWishlistStatus(productId: number): void {
    this.ecommerceService.isInWishlist(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isInWishlist) => {
          this.isInWishlist = isInWishlist;
        },
        error: (error) => {
          console.error('Error loading wishlist status:', error);
          this.isInWishlist = false; // Default value
        }
      });
  }

  /**
   * Setup product data after loading
   */
  private setupProductData(): void {
    console.log('Setting up product data:', this.product);
    if (!this.product) return;

    // Setup images
    this.setupProductImages();

    // Setup variations
    this.setupVariations();

    // Setup reviews (con valores por defecto seguros)
    this.setupReviews();

    // Select default item
    this.selectDefaultItem();

    // Track product view
    this.trackProductView();
  }

  /**
   * Setup product images
   */
  private setupProductImages(): void {
    if (!this.product) return;

    this.productImages = [];

    // Add main product image
    if (this.product.productImage) {
      this.productImages.push({
        src: this.product.productImage,
        alt: this.product.productName,
        thumbnail: this.product.productImage
      });
    }

    // Add item images
    this.product.responseProductItemDetails.forEach(item => {
      if (item.productItemImage && !this.productImages.find(img => img.src === item.productItemImage)) {
        this.productImages.push({
          src: item.productItemImage,
          alt: `${this.product!.productName} - ${this.getItemVariationText(item)}`,
          thumbnail: item.productItemImage
        });
      }
    });

    // Add placeholder if no images
    if (this.productImages.length === 0) {
      this.productImages.push({
        src: 'assets/images/product-placeholder.jpg',
        alt: this.product.productName,
        thumbnail: 'assets/images/product-placeholder.jpg'
      });
    }
  }

  /**
   * Setup variation groups
   */
  private setupVariations(): void {
    if (!this.product?.responseProductItemDetails.length) return;

    const variationMap = new Map<string, Set<string>>();

    // Collect all variations and their options
    this.product.responseProductItemDetails.forEach(item => {
      item.variations.forEach(variation => {
        if (!variationMap.has(variation.variationName)) {
          variationMap.set(variation.variationName, new Set());
        }
        variationMap.get(variation.variationName)!.add(variation.options);
      });
    });

    // Create variation groups
    this.variationGroups = Array.from(variationMap.entries()).map(([name, optionsSet]) => {
      const options = Array.from(optionsSet).map(value => ({
        value,
        available: this.isVariationOptionAvailable(name, value),
        items: this.getItemsForVariation(name, value)
      }));

      return {
        name,
        options,
        selectedOption: undefined
      };
    });
  }

  /**
   * Setup reviews data
   */
  private setupReviews(): void {
    if (!this.product) return;

    // Inicializar con valores por defecto seguros
    this.reviews = this.product.reviews || [];
    this.averageRating = this.product.averageRating || 0;
    this.totalReviews = this.reviews.length;

    console.log('Reviews setup:', {
      reviews: this.reviews,
      averageRating: this.averageRating,
      totalReviews: this.totalReviews
    });
  }

  /**
   * Select default item (first available)
   */
  private selectDefaultItem(): void {
    if (!this.product?.responseProductItemDetails.length) return;

    const availableItem = this.product.responseProductItemDetails.find(
      item => item.productItemQuantityInStock > 0
    );

    if (availableItem) {
      this.selectItem(availableItem);
    } else {
      // No items in stock, select first one
      this.selectItem(this.product.responseProductItemDetails[0]);
    }
  }

  /**
   * Select a specific product item
   */
  selectItem(item: ProductItemDetail): void {
    this.selectedItem = item;
    this.maxQuantity = item.productItemQuantityInStock;
    this.selectedQuantity = Math.min(1, this.maxQuantity);

    // Update selected variations
    this.selectedVariations = {};
    item.variations.forEach(variation => {
      this.selectedVariations[variation.variationName] = variation.options;
    });

    // Update variation groups
    this.variationGroups.forEach(group => {
      group.selectedOption = this.selectedVariations[group.name];
    });

    // Update available options
    this.updateVariationAvailability();
  }

  /**
   * Handle variation selection
   */
  onVariationChange(variationName: string, value: string): void {
    this.selectedVariations[variationName] = value;

    // Update variation group
    const group = this.variationGroups.find(g => g.name === variationName);
    if (group) {
      group.selectedOption = value;
    }

    // Find matching item
    const matchingItem = this.findMatchingItem();
    if (matchingItem) {
      this.selectItem(matchingItem);
    }

    this.updateVariationAvailability();
  }

  /**
   * Find item that matches current variation selection
   */
  private findMatchingItem(): ProductItemDetail | null {
    if (!this.product) return null;

    return this.product.responseProductItemDetails.find(item => {
      return item.variations.every(variation =>
        this.selectedVariations[variation.variationName] === variation.options
      );
    }) || null;
  }

  /**
   * Update variation availability based on current selection
   */
  private updateVariationAvailability(): void {
    this.variationGroups.forEach(group => {
      group.options.forEach(option => {
        // Create temporary selection with this option
        const tempSelection = { ...this.selectedVariations };
        tempSelection[group.name] = option.value;

        // Check if there's an available item with this combination
        const hasAvailableItem = this.product!.responseProductItemDetails.some(item => {
          const matches = item.variations.every(variation =>
            tempSelection[variation.variationName] === variation.options
          );
          return matches && item.productItemQuantityInStock > 0;
        });

        option.available = hasAvailableItem;
      });
    });
  }

  /**
   * Check if variation option is available
   */
  private isVariationOptionAvailable(variationName: string, value: string): boolean {
    return this.product!.responseProductItemDetails.some(item => {
      const hasVariation = item.variations.some(v =>
        v.variationName === variationName && v.options === value
      );
      return hasVariation && item.productItemQuantityInStock > 0;
    });
  }

  /**
   * Get items for specific variation
   */
  private getItemsForVariation(variationName: string, value: string): ProductItemDetail[] {
    if (!this.product) return [];

    return this.product.responseProductItemDetails.filter(item =>
      item.variations.some(v =>
        v.variationName === variationName && v.options === value
      )
    );
  }


  /**
   * Load related products
   */
  private loadRelatedProducts(): void {
    if (!this.product) return;

    this.loadingRelated = true;

    this.ecommerceService.getRelatedProducts(
      this.product.productId,
      this.product.responseCategory.productCategoryId,
      4
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (products) => {
        this.relatedProducts = products;
        this.loadingRelated = false;
      },
      error: (error) => {
        console.error('Error loading related products:', error);
        this.loadingRelated = false;
      }
    });
  }

  /**
   * Update breadcrumb
   */
  private updateBreadcrumb(): void {
    if (!this.product) return;

    this.breadcrumbItems = [
      { label: 'Inicio', routerLink: '/ecommerce/home' },
      { label: 'Productos', routerLink: '/ecommerce/products' },
      {
        label: this.product.responseCategory.productCategoryName,
        routerLink: '/ecommerce/products',
        queryParams: { category: this.product.responseCategory.productCategoryId }
      },
      { label: this.product.productName }
    ];
  }

  /**
   * Handle quantity change
   */
  onQuantityChange(quantity: number): void {
    this.selectedQuantity = Math.max(1, Math.min(quantity, this.maxQuantity));
  }

  /**
   * Add to cart
   */
  addToCart(): void {
    if (!this.selectedItem || !this.product) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selección requerida',
        detail: 'Por favor selecciona una variante del producto',
        life: 3000
      });
      return;
    }

    if (this.selectedItem.productItemQuantityInStock < this.selectedQuantity) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Stock insuficiente',
        detail: `Solo hay ${this.selectedItem.productItemQuantityInStock} unidades disponibles`,
        life: 3000
      });
      return;
    }

    this.addingToCart = true;

    const cartItem: CartItem = {
      id: this.selectedItem.productItemId,
      type: 'product',
      productId: this.product.productId,
      productItemId: this.selectedItem.productItemId,
      name: this.product.productName,
      description: this.product.productDescription,
      image: this.selectedItem.productItemImage || this.product.productImage,
      price: this.getDiscountedPrice(),
      originalPrice: this.selectedItem.productItemPrice,
      quantity: this.selectedQuantity,
      maxQuantity: this.selectedItem.productItemQuantityInStock,
      selectedVariations: this.selectedItem.variations.map(v => ({
        variationName: v.variationName,
        selectedOption: v.options
      }))
    };

    this.ecommerceService.addToCart(cartItem);

    this.addingToCart = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Agregado al carrito',
      detail: `${this.selectedQuantity} ${this.product.productName} agregado al carrito`,
      life: 3000
    });

    // Show confirmation dialog for checkout
    this.confirmationService.confirm({
      message: '¿Quieres ir al carrito para finalizar tu compra?',
      header: 'Producto agregado',
      icon: 'pi pi-shopping-cart',
      acceptLabel: 'Ir al Carrito',
      rejectLabel: 'Seguir Comprando',
      accept: () => {
        this.router.navigate(['/ecommerce/cart']);
      }
    });
  }

  /**
   * Buy now (add to cart and go to checkout)
   */
  buyNow(): void {
    this.addToCart();
    setTimeout(() => {
      this.router.navigate(['/ecommerce/cart']);
    }, 500);
  }

  /**
   * Toggle wishlist
   */
  toggleWishlist(): void {
    if (!this.product) return;

    if (this.isInWishlist) {
      this.ecommerceService.removeFromWishlist(this.product.productId);
      this.isInWishlist = false;
      this.messageService.add({
        severity: 'info',
        summary: 'Removido de favoritos',
        detail: 'Producto removido de tu lista de favoritos',
        life: 3000
      });
    } else {
      this.ecommerceService.addToWishlist(this.product.productId);
      this.isInWishlist = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Agregado a favoritos',
        detail: 'Producto agregado a tu lista de favoritos',
        life: 3000
      });
    }
  }

  /**
   * Navigate to related product
   */
  goToRelatedProduct(product: EcommerceProduct): void {
    this.router.navigate(['/ecommerce/products', product.productId]);
  }

  /**
   * Change main image
   */
  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  /**
   * Open image gallery
   */
  openImageGallery(): void {
    this.showImageGallery = true;
  }

  /**
   * Close image gallery
   */
  closeImageGallery(): void {
    this.showImageGallery = false;
  }

  /**
   * Check if product has discount
   */
  hasDiscount(): boolean {
    if (!this.product || !this.product.responseCategory) {
      return false;
    }
    return !!(this.product.responseCategory.promotionDTOList &&
              this.product.responseCategory.promotionDTOList.length > 0);
  }

  /**
   * Get discount percentage
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount() || !this.product) return 0;

    const promotions = this.product.responseCategory.promotionDTOList;
    if (!promotions || promotions.length === 0) return 0;

    const promotion = promotions[0];
    return Math.round(promotion.promotionDiscountRate);
  }

  /**
   * Get original price
   */
  getOriginalPrice(): number {
    return this.selectedItem?.productItemPrice || 0;
  }

  /**
   * Get discounted price
   */
  getDiscountedPrice(): number {
    const originalPrice = this.getOriginalPrice();

    if (!this.hasDiscount() || !this.product) return originalPrice;

    const promotions = this.product.responseCategory.promotionDTOList;
    if (!promotions || promotions.length === 0) return originalPrice;

    const discountRate = promotions[0].promotionDiscountRate / 100; // Convertir porcentaje
    return originalPrice * (1 - discountRate);
  }

  /**
   * Get savings amount
   */
  getSavings(): number {
    return this.getOriginalPrice() - this.getDiscountedPrice();
  }

  /**
   * Check if product is in stock
   */
  isInStock(): boolean {
    return this.selectedItem!.productItemQuantityInStock > 0;
  }

  /**
   * Get stock status text
   */
  getStockStatus(): string {
    if (!this.selectedItem) return 'Sin seleccionar';

    const stock = this.selectedItem.productItemQuantityInStock;

    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return `Últimas ${stock} unidades`;
    if (stock <= 10) return `Solo ${stock} disponibles`;

    return 'En stock';
  }

  /**
   * Get stock status severity
   */
  getStockSeverity(): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    if (!this.selectedItem) return 'secondary';

    const stock = this.selectedItem.productItemQuantityInStock;

    if (stock === 0) return 'danger';
    if (stock <= 5) return 'warning';

    return 'success';
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return `S/${price.toFixed(2)}`;
  }

  /**
   * Check if variation option is selected
   */
  isVariationSelected(variationName: string, value: string): boolean {
    return this.selectedVariations[variationName] === value;
  }

  /**
   * Get variation display class
   */
  getVariationClass(option: VariationOption): string {
    let classes = 'variation-option';

    if (!option.available) classes += ' disabled';
    if (this.isVariationSelected('', option.value)) classes += ' selected';

    return classes;
  }

  /**
   * Get minimum price for related product
   */
  getMinPrice(product: EcommerceProduct): number {
    if (!product.responseProductItemDetails.length) return 0;

    const prices = product.responseProductItemDetails.map(item => item.productItemPrice);
    return Math.min(...prices);
  }

  /**
   * Get item variation text (helper method)
   */
  getItemVariationText(item: ProductItemDetail): string {
    if (!item.variations || !item.variations.length) return 'Estándar';

    return item.variations
      .map(v => `${v.variationName}: ${v.options}`)
      .join(', ');
  }

  /**
   * Share product
   */
  shareProduct(): void {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.productName,
        text: this.product.productDescription,
        url: window.location.href
      }).catch(err => {
        console.log('Error sharing:', err);
        this.fallbackShare();
      });
    } else {
      this.fallbackShare();
    }
  }

  /**
   * Fallback share method
   */
  private fallbackShare(): void {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'URL copiada',
        detail: 'El enlace del producto ha sido copiado al portapapeles',
        life: 3000
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Compartir producto',
        detail: 'Copia este enlace para compartir: ' + window.location.href,
        life: 5000
      });
    });
  }

  /**
   * Get availability text
   */
  getAvailabilityText(): string {
    if (!this.selectedItem) return 'No disponible';

    const stock = this.selectedItem.productItemQuantityInStock;

    if (stock === 0) return 'Agotado';
    if (stock === 1) return 'Última unidad disponible';
    if (stock <= 5) return `Solo ${stock} unidades disponibles`;

    return 'En stock';
  }

  /**
   * Check if product can be purchased
   */
  canPurchase(): boolean {
    return this.selectedItem !== null &&
           this.selectedItem.productItemQuantityInStock > 0 &&
           this.selectedQuantity > 0 &&
           this.selectedQuantity <= this.selectedItem.productItemQuantityInStock;
  }

  /**
   * Get estimated delivery date
   */
  getEstimatedDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

    return deliveryDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Handle image error
   */
  onImageError(event: any): void {
    event.target.src = 'assets/images/product-placeholder.jpg';
  }

  /**
   * Get product JSON-LD structured data
   */
  getStructuredData(): any {
    if (!this.product || !this.selectedItem) return null;

    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': this.product.productName,
      'description': this.product.productDescription,
      'image': this.productImages.map(img => img.src),
      'brand': {
        '@type': 'Brand',
        'name': 'AngieBraids'
      },
      'category': this.product.responseCategory.productCategoryName,
      'sku': this.selectedItem.productItemSKU,
      'offers': {
        '@type': 'Offer',
        'price': this.getDiscountedPrice(),
        'priceCurrency': 'PEN',
        'availability': this.isInStock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'AngieBraids'
        }
      },
      'aggregateRating': this.averageRating > 0 ? {
        '@type': 'AggregateRating',
        'ratingValue': this.averageRating,
        'reviewCount': this.totalReviews
      } : undefined
    };
  }

// 2. Método para obtener las opciones de variación como string
// Agregar este método en la clase del componente:

/**
 * Get variation options as comma-separated string
 */
getVariationOptionsText(options: VariationOption[]): string {
  if (!options || options.length === 0) return '';
  return options.map(o => o.value).join(', ');
}

// 3. Método para verificar si hay promociones
// Agregar este método para verificar promociones de manera segura:

/**
 * Check if related product has promotions
 */
hasPromotions(relatedProduct: EcommerceProduct): boolean {
  return !!(relatedProduct?.responseCategory?.promotionDTOList?.length);
}

// 4. Método mejorado para manejar gtag de manera segura
// Reemplazar el método trackProductView existente:

/**
 * Track analytics event
 */
  private trackProductView(): void {
  if (!this.product) return;

  // GTM/GA4 tracking - verificar si gtag está disponible
  if (typeof window !== 'undefined' && 'gtag' in window) {
    try {
      gtag('event', 'view_item', {
        'currency': 'PEN',
        'value': this.getDiscountedPrice(),
        'items': [{
          'item_id': this.product.productId.toString(),
          'item_name': this.product.productName,
          'category': this.product.responseCategory.productCategoryName,
          'price': this.getDiscountedPrice(),
          'quantity': 1
        }]
      });
    } catch (error) {
      console.warn('GTM tracking failed:', error);
    }
  }

  // Custom analytics
  console.log('Product viewed:', {
    productId: this.product.productId,
    productName: this.product.productName,
    category: this.product.responseCategory.productCategoryName,
    price: this.getDiscountedPrice()
  });
}

  /**
   * Check if product has multiple images
   */
  hasMultipleImages(): boolean {
    return this.productImages.length > 1;
  }

  /**
   * Get next image index
   */
  getNextImageIndex(): number {
    return (this.selectedImageIndex + 1) % this.productImages.length;
  }

  /**
   * Get previous image index
   */
  getPreviousImageIndex(): number {
    return this.selectedImageIndex === 0
      ? this.productImages.length - 1
      : this.selectedImageIndex - 1;
  }

  /**
   * Navigate to next image
   */
  nextImage(): void {
    if (this.hasMultipleImages()) {
      this.selectImage(this.getNextImageIndex());
    }
  }

  /**
   * Navigate to previous image
   */
  previousImage(): void {
    if (this.hasMultipleImages()) {
      this.selectImage(this.getPreviousImageIndex());
    }
  }

  /**
   * Handle keyboard navigation for images
   */
  onImageKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
      case 'Escape':
        event.preventDefault();
        this.closeImageGallery();
        break;
    }
  }
}
