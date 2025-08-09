import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EcommerceInterfaceService } from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-service-card',
  template: `
    <div class="service-card" pRipple [class.compact]="compact">
      <!-- Service Image -->
      <div class="service-image-container">
        <img
          [src]="service.serviceDTO.serviceImage || 'assets/images/service-placeholder.jpg'"
          [alt]="service.serviceDTO.serviceName"
          class="service-image"
          (click)="viewDetails()" />

        <!-- Service Badges -->
        <div class="service-badges">
          <span *ngIf="hasDiscount()" class="badge discount-badge">
            -{{ getDiscountPercentage() }}% OFF
          </span>
          <span *ngIf="service.featured" class="badge featured-badge">
            DESTACADO
          </span>
        </div>

        <!-- Quick Actions -->
        <div class="service-actions" *ngIf="!compact">
          <p-button
            icon="pi pi-eye"
            [rounded]="true"
            [outlined]="true"
            pTooltip="Vista rápida"
            tooltipPosition="left"
            (onClick)="viewDetails()">
          </p-button>
        </div>
      </div>

      <!-- Service Info -->
      <div class="service-info" (click)="viewDetails()">
        <div class="service-meta">
          <span class="service-category">
            {{ service.responseCategoryWIthoutServices.serviceCategoryDTO.categoryName || 'Sin categoría' }}
          </span>
          <span class="service-duration">
            {{ formatDuration(service.serviceDTO.durationTimeAprox) }}
          </span>
        </div>

        <h3 class="service-name">{{ service.serviceDTO.serviceName }}</h3>

        <p class="service-description" *ngIf="!compact">
          {{ service.serviceDTO.serviceDescription }}
        </p>

        <div class="service-rating" *ngIf="service.rating && service.rating > 0">
          <p-rating
            [(ngModel)]="service.rating"
            [readonly]="true"
            [cancel]="false"
            styleClass="service-rating-stars">
          </p-rating>
          <span class="rating-count">({{ service.reviewCount || 0 }})</span>
        </div>

        <div class="service-pricing">
          <span *ngIf="hasDiscount()" class="original-price">
            S/{{ service.serviceDTO.servicePrice.toFixed(2) }}
          </span>
          <span class="current-price">
            S/{{ getCurrentPrice().toFixed(2) }}
          </span>
        </div>

        <!-- Availability -->
        <div class="service-availability" *ngIf="service.availableSlots && service.availableSlots > 0">
          <i class="pi pi-calendar text-green-500"></i>
          <span>{{ service.availableSlots }} horarios disponibles</span>
        </div>
      </div>

      <!-- Service Actions -->
      <div class="service-cart-action">
        <p-button
          [label]="compact ? 'Reservar' : 'Reservar Cita'"
          icon="pi pi-calendar"
          styleClass="w-full"
          (onClick)="addToCart(); $event.stopPropagation()">
        </p-button>
      </div>
    </div>
  `,
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input() service!: EcommerceInterfaceService;
  @Input() compact = false;

  @Output() onViewDetails = new EventEmitter<EcommerceInterfaceService>();
  @Output() onAddToCart = new EventEmitter<EcommerceInterfaceService>();

  /**
   * Handle view details click
   */
  viewDetails(): void {
    this.onViewDetails.emit(this.service);
  }

  /**
   * Handle add to cart click
   */
  addToCart(): void {
    this.onAddToCart.emit(this.service);
  }

  /**
   * Check if service has discount
   */
  hasDiscount(): boolean {
    return this.service.responseCategoryWIthoutServices?.promotionDTOList?.length > 0;
  }

  /**
   * Get discount percentage
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    const promotion = this.service.responseCategoryWIthoutServices.promotionDTOList[0];
    return Math.round(promotion.promotionDiscountRate * 100);
  }

  /**
   * Get current price (with discount if applicable)
   */
  getCurrentPrice(): number {
    const originalPrice = this.service.serviceDTO.servicePrice;
    if (!this.hasDiscount()) return originalPrice;

    const discountRate = this.service.responseCategoryWIthoutServices.promotionDTOList[0].promotionDiscountRate;
    return originalPrice * (1 - discountRate);
  }

  /**
   * Format duration from string to readable format
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
}
