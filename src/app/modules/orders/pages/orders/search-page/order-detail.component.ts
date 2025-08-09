import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap, finalize } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Location } from '@angular/common';

import {
  ResponseShopOrderDetail,
  ShopOrderStatusEnum,
  OrderLineDTO,
  ResponseProductItemDetail
} from '../../../../../shared/models/orders/order.interface';
import { OrderService } from '../../../../../core/services/orders/order.service';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  //styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Injected services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  shopOrderStatusEnum = ShopOrderStatusEnum;
  // Signals for reactive state
  orderDetail = signal<ResponseShopOrderDetail | null>(null);
  loading = signal(false);
  orderId = signal<number>(0);

  // Computed values
  hasOrder = computed(() => this.orderDetail() !== null);
  orderStatus = computed(() => this.orderDetail()?.shopOrderStatus || ShopOrderStatusEnum.CREATED);
  hasProducts = computed(() => {
    const order = this.orderDetail();
    return order && order.orderLineDTOList && order.orderLineDTOList.length > 0;
  });
  hasServices = computed(() => {
    const order = this.orderDetail();
    return order && order.responseReservationDetail &&
           order.responseReservationDetail.responseWorkServiceDetails &&
           order.responseReservationDetail.responseWorkServiceDetails.length > 0;
  });
  orderTotal = computed(() => {
    const order = this.orderDetail();
    if (!order || !order.orderLineDTOList) return 0;
    return order.orderLineDTOList.reduce((total, line) => total + line.orderLineTotal, 0);
  });

  timeline = computed<TimelineEvent[]>(() => {
    const order = this.orderDetail();
    if (!order) return [];

    const events: TimelineEvent[] = [];
    const orderDate = new Date(order.sopOrderDate);

    // Order created
    events.push({
      status: 'CREATED',
      date: order.sopOrderDate,
      icon: 'pi pi-shopping-cart',
      color: '#3B82F6',
      description: 'Orden creada y en proceso de verificación'
    });

    // Add status-specific events
    if (order.shopOrderStatus === ShopOrderStatusEnum.APPROVED) {
      events.push({
        status: 'APPROVED',
        date: order.sopOrderDate, // You might want to add approval date to your model
        icon: 'pi pi-check-circle',
        color: '#10B981',
        description: 'Orden aprobada y en preparación'
      });
    } else if (order.shopOrderStatus === ShopOrderStatusEnum.REJECTED) {
      events.push({
        status: 'REJECTED',
        date: order.sopOrderDate,
        icon: 'pi pi-times-circle',
        color: '#EF4444',
        description: 'Orden rechazada'
      });
    }

    return events;
  });

  ngOnInit(): void {
    this.loadOrderDetail();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrderDetail(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = parseInt(params['id']);
          this.orderId.set(id);
          this.loading.set(true);

          return this.orderService.getOrderById(id);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (orderDetail) => {
          this.orderDetail.set(orderDetail);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading order detail:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el detalle de la orden',
            life: 5000
          });
          this.router.navigate(['/orders']);
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  refreshOrder(): void {
    this.loadOrderDetail();
  }

  printOrder(): void {
    // TODO: Implement print functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Imprimir',
      detail: 'Funcionalidad de impresión en desarrollo',
      life: 3000
    });
  }

  downloadInvoice(): void {
    // TODO: Implement download invoice functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Descargar',
      detail: 'Descarga de factura en desarrollo',
      life: 3000
    });
  }

  updateOrderStatus(newStatus: ShopOrderStatusEnum): void {
    const currentOrder = this.orderDetail();
    if (!currentOrder) return;

    const statusLabel = this.getStatusLabel(newStatus);

    this.confirmationService.confirm({
      header: `Cambiar Estado a ${statusLabel}`,
      message: `¿Estás seguro de cambiar el estado de la orden #${currentOrder.shopOrderId} a ${statusLabel}?`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        // TODO: Implement status update API call
        this.messageService.add({
          severity: 'info',
          summary: 'Actualización de Estado',
          detail: 'Funcionalidad de actualización en desarrollo',
          life: 3000
        });
      }
    });
  }

  getStatusSeverity(status: ShopOrderStatusEnum): "success" | "info" | "warning" | "danger" | "secondary" | "contrast"{
    switch (status) {
      case ShopOrderStatusEnum.CREATED:
        return 'info';
      case ShopOrderStatusEnum.APPROVED:
        return 'success';
      case ShopOrderStatusEnum.REJECTED:
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: ShopOrderStatusEnum): string {
    switch (status) {
      case ShopOrderStatusEnum.CREATED:
        return 'Creado';
      case ShopOrderStatusEnum.APPROVED:
        return 'Aprobado';
      case ShopOrderStatusEnum.REJECTED:
        return 'Rechazado';
      default:
        return status;
    }
  }

  getStatusIcon(status: ShopOrderStatusEnum): string {
    switch (status) {
      case ShopOrderStatusEnum.CREATED:
        return 'pi pi-clock';
      case ShopOrderStatusEnum.APPROVED:
        return 'pi pi-check-circle';
      case ShopOrderStatusEnum.REJECTED:
        return 'pi pi-times-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }

  getProductById(productItemId: number): ResponseProductItemDetail | undefined {
    const order = this.orderDetail();
    if (!order || !order.responseProductItemDetailList) return undefined;

    return order.responseProductItemDetailList.find(p => p.productItemId === productItemId);
  }

  calculateSubtotal(): number {
    const order = this.orderDetail();
    if (!order || !order.orderLineDTOList) return 0;

    return order.orderLineDTOList.reduce((total, line) => total + (line.orderLinePrice * line.orderLineQuantity), 0);
  }

  getShippingCost(): number {
    // This should come from the order or be calculated based on shipping method
    return 15.00; // Default shipping cost
  }

  getTaxAmount(): number {
    const subtotal = this.calculateSubtotal();
    return subtotal * 0.18; // 18% IGV in Peru
  }

  trackByOrderLineId(index: number, item: OrderLineDTO): number {
    return item.orderLineId;
  }

  trackByProductId(index: number, item: ResponseProductItemDetail): number {
    return item.productItemId;
  }
  formatAccountNumber(accountNumber: number | string | undefined): string {
    if (!accountNumber) return '';
    return '**** ' + accountNumber.toString().slice(-4);
  }
}
