import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import {
  Cart,
  CartItem,
  EcommerceProduct,
  EcommerceInterfaceService as ServiceModel
} from '../../../../shared/models/ecommerce/ecommerce.interface';

interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
}

interface PromoCode {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount?: number;
  validUntil?: Date;
}
declare var gtag: Function;
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

  // Cart data
  cart: Cart | null = null;
  cartItems: CartItem[] = [];

  // Loading states
  loading = true;
  updatingQuantity = false;
  removingItem = false;
  applyingPromoCode = false;

  // UI state
  showSummarySticky = false;
  showPromoCodeInput = false;
  promoCodeInput = '';

  // Shipping
  shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Envío Estándar',
      description: '3-5 días hábiles',
      price: 15,
      estimatedDays: '3-5 días',
      icon: 'pi pi-truck'
    },
    {
      id: 'express',
      name: 'Envío Express',
      description: '1-2 días hábiles',
      price: 25,
      estimatedDays: '1-2 días',
      icon: 'pi pi-send'
    },
    {
      id: 'pickup',
      name: 'Recojo en Tienda',
      description: 'Disponible hoy',
      price: 0,
      estimatedDays: 'Hoy',
      icon: 'pi pi-home'
    }
  ];

  selectedShippingOption: ShippingOption = this.shippingOptions[0];

  // Promo codes
  availablePromoCodes: PromoCode[] = [
    {
      code: 'WELCOME10',
      description: '10% de descuento en tu primera compra',
      discountType: 'percentage',
      discountValue: 0.1,
      minimumAmount: 50
    },
    {
      code: 'FREESHIP',
      description: 'Envío gratis en compras mayores a S/100',
      discountType: 'fixed',
      discountValue: 15,
      minimumAmount: 100
    },
    {
      code: 'SAVE20',
      description: 'S/20 de descuento en compras mayores a S/150',
      discountType: 'fixed',
      discountValue: 20,
      minimumAmount: 150
    }
  ];

  appliedPromoCode: PromoCode | null = null;

  // Breadcrumb
  breadcrumbItems = [
    { label: 'Inicio', routerLink: '/ecommerce/home' },
    { label: 'Carrito de Compras' }
  ];

  // Cart steps for checkout flow
  cartSteps = [
    { label: 'Carrito', completed: true, active: true },
    { label: 'Información', completed: false, active: false },
    { label: 'Pago', completed: false, active: false },
    { label: 'Confirmación', completed: false, active: false }
  ];

  constructor(
    private ecommerceService: EcommerceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load cart data
   */
  private loadCart(): void {
    this.loading = true;

    this.ecommerceService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.cartItems = cart.items;
          this.calculateTotals();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el carrito',
            life: 5000
          });
        }
      });
  }

  /**
   * Setup scroll listener for sticky summary
   */
  private setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      this.showSummarySticky = scrollPosition > windowHeight * 0.3;
    });
  }

  /**
   * Update item quantity
   */
  // Solución adicional: Actualizar el método updateQuantity para manejar null
  updateQuantity(item: CartItem, newQuantity: number | string | null ): void {
    // Manejar el caso donde newQuantity puede ser null
    const quantity = newQuantity ? Number(newQuantity) : item.quantity;

    if (quantity < 1) {
      this.removeItem(item);
      return;
    }

    if (quantity > (item.maxQuantity || 999)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Stock limitado',
        detail: `Solo hay ${item.maxQuantity} unidades disponibles`,
        life: 3000
      });
      return;
    }

    this.updatingQuantity = true;

    this.ecommerceService.updateCartItemQuantity(item.id, quantity);

    // Simulate API delay
    /*setTimeout(() => {
      this.updatingQuantity = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Cantidad actualizada',
        detail: `Cantidad de ${item.name} actualizada`,
        life: 2000
      });
    }, 500);*/
  }

  /**
   * Remove item from cart
   */
  removeItem(item: CartItem): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar "${item.name}" del carrito?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.removingItem = true;

        this.ecommerceService.removeFromCart(item.id);

        setTimeout(() => {
          this.removingItem = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Producto eliminado',
            detail: `${item.name} ha sido eliminado del carrito`,
            life: 3000
          });
        }, 300);
      }
    });
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres vaciar todo el carrito?',
      header: 'Vaciar carrito',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, vaciar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ecommerceService.clearCart();

        this.messageService.add({
          severity: 'success',
          summary: 'Carrito vaciado',
          detail: 'Todos los productos han sido eliminados del carrito',
          life: 3000
        });
      }
    });
  }

  /**
   * Apply promo code
   */
  applyPromoCode(): void {
    if (!this.promoCodeInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Código requerido',
        detail: 'Ingresa un código promocional válido',
        life: 3000
      });
      return;
    }

    this.applyingPromoCode = true;

    // Find matching promo code
    const promoCode = this.availablePromoCodes.find(
      code => code.code.toLowerCase() === this.promoCodeInput.toLowerCase().trim()
    );

    setTimeout(() => {
      this.applyingPromoCode = false;

      if (promoCode) {
        // Check minimum amount
        if (promoCode.minimumAmount && this.getSubtotal() < promoCode.minimumAmount) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Monto mínimo no alcanzado',
            detail: `Este código requiere un monto mínimo de S/${promoCode.minimumAmount}`,
            life: 5000
          });
          return;
        }

        this.appliedPromoCode = promoCode;
        this.calculateTotals();
        this.promoCodeInput = '';
        this.showPromoCodeInput = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Código aplicado',
          detail: `¡Código "${promoCode.code}" aplicado exitosamente!`,
          life: 3000
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Código inválido',
          detail: 'El código promocional ingresado no es válido',
          life: 3000
        });
      }
    }, 1000);
  }

  /**
   * Remove applied promo code
   */
  removePromoCode(): void {
    this.appliedPromoCode = null;
    this.calculateTotals();

    this.messageService.add({
      severity: 'info',
      summary: 'Código removido',
      detail: 'El código promocional ha sido removido',
      life: 2000
    });
  }

  /**
   * Update shipping option
   */
  updateShippingOption(option: ShippingOption): void {
    this.selectedShippingOption = option;
    this.calculateTotals();

    this.messageService.add({
      severity: 'success',
      summary: 'Envío actualizado',
      detail: `Método de envío cambiado a: ${option.name}`,
      life: 2000
    });
  }

  /**
   * Calculate cart totals
   */
  private calculateTotals(): void {
    if (!this.cart) return;

    const subtotal = this.getSubtotal();
    let shipping = this.selectedShippingOption.price;
    const tax = this.calculateTax(subtotal);
    let discount = 0;

    // Apply promo code discount
    if (this.appliedPromoCode) {
      if (this.appliedPromoCode.discountType === 'percentage') {
        discount = subtotal * this.appliedPromoCode.discountValue;
      } else {
        discount = this.appliedPromoCode.discountValue;
      }

      // Special case: free shipping codes
      if (this.appliedPromoCode.code === 'FREESHIP') {
        shipping = 0;
        discount = this.selectedShippingOption.price;
      }
    }

    // Free shipping for orders over 100
    if (subtotal >= 100 && this.selectedShippingOption.id !== 'pickup') {
      shipping = 0;
    }

    const total = subtotal + shipping + tax - discount;

    // Update cart object
    this.cart.subtotal = subtotal;
    this.cart.shipping = shipping;
    this.cart.tax = tax;
    this.cart.discount = discount;
    this.cart.total = Math.max(0, total);
  }

  /**
   * Get subtotal
   */
  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Calculate tax (18% IGV in Peru)
   */
  private calculateTax(subtotal: number): number {
    return subtotal * 0.18;
  }

  /**
   * Get cart summary
   */
  getCartSummary(): CartSummary {
    return {
      subtotal: this.cart?.subtotal || 0,
      shipping: this.cart?.shipping || 0,
      tax: this.cart?.tax || 0,
      discount: this.cart?.discount || 0,
      total: this.cart?.total || 0,
      itemCount: this.cart?.itemCount || 0
    };
  }

  /**
   * Navigate to product detail
   */
  goToProduct(item: CartItem): void {
    if (item.type === 'product' && item.productId) {
      this.router.navigate(['/ecommerce/products', item.productId]);
    } else if (item.type === 'service' && item.serviceId) {
      this.router.navigate(['/ecommerce/services', item.serviceId]);
    }
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/ecommerce/products']);
  }

  /**
   * Proceed to checkout
   */
  proceedToCheckout(): void {
    if (!this.cartItems.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrito vacío',
        detail: 'Agrega productos al carrito antes de continuar',
        life: 3000
      });
      return;
    }

    this.router.navigate(['/ecommerce/checkout']);
  }

  /**
   * Get item image
   */
  getItemImage(item: CartItem): string {
    return item.image || 'assets/no-image.png';
  }

  /**
   * Get item description with variations
   */
  getItemDescription(item: CartItem): string {
    let description = item.description || '';

    if (item.selectedVariations && item.selectedVariations.length > 0) {
      const variations = item.selectedVariations
        .map(v => `${v.variationName}: ${v.selectedOption}`)
        .join(', ');
      description += variations ? ` (${variations})` : '';
    }

    if (item.type === 'service' && item.duration) {
      description += ` - Duración: ${this.formatDuration(item.duration)}`;
    }

    return description;
  }

  /**
   * Format duration
   */
  private formatDurationPrivate(duration: string): string {
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
   * Format price
   */
  formatPrice(price: number): string {
    return `S/${price.toFixed(2)}`;
  }

  /**
   * Get discount savings text
   */
  getDiscountSavingsText(): string {
    if (!this.appliedPromoCode || !this.cart?.discount) return '';

    return `Ahorras ${this.formatPrice(this.cart.discount)} con el código "${this.appliedPromoCode.code}"`;
  }

  /**
   * Check if cart has products
   */
  hasProducts(): boolean {
    return this.cartItems.some(item => item.type === 'product');
  }

  /**
   * Check if cart has services
   */
  hasServices(): boolean {
    return this.cartItems.some(item => item.type === 'service');
  }

  /**
   * Get products from cart
   */
  getProducts(): CartItem[] {
    return this.cartItems.filter(item => item.type === 'product');
  }

  /**
   * Get services from cart
   */
  getServices(): CartItem[] {
    return this.cartItems.filter(item => item.type === 'service');
  }

  /**
   * Check if free shipping is available
   */
  isFreeShippingAvailable(): boolean {
    return this.getSubtotal() >= 100;
  }

  /**
   * Get remaining amount for free shipping
   */
  getRemainingForFreeShipping(): number {
    const remaining = 100 - this.getSubtotal();
    return Math.max(0, remaining);
  }

  /**
   * Toggle promo code input
   */
  togglePromoCodeInput(): void {
    this.showPromoCodeInput = !this.showPromoCodeInput;
    if (!this.showPromoCodeInput) {
      this.promoCodeInput = '';
    }
  }

  /**
   * Get estimated delivery date
   */
  getEstimatedDeliveryDate(): string {
    if (this.selectedShippingOption.id === 'pickup') {
      return 'Disponible hoy';
    }

    const today = new Date();
    const deliveryDays = this.selectedShippingOption.id === 'express' ? 2 : 5;
    const deliveryDate = new Date(today.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));

    return deliveryDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Track cart analytics
   */
  private trackCartView(): void {
    if (typeof gtag !== 'undefined' && this.cartItems.length > 0) {
      gtag('event', 'view_cart', {
        'currency': 'PEN',
        'value': this.cart?.total || 0,
        'items': this.cartItems.map(item => ({
          'item_id': item.productId?.toString() || item.serviceId?.toString() || item.id,
          'item_name': item.name,
          'price': item.price,
          'quantity': item.quantity
        }))
      });
    }
  }

  /**
   * Track by function for ngFor performance
   */
  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }

  /**
   * Handle image error
   */
  onImageError(event: any): void {
    event.target.src = 'assets/images/product-placeholder.jpg';
  }

  /**
   * Format duration helper
   */
  formatDuration(duration: string): string {
    return this.formatDurationPrivate(duration);
  }

  /**
   * Get cart item count text
   */
  getCartItemCountText(): string {
    const count = this.cartItems.length;
    return count === 1 ? '1 producto' : `${count} productos`;
  }

  /**
   * Check if cart is empty
   */
  isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  /**
   * Get cart weight (for shipping calculation)
   */
  getCartWeight(): number {
    // Assuming average weight per item for shipping calculation
    return this.cartItems.reduce((weight, item) => {
      const itemWeight = item.type === 'product' ? 0.5 : 0; // Services have no weight
      return weight + (itemWeight * item.quantity);
    }, 0);
  }

  /**
   * Check if cart qualifies for express shipping
   */
  qualifiesForExpress(): boolean {
    return this.getSubtotal() >= 200; // Express available for orders over S/200
  }

  /**
   * Get total savings
   */
  getTotalSavings(): number {
    const itemSavings = this.cartItems.reduce((savings, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return savings + ((item.originalPrice - item.price) * item.quantity);
      }
      return savings;
    }, 0);

    const promoSavings = this.cart?.discount || 0;

    return itemSavings + promoSavings;
  }

  /**
   * Validate cart before checkout
   */
  private validateCartForCheckout(): { valid: boolean; message?: string } {
    if (this.cartItems.length === 0) {
      return { valid: false, message: 'El carrito está vacío' };
    }

    // Check if any items are out of stock
    const outOfStockItems = this.cartItems.filter(item =>
      item.maxQuantity !== undefined && item.quantity > item.maxQuantity
    );

    if (outOfStockItems.length > 0) {
      return {
        valid: false,
        message: `Algunos productos no tienen stock suficiente: ${outOfStockItems.map(i => i.name).join(', ')}`
      };
    }

    // Check minimum order amount
    if (this.getSubtotal() < 10) {
      return { valid: false, message: 'El monto mínimo de pedido es S/10' };
    }

    return { valid: true };
  }

  /**
   * Enhanced proceed to checkout with validation
   */
  proceedToCheckoutValidated(): void {
    const validation = this.validateCartForCheckout();

    if (!validation.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No se puede continuar',
        detail: validation.message,
        life: 5000
      });
      return;
    }

    // Track checkout initiation
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        'currency': 'PEN',
        'value': this.cart?.total || 0,
        'items': this.cartItems.map(item => ({
          'item_id': item.productId?.toString() || item.serviceId?.toString() || item.id,
          'item_name': item.name,
          'price': item.price,
          'quantity': item.quantity
        }))
      });
    }

    this.proceedToCheckout();
  }

  /**
   * Save cart for later (guest users)
   */
  saveCartForLater(): void {
    const cartData = {
      items: this.cartItems,
      timestamp: new Date().toISOString(),
      appliedPromoCode: this.appliedPromoCode,
      selectedShipping: this.selectedShippingOption.id
    };

    localStorage.setItem('angie_saved_cart', JSON.stringify(cartData));

    this.messageService.add({
      severity: 'success',
      summary: 'Carrito guardado',
      detail: 'Tu carrito ha sido guardado para más tarde',
      life: 3000
    });
  }

  /**
   * Load saved cart
   */
  loadSavedCart(): void {
    const savedCart = localStorage.getItem('angie_saved_cart');

    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);

        // Check if cart is not too old (7 days)
        const savedDate = new Date(cartData.timestamp);
        const daysDiff = (new Date().getTime() - savedDate.getTime()) / (1000 * 3600 * 24);

        if (daysDiff <= 7) {
          this.confirmationService.confirm({
            message: 'Tienes un carrito guardado. ¿Quieres restaurarlo?',
            header: 'Carrito guardado encontrado',
            icon: 'pi pi-shopping-cart',
            acceptLabel: 'Sí, restaurar',
            rejectLabel: 'No, mantener actual',
            accept: () => {
              // Restore cart items
              cartData.items.forEach((item: CartItem) => {
                this.ecommerceService.addToCart(item);
              });

              // Restore promo code
              if (cartData.appliedPromoCode) {
                this.appliedPromoCode = cartData.appliedPromoCode;
              }

              // Restore shipping option
              if (cartData.selectedShipping) {
                const shipping = this.shippingOptions.find(s => s.id === cartData.selectedShipping);
                if (shipping) {
                  this.selectedShippingOption = shipping;
                }
              }

              localStorage.removeItem('angie_saved_cart');

              this.messageService.add({
                severity: 'success',
                summary: 'Carrito restaurado',
                detail: 'Tu carrito guardado ha sido restaurado',
                life: 3000
              });
            }
          });
        } else {
          // Cart too old, remove it
          localStorage.removeItem('angie_saved_cart');
        }
      } catch (error) {
        console.error('Error loading saved cart:', error);
        localStorage.removeItem('angie_saved_cart');
      }
    }
  }

  /**
   * Share cart with someone
   */
  shareCart(): void {
    const cartUrl = `${window.location.origin}/ecommerce/cart?shared=${btoa(JSON.stringify({
      items: this.cartItems.map(item => ({
        type: item.type,
        id: item.productId || item.serviceId,
        quantity: item.quantity
      }))
    }))}`;

    if (navigator.share) {
      navigator.share({
        title: 'Mi carrito de AngieBraids',
        text: `Echa un vistazo a los productos que seleccioné en AngieBraids`,
        url: cartUrl
      }).catch(err => {
        console.log('Error sharing:', err);
        this.copyCartUrl(cartUrl);
      });
    } else {
      this.copyCartUrl(cartUrl);
    }
  }

  /**
   * Copy cart URL to clipboard
   */
  private copyCartUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Enlace copiado',
        detail: 'El enlace de tu carrito ha sido copiado al portapapeles',
        life: 3000
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Compartir carrito',
        detail: 'Copia este enlace: ' + url,
        life: 10000
      });
    });
  }

  /**
   * Print cart summary
   */
  printCart(): void {
    const printContent = this.generatePrintContent();
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * Generate print content
   */
  private generatePrintContent(): string {
    const date = new Date().toLocaleDateString('es-PE');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carrito de Compras - AngieBraids</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .item { border-bottom: 1px solid #ccc; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AngieBraids</h1>
          <h2>Resumen del Carrito</h2>
          <p>Fecha: ${date}</p>
        </div>
        ${this.cartItems.map(item => `
          <div class="item">
            <strong>${item.name}</strong><br>
            Cantidad: ${item.quantity}<br>
            Precio: ${this.formatPrice(item.price)}<br>
            Subtotal: ${this.formatPrice(item.price * item.quantity)}
          </div>
        `).join('')}
        <div class="total">
          Total: ${this.formatPrice(this.cart?.total || 0)}
        </div>
      </body>
      </html>
    `;
  }
}
