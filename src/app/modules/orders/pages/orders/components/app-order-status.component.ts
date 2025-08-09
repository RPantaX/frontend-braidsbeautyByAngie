import { Component, Input, computed, signal } from '@angular/core';
import { ShopOrderStatusEnum } from '../../../../../shared/models/orders/order.interface';

@Component({
  selector: 'app-order-status',
  template: `
    <p-tag
      [value]="statusLabel()"
      [severity]="statusSeverity()"
      [icon]="statusIcon()"
      [rounded]="rounded"
      [styleClass]="customClass">
    </p-tag>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .status-tag {
      font-weight: 600;
      font-size: 0.875rem;
    }
  `]
})
export class OrderStatusComponent {
  @Input() status!: ShopOrderStatusEnum;
  @Input() rounded: boolean = true;
  @Input() customClass: string = 'status-tag';

  statusLabel = computed(() => {
    switch (this.status) {
      case ShopOrderStatusEnum.CREATED:
        return 'Creado';
      case ShopOrderStatusEnum.APPROVED:
        return 'Aprobado';
      case ShopOrderStatusEnum.REJECTED:
        return 'Rechazado';
      default:
        return this.status || 'Desconocido';
    }
  });

  statusSeverity = computed(() => {
    switch (this.status) {
      case ShopOrderStatusEnum.CREATED:
        return 'info';
      case ShopOrderStatusEnum.APPROVED:
        return 'success';
      case ShopOrderStatusEnum.REJECTED:
        return 'danger';
      default:
        return 'secondary';
    }
  });

  statusIcon = computed(() => {
    switch (this.status) {
      case ShopOrderStatusEnum.CREATED:
        return 'pi pi-clock';
      case ShopOrderStatusEnum.APPROVED:
        return 'pi pi-check-circle';
      case ShopOrderStatusEnum.REJECTED:
        return 'pi pi-times-circle';
      default:
        return 'pi pi-info-circle';
    }
  });
}
