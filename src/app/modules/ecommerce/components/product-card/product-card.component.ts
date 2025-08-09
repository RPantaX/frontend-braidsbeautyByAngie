import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EcommerceProduct } from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-product-card',
  template: `
    <div class="product-card" pRipple>
      <!-- Product Image -->
      <div class="product-image-container">
        <img
          [src]="product.productImage || 'assets/images/product-placeholder.jpg'"
          [alt]="product.productName"
          class="product-image"
          (click)="viewDetails()" />

        <!-- Product Badges -->
        <div class="product-badges">
          <span *ngIf="hasDiscount()" class="badge discount-badge">
            -{{ getDiscountPercentage() }}%
          </span>
          <span *ngIf="product.newProduct" class="badge new-badge">
            NEW
          </span>
          <span *ngIf="!isInStock()" class="badge out-of-stock-badge">
            SIN STOCK
          </span>
        </div>

        <!-- Quick Actions -->
        <div class="product-actions">
          <p-button
            icon="pi pi-eye"
            [rounded]="true"
            [outlined]="true"
            pTooltip="Vista rápida"
            tooltipPosition="left"
            (onClick)="viewDetails()">
          </p-button>
          <p-button
            icon="pi pi-heart"
            [rounded]="true"
            [outlined]="true"
            pTooltip="Agregar a favoritos"
            tooltipPosition="left"
            (onClick)="toggleWishlist()">
          </p-button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info" (click)="viewDetails()">
        <div class="product-category">
          {{ product.responseCategory.productCategoryName || 'Sin categoría' }}

        </div>
        <h3 class="product-name">{{ product.productName }}</h3>

        <div class="product-rating" *ngIf="product.rating && product.rating > 0">
          <p-rating
            [(ngModel)]="product.rating"
            [readonly]="true"
            [cancel]="false"
            styleClass="product-rating-stars">
          </p-rating>
          <span class="rating-count">({{ product.reviewCount || 0 }})</span>
        </div>

        <div class="product-pricing">
          <span *ngIf="hasDiscount()" class="original-price">
            S/{{ getOriginalPrice().toFixed(2) }}
          </span>
          <span class="current-price">
            S/{{ getCurrentPrice().toFixed(2) }}
          </span>
        </div>

        <!-- Stock Info -->
        <div class="product-stock" *ngIf="isInStock()">
          <span class="stock-text">
            {{ getTotalStock() }} disponible{{ getTotalStock() !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <!-- Add to Cart -->
      <div class="product-cart-action">
        <p-button
          label="Agregar al Carrito"
          icon="pi pi-shopping-cart"
          styleClass="w-full"
          [disabled]="!isInStock()"
          (onClick)="addToCart(); $event.stopPropagation()">
        </p-button>
      </div>
    </div>
  `,
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: EcommerceProduct;
  @Input() compact = false;

  @Output() onViewDetails = new EventEmitter<EcommerceProduct>();
  @Output() onAddToCart = new EventEmitter<EcommerceProduct>();
  @Output() onToggleWishlist = new EventEmitter<EcommerceProduct>();

  /**
   * Handle view details click
   */
  viewDetails(): void {
    this.onViewDetails.emit(this.product);
  }

  /**
   * Handle add to cart click
   */
  addToCart(): void {
    this.onAddToCart.emit(this.product);
  }

  /**
   * Handle wishlist toggle
   */
  toggleWishlist(): void {
    this.onToggleWishlist.emit(this.product);
  }

  /**
   * Check if product has discount
   */
  hasDiscount(): boolean {
    return this.product.responseCategory?.promotionDTOList?.length > 0;
  }

  /**
   * Get discount percentage
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    const promotion = this.product.responseCategory.promotionDTOList[0];
    return Math.round(promotion.promotionDiscountRate * 100);
  }

  /**
   * Get original price
   */
  getOriginalPrice(): number {
    if (!this.product.responseProductItemDetails.length) return 0;
    const prices = this.product.responseProductItemDetails.map(item => item.productItemPrice);
    return Math.min(...prices);
  }

  /**
   * Get current price (with discount if applicable)
   */
  getCurrentPrice(): number {
    const originalPrice = this.getOriginalPrice();
    if (!this.hasDiscount()) return originalPrice;

    const discountRate = this.product.responseCategory.promotionDTOList[0].promotionDiscountRate;
    return originalPrice * (1 - discountRate);
  }

  /**
   * Check if product is in stock
   */
  isInStock(): boolean {
    return this.product.responseProductItemDetails.some(item => item.productItemQuantityInStock > 0);
  }

  /**
   * Get total stock
   */
  getTotalStock(): number {
    return this.product.responseProductItemDetails.reduce(
      (total, item) => total + item.productItemQuantityInStock,
      0
    );
  }
}
