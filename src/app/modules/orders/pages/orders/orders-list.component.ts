import { Component, OnInit, OnDestroy, signal, computed, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';

import { OrderService } from '../../../../core/services/orders/order.service';
import {
  ResponseShopOrder,
  ShopOrderStatusEnum,
  ResponseListPageableShopOrder
} from '../../../../shared/models/orders/order.interface';

interface FilterOptions {
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  searchTerm: string;
}

interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  @ViewChild('ordersTable') ordersTable!: Table;

  private destroy$ = new Subject<void>();

  // Injected services
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals for reactive state
  orders = signal<ResponseShopOrder[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);

  // Computed values
  hasOrders = computed(() => this.orders().length > 0);
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  // Filter form
  filterForm!: FormGroup;

  // Static data
  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Creado', value: ShopOrderStatusEnum.CREATED },
    { label: 'Aprobado', value: ShopOrderStatusEnum.APPROVED },
    { label: 'Rechazado', value: ShopOrderStatusEnum.REJECTED }
  ];

  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  // Table configuration
  cols = [
    { field: 'shopOrderDTO.shopOrderId', header: 'ID', sortable: true, width: '80px' },
    { field: 'shopOrderDTO.shopOrderDate', header: 'Fecha', sortable: true, width: '120px' },
    { field: 'shopOrderDTO.shopOrderStatus', header: 'Estado', sortable: true, width: '120px' },
    { field: 'shopOrderDTO.shopOrderTotal', header: 'Total', sortable: true, width: '100px' },
    { field: 'addressDTO.adressCity', header: 'Ciudad', sortable: true, width: '120px' },
    { field: 'shoppingMethodDTO.shoppingMethodName', header: 'Envío', sortable: false, width: '150px' },
    { field: 'factureNumber', header: 'Factura', sortable: true, width: '100px' },
    { field: 'actions', header: 'Acciones', sortable: false, width: '120px' }
  ];

  ngOnInit(): void {
    this.initializeFilters();
    this.loadOrders();
    this.setupFilterSubscriptions();
    this.setupRefreshSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilters(): void {
    this.filterForm = this.fb.group({
      status: [''],
      dateFrom: [null],
      dateTo: [null],
      searchTerm: ['']
    });
  }

  private setupFilterSubscriptions(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadOrders();
      });
  }

  private setupRefreshSubscription(): void {
    this.orderService.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadOrders();
      });
  }

  loadOrders(event?: any): void {
    this.loading.set(true);

    let page = this.currentPage();
    let size = this.pageSize();
    let sortField = '';
    let sortDir = 'desc'; // Default to newest first

    // Handle table sorting event
    if (event) {
      page = Math.floor(event.first / event.rows);
      size = event.rows;

      if (event.sortField) {
        sortField = event.sortField;
        sortDir = event.sortOrder === 1 ? 'asc' : 'desc';
      }

      this.currentPage.set(page);
      this.pageSize.set(size);
    }

    this.orderService.getPageableOrders(page, size, sortField, sortDir)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response: ResponseListPageableShopOrder) => {
          this.orders.set(response.responseShopOrderList || []);
          this.totalRecords.set(response.totalElements || 0);
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las órdenes',
            life: 5000
          });
          this.orders.set([]);
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
    this.loadOrders();
  }

  onSort(event: any): void {
    this.loadOrders(event);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage.set(0);
    if (this.ordersTable) {
      this.ordersTable.clear();
    }
  }

  refreshData(): void {
    this.currentPage.set(0);
    this.loadOrders();
  }

  viewOrderDetail(order: ResponseShopOrder): void {
    this.router.navigate(['/orders', order.shopOrderDTO.shopOrderId]);
  }

  exportOrders(): void {
    // TODO: Implement export functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Funcionalidad de exportación en desarrollo',
      life: 3000
    });
  }

  getStatusSeverity(status: ShopOrderStatusEnum): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" {
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }
  approvedOrdersCount = computed(() =>
  this.orders().filter(order => order.shopOrderDTO.shopOrderStatus === ShopOrderStatusEnum.APPROVED).length
);

createdOrdersCount = computed(() =>
  this.orders().filter(order => order.shopOrderDTO.shopOrderStatus === ShopOrderStatusEnum.CREATED).length
);

rejectedOrdersCount = computed(() =>
  this.orders().filter(order => order.shopOrderDTO.shopOrderStatus === ShopOrderStatusEnum.REJECTED).length
);
}
