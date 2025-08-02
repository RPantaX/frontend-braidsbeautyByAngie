import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Review } from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-reviews',
  template: `
    <div class="reviews-container">

      <!-- Reviews Header -->
      <div class="reviews-header">
        <div class="reviews-summary">
          <div class="rating-overview">
            <div class="overall-rating">
              <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
              <div class="rating-stars">
                <p-rating
                  [(ngModel)]="averageRating"
                  [readonly]="true"
                  [cancel]="false"
                  styleClass="overall-rating-stars">
                </p-rating>
              </div>
              <span class="rating-count">{{ totalReviews }} reseña{{ totalReviews !== 1 ? 's' : '' }}</span>
            </div>

            <!-- Rating Distribution -->
            <div class="rating-distribution">
              <div class="rating-bar" *ngFor="let rating of [5,4,3,2,1]">
                <span class="rating-label">{{ rating }} estrella{{ rating !== 1 ? 's' : '' }}</span>
                <div class="bar-container">
                  <div
                    class="bar-fill"
                    [style.width.%]="getRatingPercentage(rating)">
                  </div>
                </div>
                <span class="rating-percentage">{{ getRatingCount(rating) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Write Review Button -->
        <div class="write-review-section" *ngIf="canWriteReview">
          <p-button
            label="Escribir Reseña"
            icon="pi pi-star"
            [outlined]="true"
            (onClick)="showWriteReview = true">
          </p-button>
        </div>
      </div>

      <!-- Write Review Form -->
      <div class="write-review-form" *ngIf="showWriteReview">
        <p-card header="Escribir una reseña">
          <div class="review-form">
            <div class="form-group">
              <label>Tu calificación:</label>
              <p-rating
                [(ngModel)]="newReview.rating"
                [cancel]="false"
                styleClass="review-rating-input">
              </p-rating>
            </div>

            <div class="form-group">
              <label for="reviewTitle">Título de la reseña:</label>
              <input
                id="reviewTitle"
                type="text"
                pInputText
                [(ngModel)]="newReview.title"
                placeholder="Resumen de tu experiencia"
                class="w-full" />
            </div>

            <div class="form-group">
              <label for="reviewComment">Tu reseña:</label>
              <textarea
                id="reviewComment"
                pInputTextarea
                [(ngModel)]="newReview.comment"
                placeholder="Comparte tu experiencia detallada..."
                rows="4"
                class="w-full">
              </textarea>
            </div>

            <div class="form-group">
              <label for="reviewerName">Tu nombre:</label>
              <input
                id="reviewerName"
                type="text"
                pInputText
                [(ngModel)]="newReview.customerName"
                placeholder="Nombre (opcional)"
                class="w-full" />
            </div>

            <div class="form-actions">
              <p-button
                label="Publicar Reseña"
                icon="pi pi-check"
                (onClick)="submitReview()"
                [disabled]="!isReviewValid()">
              </p-button>
              <p-button
                label="Cancelar"
                [outlined]="true"
                (onClick)="cancelReview()">
              </p-button>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list" *ngIf="reviews.length > 0">
        <div class="reviews-filters">
          <div class="filter-options">
            <p-dropdown
              [options]="sortOptions"
              [(ngModel)]="selectedSort"
              optionLabel="label"
              optionValue="value"
              placeholder="Ordenar por"
              (onChange)="onSortChange()">
            </p-dropdown>

            <p-dropdown
              [options]="filterOptions"
              [(ngModel)]="selectedFilter"
              optionLabel="label"
              optionValue="value"
              placeholder="Filtrar por calificación"
              [showClear]="true"
              (onChange)="onFilterChange()">
            </p-dropdown>
          </div>
        </div>

        <div class="review-items">
          <div
            class="review-item"
            *ngFor="let review of getFilteredReviews(); trackBy: trackByReviewId">

            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar" *ngIf="review.customerAvatar">
                  <img [src]="review.customerAvatar" [alt]="review.customerName" />
                </div>
                <div class="reviewer-avatar placeholder" *ngIf="!review.customerAvatar">
                  <i class="pi pi-user"></i>
                </div>
                <div class="reviewer-details">
                  <h4 class="reviewer-name">{{ review.customerName || 'Usuario Anónimo' }}</h4>
                  <div class="review-meta">
                    <p-rating
                      [(ngModel)]="review.rating"
                      [readonly]="true"
                      [cancel]="false"
                      styleClass="review-rating">
                    </p-rating>
                    <span class="review-date">{{ formatDate(review.date) }}</span>
                    <span class="verified-badge" *ngIf="review.verified">
                      <i class="pi pi-check-circle"></i>
                      Compra verificada
                    </span>
                  </div>
                </div>
              </div>

              <div class="review-actions">
                <p-button
                  icon="pi pi-thumbs-up"
                  [text]="true"
                  [rounded]="true"
                  pTooltip="Útil"
                  (onClick)="likeReview(review)">
                  <!--<span class="ml-1">{{ review.helpfulCount || 0 }}</span>-->
                </p-button>
                <p-button
                  icon="pi pi-flag"
                  [text]="true"
                  [rounded]="true"
                  pTooltip="Reportar"
                  (onClick)="reportReview(review)">
                </p-button>
              </div>
            </div>

            <div class="review-content">
              <!--<h5 class="review-title" *ngIf="review.title">{{ review.title }}</h5>-->
              <p class="review-comment">{{ review.comment }}</p>

              <!-- Review Images -->
              <div class="review-images" *ngIf="review.images && review.images.length > 0">
                <div class="image-grid">
                  <img
                    *ngFor="let image of review.images"
                    [src]="image"
                    [alt]="'Imagen de reseña'"
                    class="review-image"
                    (click)="openImageGallery(review.images, image)" />
                </div>
              </div>
            </div>

            <!-- Store Response -->
            <div class="store-response" *ngIf="review.storeResponse">
              <div class="response-header">
                <i class="pi pi-reply"></i>
                <strong>Respuesta del vendedor</strong>
                <span class="response-date">{{ formatDate(review.storeResponse.date) }}</span>
              </div>
              <p class="response-content">{{ review.storeResponse.message }}</p>
            </div>
          </div>
        </div>

        <!-- Load More Reviews -->
        <div class="load-more-section" *ngIf="hasMoreReviews">
          <p-button
            label="Ver más reseñas"
            [outlined]="true"
            [loading]="loadingMore"
            (onClick)="loadMoreReviews()">
          </p-button>
        </div>
      </div>

      <!-- No Reviews -->
      <div class="no-reviews" *ngIf="reviews.length === 0 && !showWriteReview">
        <div class="no-reviews-content">
          <i class="pi pi-star no-reviews-icon"></i>
          <h3>Sin reseñas aún</h3>
          <p>Sé el primero en escribir una reseña sobre este producto.</p>
          <p-button
            label="Escribir primera reseña"
            icon="pi pi-star"
            (onClick)="showWriteReview = true"
            *ngIf="canWriteReview">
          </p-button>
        </div>
      </div>
    </div>
  `,
  //styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {
  @Input() reviews: Review[] = [];
  @Input() averageRating: number = 0;
  @Input() totalReviews: number = 0;
  @Input() serviceId?: number;
  @Input() productId?: number;
  @Input() canWriteReview: boolean = true;

  @Output() onSubmitReview = new EventEmitter<any>();
  @Output() onLoadMoreReviews = new EventEmitter<void>();

  // UI State
  showWriteReview = false;
  loadingMore = false;
  hasMoreReviews = false;
  selectedSort = 'newest';
  selectedFilter = '';

  // New Review
  newReview = {
    rating: 0,
    title: '',
    comment: '',
    customerName: ''
  };

  // Options
  sortOptions = [
    { label: 'Más recientes', value: 'newest' },
    { label: 'Más antiguos', value: 'oldest' },
    { label: 'Calificación: Alta a Baja', value: 'rating_desc' },
    { label: 'Calificación: Baja a Alta', value: 'rating_asc' },
    { label: 'Más útiles', value: 'helpful' }
  ];

  filterOptions = [
    { label: 'Todas las calificaciones', value: '' },
    { label: '5 estrellas', value: '5' },
    { label: '4 estrellas', value: '4' },
    { label: '3 estrellas', value: '3' },
    { label: '2 estrellas', value: '2' },
    { label: '1 estrella', value: '1' }
  ];

  /**
   * Get rating percentage for distribution
   */
  getRatingPercentage(rating: number): number {
    const count = this.getRatingCount(rating);
    return this.totalReviews > 0 ? (count / this.totalReviews) * 100 : 0;
  }

  /**
   * Get count for specific rating
   */
  getRatingCount(rating: number): number {
    return this.reviews.filter(review => Math.floor(review.rating) === rating).length;
  }

  /**
   * Get filtered reviews
   */
  getFilteredReviews(): Review[] {
    let filtered = [...this.reviews];

    // Apply rating filter
    if (this.selectedFilter) {
      const filterRating = parseInt(this.selectedFilter);
      filtered = filtered.filter(review => Math.floor(review.rating) === filterRating);
    }

    // Apply sorting
    switch (this.selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'rating_desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_asc':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      /*case 'helpful':
        filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;*/
    }

    return filtered;
  }

  /**
   * Handle sort change
   */
  onSortChange(): void {
    // Reviews will be re-filtered automatically through getFilteredReviews()
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    // Reviews will be re-filtered automatically through getFilteredReviews()
  }

  /**
   * Submit new review
   */
  submitReview(): void {
    if (this.isReviewValid()) {
      const reviewData = {
        ...this.newReview,
        serviceId: this.serviceId,
        productId: this.productId,
        date: new Date()
      };

      this.onSubmitReview.emit(reviewData);
      this.resetReviewForm();
    }
  }

  /**
   * Cancel review writing
   */
  cancelReview(): void {
    this.showWriteReview = false;
    this.resetReviewForm();
  }

  /**
   * Reset review form
   */
  private resetReviewForm(): void {
    this.newReview = {
      rating: 0,
      title: '',
      comment: '',
      customerName: ''
    };
    this.showWriteReview = false;
  }

  /**
   * Check if review is valid
   */
  isReviewValid(): boolean {
    return this.newReview.rating > 0 && this.newReview.comment.trim().length > 0;
  }

  /**
   * Load more reviews
   */
  loadMoreReviews(): void {
    this.loadingMore = true;
    this.onLoadMoreReviews.emit();
    // In a real implementation, this would be handled by the parent component
    setTimeout(() => {
      this.loadingMore = false;
    }, 1000);
  }

  /**
   * Like a review
   */
  likeReview(review: Review): void {
    // Implement like functionality
    if (!review.helpfulCount) {
      review.helpfulCount = 0;
    }
    review.helpfulCount++;
  }

  /**
   * Report a review
   */
  reportReview(review: Review): void {
    // Implement report functionality
    console.log('Reporting review:', review.id);
  }

  /**
   * Open image gallery
   */
  openImageGallery(images: string[], selectedImage: string): void {
    // Implement image gallery opening
    console.log('Opening gallery with images:', images, 'selected:', selectedImage);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Track by function for ngFor performance
   */
  trackByReviewId(index: number, review: Review): number {
    return review.id;
  }
}
