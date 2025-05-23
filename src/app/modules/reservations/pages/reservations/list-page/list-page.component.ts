import { Component, OnInit, signal, ViewChild, ChangeDetectionStrategy, DestroyRef, inject, input, output, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
// Services and Models

import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ResponseService, ResponseServicePageable } from '../../../../../shared/models/reservations/services.interface';
import { ServiceService } from '../../../../../core/services/reservations/services.service';
import { CategoryService } from '../../../../../core/services/reservations/category.service';
import { CategoryOption } from '../../../../../shared/models/categories/reservation-category.interface';

@Component({
  selector: 'app-services-list-page',
  standalone: true,
  imports: [
    CommonModule,

    ReactiveFormsModule,
    TableModule,
    FormsModule,
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
export class ServiceListComponent implements OnInit, AfterViewInit {
  @ViewChild('dt') dt!: Table;

  // Inputs
  loading = input<boolean>(false);

  // Outputs
  deleteService = output<ResponseService>();
  selectedService = output<ResponseService>();
  refresh = output<void>();
  newService = output<void>();
  deleteSelectedServices = output<ResponseService[]>();
  requestCsv = output<Table>();

  private destroyRef = inject(DestroyRef);
  private serviceService = inject(ServiceService);
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);

  // Signals
  services = signal<ResponseService[]>([]);
  loadingData = signal<boolean>(false);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  sortField = signal<string>('');
  sortOrder = signal<number>(1);
  globalFilter = signal<string>('');

  // Filtros
  categories = signal<CategoryOption[]>([]);
  selectedCategory = signal<CategoryOption | null>(null);

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
    this.loadCategories();
  }
  ngAfterViewInit(): void {
    // Corregido: Emitir la referencia de la tabla después de que la vista se inicialice
    setTimeout(() => {
      if (this.dt) {
        this.requestCsv.emit(this.dt);
      }
    }, 100);
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

    private loadCategories(): void {
    this.categoryService.findAllCategories().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (categories: CategoryOption[]) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las categorías',
          life: 3000
        });
      }
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

    // Determinar si usar filtro por categoría o cargar todos
    const selectedCategory = this.selectedCategory();
    let serviceObservable;

     if (selectedCategory && selectedCategory.categoryId) {
      // Cargar servicios filtrados por categoría
      serviceObservable = this.serviceService.getPageableServicesByCategoryId(
        selectedCategory.categoryId,
        page,
        size,
        sortField,
        sortDir
      );
    } else {
      // Cargar todos los servicios
      serviceObservable = this.serviceService.getPageableServices(page, size, sortField, sortDir);
    }

    serviceObservable
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
  onCategoryFilter(selectedCategory: CategoryOption | null): void {
    this.selectedCategory.set(selectedCategory);
    this.currentPage.set(0); // Reset to first page when filtering
    this.loadServicesWithCurrentParams();
  }

  clearCategoryFilter(): void {
    this.selectedCategory.set(null);
    this.currentPage.set(0);
    this.loadServicesWithCurrentParams();
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
    if (this.dt) {
      this.requestCsv.emit(this.dt);
    }
  }

    // Corregido: Update selected services when table selection changes
  onSelectionChange(): void {
    console.log('Selection changed:', this.selectedServicesValue);
    this.selectedServicesSignal.set([...this.selectedServicesValue]);
    // Emitir inmediatamente los servicios seleccionados al componente padre
    this.deleteSelectedServices.emit(this.selectedServicesSignal());
  }

}
