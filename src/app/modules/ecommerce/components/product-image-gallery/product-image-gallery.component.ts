import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-image-gallery',
  template: `
    <div class="product-image-gallery">
      <p-galleria
        [value]="images"
        [responsiveOptions]="responsiveOptions"
        [numVisible]="4"
        [circular]="true"
        [showThumbnails]="true"
        [showIndicators]="true"
        [showIndicatorsOnItem]="showIndicatorsOnItem"
        [indicatorsPosition]="indicatorsPosition"
        [showItemNavigators]="true"
        [showThumbnailNavigators]="images.length > 4">

        <ng-template pTemplate="item" let-item>
          <img
            [src]="item.src"
            [alt]="item.alt"
            style="width: 100%; height: 400px; object-fit: cover;" />
        </ng-template>

        <ng-template pTemplate="thumbnail" let-item>
          <div class="thumbnail-container">
            <img
              [src]="item.thumbnail || item.src"
              [alt]="item.alt"
              style="width: 60px; height: 60px; object-fit: cover;" />
          </div>
        </ng-template>
      </p-galleria>
    </div>
  `,
  styles: [`
    .product-image-gallery {
      width: 100%;
    }

    .thumbnail-container {
      padding: 4px;
      border: 2px solid transparent;
      border-radius: 4px;
      transition: border-color 0.3s ease;
    }

    .thumbnail-container:hover {
      border-color: var(--primary-color);
    }

    ::ng-deep .p-galleria-thumbnail-item-active .thumbnail-container {
      border-color: var(--primary-color);
    }
  `]
})
export class ProductImageGalleryComponent {
  @Input() images: any[] = [];
  @Input() indicatorsPosition: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
  @Input() showIndicatorsOnItem: boolean = false;
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
}
