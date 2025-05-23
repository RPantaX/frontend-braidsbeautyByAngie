import { Component, OnInit, signal, computed, ViewChild, ChangeDetectionStrategy, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
// PrimeNG Imports
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
// Services and Models

import { debounceTime, distinctUntilChanged, startWith, switchMap, finalize, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { RequestService, ResponseService, ResponseServicePageable } from '../../../../../shared/models/reservations/services.interface';
import { ServiceService } from '../../../../../core/services/reservations/services.service';
import { CategoryService } from '../../../../../core/services/reservations/category.service';
import { CategoryOption } from '../../../../../shared/models/categories/category.interface';

@Component({
  selector: 'app-services-list-page',
  standalone: true,
  imports: [
    CommonModule,

    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    InputNumberModule,
    IconFieldModule,
    InputIconModule,
    RippleModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  // Inputs
  loading = input<boolean>(false);

  // Outputs
  deleteService = output<ResponseService>();
  selectedService = output<ResponseService>();
  refresh = output<void>();
  newService = output<void>();
  deleteSelectedServices = output<ResponseService[]>();

  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Signals
  services = signal<ResponseService[]>([]);
  loadingData = signal<boolean>(false);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  sortField = signal<string>('');
  sortOrder = signal<number>(1);
  globalFilter = signal<string>('');

  // Dialog and form state
  serviceDialogVisible = signal<boolean>(false);
  currentService = signal<ResponseService | null>(null);

  // Selection
  selectedServicesValue: ResponseService[] = [];
  selectedServicesSignal = signal<ResponseService[]>([]);

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  constructor() {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadInitialServices();
    this.subscribeToServiceRefresh();
  }


  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(searchTerm => {
      this.globalFilter.set(searchTerm);
      this.loadServicesWithCurrentParams();
    });
  }

  private subscribeToServiceRefresh(): void {
    this.serviceService.refresh$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.loadServicesWithCurrentParams();
    });
  }

  private loadInitialServices(): void {
    const event: TableLazyLoadEvent = {
      first: 0,
      rows: this.pageSize(),
      sortField: undefined,
      sortOrder: undefined
    };
    this.loadServices(event);
  }

  loadServices(event: TableLazyLoadEvent): void {
    this.loadingData.set(true);

    const page = Math.floor((event.first || 0) / (event.rows || 10));
    const size = event.rows || 10;
    const sortField = event.sortField as string || '';
    const sortDir = (event.sortOrder === 1) ? 'asc' : 'desc';

    // Update current parameters
    this.currentPage.set(page);
    this.pageSize.set(size);
    this.sortField.set(sortField);
    this.sortOrder.set(event.sortOrder || 1);

    this.serviceService.getPageableServices(page, size, sortField, sortDir)
      .pipe(
        finalize(() => this.loadingData.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ResponseServicePageable) => {
          this.services.set(response.responseServiceList);
          this.totalRecords.set(response.totalElements);
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los servicios',
            life: 3000
          });
        }
      });
  }

  private loadServicesWithCurrentParams(): void {
    const event: TableLazyLoadEvent = {
      first: this.currentPage() * this.pageSize(),
      rows: this.pageSize(),
      sortField: this.sortField() || undefined,
      sortOrder: this.sortOrder()
    };
    this.loadServices(event);
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  openNew(): void {
    this.newService.emit();
  }

  editService(service: ResponseService): void {
    this.selectedService.emit(service);
  }


  onDeleteService(service: ResponseService): void {
    this.deleteService.emit(service);
  }

  onDeleteSelectedServices(): void {
    if (this.selectedServicesSignal().length > 0) {
      this.deleteSelectedServices.emit(this.selectedServicesSignal());
    }
  }

  exportCSV(): void {
    this.dt.exportCSV();
  }

  // Update selected services when table selection changes
  onSelectionChange(): void {
    this.selectedServicesSignal.set([...this.selectedServicesValue]);
  }
}
