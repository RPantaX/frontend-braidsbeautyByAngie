import { Component, OnInit, signal, computed, ViewChild, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
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

  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceService);
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Signals
  services = signal<ResponseService[]>([]);
  categories = signal<CategoryOption[]>([]);
  loading = signal<boolean>(false);
  categoriesLoading = signal<boolean>(false);
  saving = signal<boolean>(false);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  sortField = signal<string>('');
  sortOrder = signal<number>(1);
  globalFilter = signal<string>('');

  // Dialog and form state
  serviceDialogVisible = signal<boolean>(false);
  currentService = signal<ResponseService | null>(null);
  isEditMode = computed(() => !!this.currentService());

  // Form
  serviceForm!: FormGroup;

  // Selection
  selectedServicesValue: ResponseService[] = [];
  selectedServices = signal<ResponseService[]>([]);

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  constructor() {
    this.initializeForm();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadInitialServices();
    this.subscribeToServiceRefresh();
  }

  private initializeForm(): void {
    this.serviceForm = this.fb.group({
      serviceName: ['', [Validators.required, Validators.minLength(2)]],
      serviceDescription: ['', [Validators.required, Validators.minLength(10)]],
      serviceImage: ['', [Validators.pattern('https?://.+')]],
      durationTimeAprox: ['', [Validators.required]],
      servicePrice: [null, [Validators.required, Validators.min(0.01)]],
      serviceCategoryId: [null, [Validators.required]]
    });
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

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.findAllCategories()
      .pipe(
        finalize(() => this.categoriesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (categories) => {
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
    this.loading.set(true);

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
        finalize(() => this.loading.set(false)),
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
    this.currentService.set(null);
    this.serviceForm.reset();
    this.serviceDialogVisible.set(true);
  }

  editService(service: ResponseService): void {
    this.currentService.set(service);
    this.serviceForm.patchValue({
      serviceName: service.serviceDTO.serviceName,
      serviceDescription: service.serviceDTO.serviceDescription,
      serviceImage: service.serviceDTO.serviceImage,
      durationTimeAprox: service.serviceDTO.durationTimeAprox,
      servicePrice: service.serviceDTO.servicePrice,
      serviceCategoryId: service.responseCategoryWIthoutServices.serviceCategoryDTO.categoryId
    });
    this.serviceDialogVisible.set(true);
  }

  hideDialog(): void {
    this.serviceDialogVisible.set(false);
    this.serviceForm.reset();
    this.currentService.set(null);
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.serviceForm.value;

    const serviceRequest: RequestService = {
      serviceName: formValue.serviceName,
      serviceDescription: formValue.serviceDescription,
      serviceImage: formValue.serviceImage || '',
      durationTimeAprox: formValue.durationTimeAprox,
      servicePrice: formValue.servicePrice,
      serviceCategoryId: formValue.serviceCategoryId
    };

    const saveOperation = this.isEditMode()
      ? this.serviceService.updateService(this.currentService()!.serviceDTO.serviceId, serviceRequest)
      : this.serviceService.createService(serviceRequest);

    saveOperation.pipe(
      finalize(() => this.saving.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: `Servicio ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente`,
          life: 3000
        });
        this.hideDialog();
        this.loadServicesWithCurrentParams();
      },
      error: (error) => {
        console.error('Error saving service:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${this.isEditMode() ? 'actualizar' : 'crear'} el servicio`,
          life: 3000
        });
      }
    });
  }

  deleteService(service: ResponseService): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el servicio "${service.serviceDTO.serviceName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.serviceService.deleteService(service.serviceDTO.serviceId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Servicio eliminado correctamente',
                life: 3000
              });
              this.loadServicesWithCurrentParams();
            },
            error: (error) => {
              console.error('Error deleting service:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el servicio',
                life: 3000
              });
            }
          });
      }
    });
  }

  deleteSelectedServices(): void {
    if (!this.selectedServices().length) return;

    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar ${this.selectedServices().length} servicio(s) seleccionado(s)?`,
      header: 'Confirmar Eliminación Múltiple',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const deleteRequests = this.selectedServices().map(service =>
          this.serviceService.deleteService(service.serviceDTO.serviceId)
        );

        // Execute all delete requests
        deleteRequests.forEach(request => {
          request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            error: (error) => {
              console.error('Error deleting service:', error);
            }
          });
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: `${this.selectedServices().length} servicio(s) eliminado(s) correctamente`,
          life: 3000
        });

        this.selectedServices.set([]);
        this.selectedServicesValue = [];
        this.loadServicesWithCurrentParams();
      }
    });
  }

  exportCSV(): void {
    this.dt.exportCSV();
  }

  // Update selected services when table selection changes
  onSelectionChange(): void {
    this.selectedServices.set([...this.selectedServicesValue]);
  }
}
