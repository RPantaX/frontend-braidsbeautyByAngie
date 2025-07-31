import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cart } from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-cart-summary',
  template: `
    <div class="cart-summary" [class.sticky]="sticky">
      <div class="summary-header">
        <h3 class="summary-title">
          <i class="pi pi-shopping-cart"></i>
          Resumen del Pedido
        </h3>
        <span class="item-count">{{ cart.itemCount }} artículo{{ cart.itemCount !== 1 ? 's' : '' }}</span>
      </div>

      <div class="summary-content">
        <!-- Subtotal -->
        <div class="summary-line">
          <span class="summary-label">Subtotal:</span>
          <span class="summary-value">{{ cart.subtotal | price }}</span>
        </div>

        <!-- Shipping -->
        <div class="summary-line" *ngIf="showShipping">
          <span class="summary-label">Envío:</span>
          <span class="summary-value" [class.free]="cart.shipping === 0">
            {{ cart.shipping === 0 ? 'Gratis' : (cart.shipping | price) }}
          </span>
        </div>

        <!-- Tax -->
        <div class="summary-line" *ngIf="cart.tax > 0">
          <span class="summary-label">IGV (18%):</span>
          <span class="summary-value">{{ cart.tax | price }}</span>
        </div>

        <!-- Discount -->
        <div class="summary-line discount-line" *ngIf="cart.discount > 0">
          <span class="summary-label">
            <i class="pi pi-tag"></i>
            Descuento:
          </span>
          <span class="summary-value discount">-{{ cart.discount | price }}</span>
        </div>

        <!-- Coupon Input -->
        <div class="coupon-section" *ngIf="showCouponInput && !cart.discount">
          <div class="p-inputgroup">
            <input
              type="text"
              pInputText
              placeholder="Código de cupón"
              [(ngModel)]="couponCode"
              class="coupon-input" />
            <p-button
              label="Aplicar"
              [outlined]="true"
              (onClick)="applyCoupon()">
            </p-button>
          </div>
        </div>

        <!-- Applied Coupon -->
        <div class="applied-coupon" *ngIf="cart.discount > 0 && appliedCouponCode">
          <div class="coupon-info">
            <span class="coupon-code">{{ appliedCouponCode }}</span>
            <p-button
              icon="pi pi-times"
              [text]="true"
              [rounded]="true"
              size="small"
              (onClick)="removeCoupon()">
            </p-button>
          </div>
        </div>

        <!-- Total -->
        <div class="summary-line total-line">
          <span class="summary-label total-label">Total:</span>
          <span class="summary-value total-value">{{ cart.total | price }}</span>
        </div>

        <!-- Savings -->
        <div class="savings-info" *ngIf="cart.discount > 0">
          <i class="pi pi-check-circle"></i>
          <span>Ahorras {{ cart.discount | price }}</span>
        </div>

        <!-- Free Shipping Threshold -->
        <div class="free-shipping-threshold" *ngIf="showFreeShippingThreshold && cart.subtotal < freeShippingMinimum && cart.shipping > 0">
          <div class="threshold-info">
            <i class="pi pi-truck"></i>
            <span>
              Agrega {{ (freeShippingMinimum - cart.subtotal) | price }} más para
              <strong>envío gratis</strong>
            </span>
          </div>
          <div class="threshold-progress">
            <div
              class="progress-bar"
              [style.width.%]="(cart.subtotal / freeShippingMinimum) * 100">
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="summary-actions" *ngIf="showActions">
        <p-button
          [label]="checkoutButtonLabel"
          [icon]="checkoutButtonIcon"
          styleClass="w-full checkout-button"
          [disabled]="cart.itemCount === 0 || disabled"
          [loading]="loading"
          (onClick)="checkout()">
        </p-button>

        <p-button
          label="Continuar Comprando"
          [outlined]="true"
          styleClass="w-full mt-2"
          (onClick)="continueShopping()"
          *ngIf="showContinueButton">
        </p-button>
      </div>

      <!-- Security Info -->
      <div class="security-info" *ngIf="showSecurityInfo">
        <div class="security-item">
          <i class="pi pi-shield text-green-500"></i>
          <span>Pago 100% seguro</span>
        </div>
        <div class="security-item">
          <i class="pi pi-refresh text-blue-500"></i>
          <span>Devoluciones fáciles</span>
        </div>
        <div class="security-item">
          <i class="pi pi-phone text-purple-500"></i>
          <span>Soporte 24/7</span>
        </div>
      </div>
    </div>
  `,
  //styleUrls: ['./cart-summary.component.scss']
})
export class CartSummaryComponent {
  @Input() cart: Cart = {
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0
  };

  @Input() sticky = false;
  @Input() showShipping = true;
  @Input() showCouponInput = true;
  @Input() showActions = true;
  @Input() showContinueButton = true;
  @Input() showSecurityInfo = true;
  @Input() showFreeShippingThreshold = true;
  @Input() freeShippingMinimum = 100;
  @Input() checkoutButtonLabel = 'Proceder al Pago';
  @Input() checkoutButtonIcon = 'pi pi-arrow-right';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() appliedCouponCode = '';

  @Output() onCheckout = new EventEmitter<void>();
  @Output() onContinueShopping = new EventEmitter<void>();
  @Output() onApplyCoupon = new EventEmitter<string>();
  @Output() onRemoveCoupon = new EventEmitter<void>();

  couponCode = '';

  /**
   * Handle checkout click
   */
  checkout(): void {
    this.onCheckout.emit();
  }

  /**
   * Handle continue shopping click
   */
  continueShopping(): void {
    this.onContinueShopping.emit();
  }

  /**
   * Apply coupon code
   */
  applyCoupon(): void {
    if (this.couponCode.trim()) {
      this.onApplyCoupon.emit(this.couponCode.trim());
      this.couponCode = '';
    }
  }

  /**
   * Remove applied coupon
   */
  removeCoupon(): void {
    this.onRemoveCoupon.emit();
  }
}
