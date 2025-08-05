// service-booking-container.component.ts
import { Component, Input, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

// Services
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';

// Interfaces
import { ServiceDetail, Cart, CartItem } from '../../../../shared/models/ecommerce/ecommerce.interface';
import { BookingOrder, BookingStateService } from '../../../../core/services/reservations/booking-state.service';
import { toObservable } from '@angular/core/rxjs-interop';

interface BookingStep {
  id: number;
  label: string;
  icon: string;
  completed: boolean;
}

@Component({
  selector: 'app-service-booking-container',
  template: `
    <div class="service-booking-container">

      <!-- Header -->
      <div class="booking-header" *ngIf="service">
        <div class="service-info">
          <img [src]="service.serviceDTO.serviceImage || 'assets/images/service-placeholder.jpg'"
               [alt]="service.serviceDTO.serviceName"
               class="service-image" />
          <div class="service-details">
            <h2 class="service-name">{{ service.serviceDTO.serviceName }}</h2>
            <p class="service-description">{{ service.serviceDTO.serviceDescription }}</p>
            <div class="service-meta">
              <span class="service-price">{{ service.serviceDTO.servicePrice | price }}</span>
              <span class="service-duration">{{ service.serviceDTO.durationTimeAprox | duration }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Progress -->
      <div class="booking-progress">
        <div class="progress-steps">
          <div class="step"
               *ngFor="let step of bookingSteps; let i = index"
               [class.active]="bookingState.currentStep() === step.id"
               [class.completed]="step.completed">
            <div class="step-indicator">
              <span class="step-number" *ngIf="!step.completed">{{ step.id }}</span>
              <i class="pi pi-check" *ngIf="step.completed"></i>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Main Booking Component -->
      <div class="booking-content">
        <div class="booking-main">
          <app-service-booking
            [service]="service"
            (onReservationComplete)="onReservationComplete($event)">
          </app-service-booking>
        </div>

        <!-- Shopping Cart Integration -->
        <div class="booking-sidebar" *ngIf="showCartIntegration()">
          <div class="cart-section">
            <h3 class="cart-title">
              <i class="pi pi-shopping-bag"></i>
              Productos Adicionales
            </h3>

            <!-- Current Cart Items -->
            <div class="current-cart" *ngIf="cart().items.length > 0">
              <h4>En tu carrito:</h4>
              <div class="cart-items">
                <div class="cart-item" *ngFor="let item of getProductsFromCart()">
                  <div class="item-info">
                    <img [src]="item.image || 'assets/images/product-placeholder.jpg'"
                         [alt]="item.name"
                         class="item-image" />
                    <div class="item-details">
                      <h5 class="item-name">{{ item.name }}</h5>
                      <p class="item-price">{{ item.price | price }}</p>
                    </div>
                  </div>
                  <div class="item-quantity">
                    <p-inputNumber
                      [(ngModel)]="item.quantity"
                      [min]="0"
                      [max]="item.maxQuantity || 99"
                      [showButtons]="true"
                      buttonLayout="horizontal"
                      size="small"
                      (onInput)="updateCartItemQuantity(item, $event.value)">
                    </p-inputNumber>
                  </div>
                  <p-button
                    icon="pi pi-trash"
                    [text]="true"
                    severity="danger"
                    size="small"
                    (onClick)="removeFromCart(item)"
                    pTooltip="Eliminar del carrito">
                  </p-button>
                </div>
              </div>
            </div>

            <!-- Order Summary When Reservation Completed -->
            <div class="order-summary" *ngIf="bookingState.isBookingComplete()">
              <h4>Resumen de tu orden:</h4>

              <div class="summary-items">
                <!-- Service -->
                <div class="summary-item service-item">
                  <div class="item-info">
                    <i class="pi pi-calendar"></i>
                    <span class="item-name">{{ service?.serviceDTO?.serviceName }}</span>
                  </div>
                  <span class="item-price">{{ service?.serviceDTO!.servicePrice | price }}</span>
                </div>

                <!-- Products -->
                <div class="summary-item product-item" *ngFor="let item of getProductsFromCart()">
                  <div class="item-info">
                    <i class="pi pi-shopping-bag"></i>
                    <span class="item-name">{{ item.name }} (x{{ item.quantity }})</span>
                  </div>
                  <span class="item-price">{{ (item.price * item.quantity) | price }}</span>
                </div>
              </div>

              <div class="summary-total">
                <div class="total-line">
                  <span class="total-label">Total:</span>
                  <span class="total-amount">{{ getOrderTotal() | price }}</span>
                </div>
              </div>

              <!-- Generate Order Button -->
              <div class="order-actions">
                <p-button
                  label="Generar Orden Completa"
                  icon="pi pi-check"
                  styleClass="w-full p-button-lg"
                  [loading]="generatingOrder()"
                  [disabled]="!canGenerateOrder()"
                  (onClick)="generateCompleteOrder()">
                </p-button>

                <p-button
                  label="Solo Reservar Servicio"
                  icon="pi pi-calendar"
                  [outlined]="true"
                  styleClass="w-full mt-2"
                  [disabled]="generatingOrder()"
                  (onClick)="confirmServiceOnly()">
                </p-button>
              </div>
            </div>

            <!-- Empty Cart State -->
            <div class="empty-cart" *ngIf="cart().items.length === 0 && !bookingState.isBookingComplete()">
              <i class="pi pi-shopping-bag"></i>
              <p>Tu carrito está vacío</p>
              <p-button
                label="Ver Productos"
                icon="pi pi-external-link"
                [outlined]="true"
                size="small"
                routerLink="/ecommerce/products">
              </p-button>
            </div>
          </div>

          <!-- Help Section -->
          <div class="help-section">
            <h4>¿Necesitas ayuda?</h4>
            <div class="help-options">
              <div class="help-option">
                <i class="pi pi-phone"></i>
                <div>
                  <strong>Llámanos</strong>
                  <p>+51 999 888 777</p>
                </div>
              </div>
              <div class="help-option">
                <i class="pi pi-comment"></i>
                <div>
                  <strong>Chat en vivo</strong>
                  <p>Disponible 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <p-dialog
        header="¡Orden Generada Exitosamente!"
        [(visible)]="showSuccessModal"
        [modal]="true"
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        styleClass="success-dialog">

        <div class="success-content" *ngIf="completedOrder">
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>

          <h3>Orden #{{ completedOrder.reservationId }} creada</h3>
          <p>Tu reserva y productos han sido procesados exitosamente.</p>

          <div class="order-details">
            <div class="detail-row">
              <span class="label">Servicio:</span>
              <span class="value">{{ completedOrder.bookingData.service?.serviceDTO?.serviceName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Especialista:</span>
              <span class="value">
                {{ completedOrder.bookingData.employee?.person?.name }}
                {{ completedOrder.bookingData.employee?.person?.lastName }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">{{ formatDate(completedOrder.bookingData.date) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total:</span>
              <span class="value total">{{ completedOrder.totalAmount | price }}</span>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <p-button
              label="Ver Mis Reservas"
              icon="pi pi-calendar"
              (onClick)="goToReservations()">
            </p-button>
            <p-button
              label="Continuar"
              icon="pi pi-check"
              [outlined]="true"
              (onClick)="closeSuccessModal()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styleUrls: ['./service-booking-container.component.scss']
})
export class ServiceBookingContainerComponent implements OnInit, OnDestroy {

  // Services
  public  readonly bookingState = inject(BookingStateService);
  private readonly ecommerceService = inject(EcommerceService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  // Input
  @Input() service: ServiceDetail | null = null;

  // Signals
  readonly generatingOrder = signal(false);
  readonly cart = signal<Cart>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0
  });

  // State
  showSuccessModal = false;
  completedOrder: BookingOrder | null = null;

  // Booking steps
  bookingSteps: BookingStep[] = [
    { id: 1, label: 'Especialista', icon: 'pi pi-user', completed: false },
    { id: 2, label: 'Fecha y Hora', icon: 'pi pi-calendar', completed: false },
    { id: 3, label: 'Confirmación', icon: 'pi pi-check', completed: false }
  ];

  // Computed
  readonly showCartIntegration = computed(() => {
    return this.bookingState.currentStep() >= 2;
  });

  ngOnInit(): void {
    this.initializeService();
    this.loadCart();
    this.subscribeToBookingState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeService(): void {
    if (this.service) {
      this.bookingState.setSelectedService(this.service);
    }
  }

  private loadCart(): void {
    this.ecommerceService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart.set(cart);
      });
  }

  private subscribeToBookingState(): void {
    // Convertir el signal a observable y suscribirse
    toObservable(this.bookingState.currentStep)
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentStep => {
        this.bookingSteps.forEach((step, index) => {
          step.completed = currentStep > step.id;
        });
      });
  }

  /**
   * Handle reservation completion from service booking component
   */
  onReservationComplete(event: {reservationId: number, bookingData: any}): void {
    this.bookingState.setReservationId(event.reservationId);

    this.messageService.add({
      severity: 'success',
      summary: 'Servicio Reservado',
      detail: `Tu cita ha sido reservada exitosamente. ID: #${event.reservationId}`,
      life: 5000
    });

    // Update step completion
    this.bookingSteps.forEach(step => {
      if (step.id <= 3) step.completed = true;
    });
  }

  /**
   * Cart management methods
   */
  getProductsFromCart(): CartItem[] {
    return this.cart().items.filter(item => item.type === 'product');
  }

  updateCartItemQuantity(item: CartItem, quantity: string | number | null): void {
  if (quantity === null || quantity === undefined) return;

  const numericQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;

  if (isNaN(numericQuantity) || numericQuantity <= 0) {
    this.removeFromCart(item);
  } else {
    this.ecommerceService.updateCartItemQuantity(item.id, numericQuantity);
  }
}


  removeFromCart(item: CartItem): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${item.name}" del carrito?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ecommerceService.removeFromCart(item.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Producto eliminado',
          detail: `${item.name} ha sido eliminado del carrito`,
          life: 3000
        });
      }
    });
  }

  /**
   * Order calculations
   */
  getOrderTotal(): number {
    const servicePrice = this.service?.serviceDTO?.servicePrice || 0;
    const productsTotal = this.getProductsFromCart().reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    return servicePrice + productsTotal;
  }

  canGenerateOrder(): boolean {
    return this.bookingState.isBookingComplete() && !this.generatingOrder();
  }

  /**
   * Order generation
   */
  generateCompleteOrder(): void {
    if (!this.canGenerateOrder()) return;

    this.generatingOrder.set(true);

    // Add current cart products to booking state
    const cartProducts = this.getProductsFromCart();
    cartProducts.forEach(product => {
      this.bookingState.addBookingProduct(product, product.quantity);
    });

    // Simulate order processing
    setTimeout(() => {
      const completedBooking = this.bookingState.completeBooking();

      if (completedBooking) {
        this.completedOrder = completedBooking;

        // Clear cart since products are now part of the order
        this.ecommerceService.clearCart();

        this.showSuccessModal = true;
        this.generatingOrder.set(false);

        this.messageService.add({
          severity: 'success',
          summary: 'Orden Completada',
          detail: `Orden #${completedBooking.reservationId} generada exitosamente`,
          life: 8000
        });
      } else {
        this.generatingOrder.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar la orden completa',
          life: 5000
        });
      }
    }, 2000);
  }

  confirmServiceOnly(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que solo quieres reservar el servicio sin los productos del carrito?',
      header: 'Confirmar Solo Servicio',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, solo servicio',
      rejectLabel: 'Cancelar',
      accept: () => {
        const completedBooking = this.bookingState.completeBooking();

        if (completedBooking) {
          this.completedOrder = completedBooking;
          this.showSuccessModal = true;

          this.messageService.add({
            severity: 'success',
            summary: 'Servicio Reservado',
            detail: `Reserva #${completedBooking.reservationId} confirmada`,
            life: 5000
          });
        }
      }
    });
  }

  /**
   * Navigation methods
   */
  goToReservations(): void {
    this.router.navigate(['/reservations']);
    this.closeSuccessModal();
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.completedOrder = null;

    // Reset booking state for new booking
    this.bookingState.resetState();
  }

  /**
   * Utility methods
   */
  formatDate(date: Date | null): string {
    if (!date) return '';

    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
