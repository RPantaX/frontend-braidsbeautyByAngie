import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EcommerceProduct } from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-related-products',
  template: `
    <div class="related-products">
      <div class="section-header">
        <h3 class="section-title">{{ title }}</h3>
        <p class="section-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>

      <div class="products-carousel" *ngIf="products.length > 0">
        <p-carousel
          [value]="products"
          [numVisible]="numVisible"
          [numScroll]="numScroll"
          [responsiveOptions]="responsiveOptions"
          [showIndicators]="showIndicators"
          [showNavigators]="showNavigators"
          [autoplayInterval]="autoplayInterval"
          [circular]="circular">

          <ng-template pTemplate="item" let-product>
            <div class="product-slide">
              <app-product-card
                [product]="product"
                [compact]="compact"
                (onViewDetails)="viewProduct($event)"
                (onAddToCart)="addToCart($event)"
                (onToggleWishlist)="toggleWishlist($event)">
              </app-product-card>
            </div>
          </ng-template>
        </p-carousel>
      </div>

      <div class="products-grid" *ngIf="!useCarousel && products.length > 0">
        <div class="grid">
          <div
            class="col-12 md:col-6 lg:col-4 xl:col-3"
            *ngFor="let product of products; let i = index"
            [hidden]="maxItems && i >= maxItems">
            <app-product-card
              [product]="product"
              [compact]="compact"
              (onViewDetails)="viewProduct($event)"
              (onAddToCart)="addToCart($event)"
              (onToggleWishlist)="toggleWishlist($event)">
            </app-product-card>
          </div>
        </div>
      </div>

      <div class="no-products" *ngIf="products.length === 0">
        <div class="no-products-content">
          <i class="pi pi-shopping-bag no-products-icon"></i>
          <h4>{{ emptyMessage }}</h4>
          <p-button
            *ngIf="showViewAllButton"
            [label]="viewAllButtonLabel"
            [outlined]="true"
            (onClick)="viewAll()">
          </p-button>
        </div>
      </div>

      <div class="view-all-section" *ngIf="showViewAllButton && products.length > 0">
        <p-button
          [label]="viewAllButtonLabel"
          icon="pi pi-arrow-right"
          [outlined]="true"
          (onClick)="viewAll()">
        </p-button>
      </div>
    </div>
  `,
  styles: [`
    .related-products {
      margin: 2rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .section-subtitle {
      color: var(--text-color-secondary);
      margin: 0;
    }

    .product-slide {
      padding: 0 0.5rem;
    }

    .no-products {
      text-align: center;
      padding: 3rem 1rem;
    }

    .no-products-content {
      max-width: 300px;
      margin: 0 auto;
    }

    .no-products-icon {
      font-size: 3rem;
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
    }

    .no-products-content h4 {
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .view-all-section {
      text-align: center;
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .product-slide {
        padding: 0 0.25rem;
      }

      .section-title {
        font-size: 1.3rem;
      }
    }
  `]
})
export class RelatedProductsComponent {
  @Input() products: EcommerceProduct[] = [];
  @Input() title: string = 'Productos Relacionados';
  @Input() subtitle: string = '';
  @Input() useCarousel: boolean = true;
  @Input() compact: boolean = false;
  @Input() maxItems?: number;
  @Input() numVisible: number = 4;
  @Input() numScroll: number = 1;
  @Input() showIndicators: boolean = false;
  @Input() showNavigators: boolean = true;
  @Input() autoplayInterval: number = 0;
  @Input() circular: boolean = false;
  @Input() showViewAllButton: boolean = false;
  @Input() viewAllButtonLabel: string = 'Ver Todos';
  @Input() emptyMessage: string = 'No hay productos relacionados disponibles';

  @Output() onViewProduct = new EventEmitter<EcommerceProduct>();
  @Output() onAddToCart = new EventEmitter<EcommerceProduct>();
  @Output() onToggleWishlist = new EventEmitter<EcommerceProduct>();
  @Output() onViewAll = new EventEmitter<void>();

  responsiveOptions = [
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

  viewProduct(product: EcommerceProduct): void {
    this.onViewProduct.emit(product);
  }

  addToCart(product: EcommerceProduct): void {
    this.onAddToCart.emit(product);
  }

  toggleWishlist(product: EcommerceProduct): void {
    this.onToggleWishlist.emit(product);
  }

  viewAll(): void {
    this.onViewAll.emit();
  }
}
