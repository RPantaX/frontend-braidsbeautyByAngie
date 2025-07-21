import { Component, DestroyRef, inject, OnInit, signal, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { RequestService, ResponseService } from '../../../../../../shared/models/reservations/services.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ServiceService } from '../../../../../../core/services/reservations/services.service';
import { CategoryService } from '../../../../../../core/services/reservations/category.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryOption } from '../../../../../../shared/models/categories/reservation-category.interface';

@Component({
  selector: 'app-new-service-page',
  templateUrl: './new-page.component.html',
  styleUrls: ['./new-page.component.scss']
})
export class NewServiceComponent implements OnInit, OnChanges {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() refreshEntities = new EventEmitter<void>();
  @Input() entity: ResponseService | null = null;
  @Input() serviceId: number = 0;

  categories = signal<CategoryOption[]>([]);
  categoriesLoading = signal<boolean>(false);
  isEditMode: boolean = false;
  isSubmitting: boolean = false;

  // Form group declaration using FormBuilder for cleaner code
  serviceForm: FormGroup;

  // Subject for cleaning up subscriptions
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private serviceService = inject(ServiceService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Initialize form with FormBuilder
    this.serviceForm = this.initializeForm();
  }

  /**
   * Initialize form with default values and validators
   */
  private initializeForm(): FormGroup {
    return this.fb.group({
      serviceName: ['', [Validators.required, Validators.minLength(2)]],
      serviceDescription: ['', [Validators.required, Validators.minLength(10)]],
      serviceImage: ['', [Validators.pattern('https?://.+')]],
      durationTimeAprox: ['', [Validators.required]],
      servicePrice: [null, [Validators.required, Validators.min(0.01)]],
      serviceCategoryId: [null, [Validators.required]]
    });
  }

  /**
   * Lifecycle hook - component initialization
   */
  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Lifecycle hook - detect input changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entity'] && changes['entity'].currentValue) {
      this.isEditMode = true;
      this.patchFormValues(changes['entity'].currentValue);
    } else if (changes['entity'] && !changes['entity'].currentValue) {
      this.resetForm();
    }
  }

  /**
   * Load available categories
   */
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

  /**
   * Patch form values from entity
   */
  private patchFormValues(entity: ResponseService): void {
    this.serviceForm.patchValue({
      serviceName: entity.serviceDTO.serviceName,
      serviceDescription: entity.serviceDTO.serviceDescription,
      serviceImage: entity.serviceDTO.serviceImage,
      durationTimeAprox: this.stringToTime(entity.serviceDTO.durationTimeAprox),
      servicePrice: entity.serviceDTO.servicePrice,
      serviceCategoryId: entity.responseCategoryWIthoutServices.serviceCategoryDTO.categoryId
    });
  }
  stringToTime(dateStr: string): Date | null {
    if (!dateStr) return null;

    const [hours, minutes] = dateStr.split(':').map(Number);
    const now = new Date();
    now.setHours(hours);
    now.setMinutes(minutes);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  }
  /**
   * Reset form to default values
   */
  private resetForm(): void {
    this.serviceForm.reset();
    this.isEditMode = false;
  }

  /**
   * Form submission handler
   */
  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched(this.serviceForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete los campos obligatorios correctamente'
      });
      return;
    }

    const formValue = this.serviceForm.value;
    const serviceRequest: RequestService = {
      serviceName: formValue.serviceName,
      serviceDescription: formValue.serviceDescription,
      serviceImage: formValue.serviceImage || '',
      durationTimeAprox: this.formatTime(formValue.durationTimeAprox),
      servicePrice: formValue.servicePrice,
      serviceCategoryId: formValue.serviceCategoryId
    };

    this.isSubmitting = true;
    console.log('Service Request:', serviceRequest);
    if (this.isEditMode && this.serviceId) {
      this.updateService(this.serviceId, serviceRequest);
    } else {
      this.createService(serviceRequest);
    }
  }
  formatTime(date: Date): string {
    if (!date) return '';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
  /**
   * Create a new service
   */
  private createService(service: RequestService): void {
    this.serviceService.createService(service)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Servicio creado correctamente'
          });
          this.refreshEntities.emit();
          this.closeDialog.emit();
          this.resetForm();
          this.refreshServices();
        },
        error: (error) => this.handleError(error)
      });
  }

  /**
   * Update an existing service
   */
  private updateService(id: number, service: RequestService): void {
    this.serviceService.updateService(id, service)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Servicio actualizado correctamente'
          });
          this.refreshEntities.emit();
          this.closeDialog.emit();
          this.resetForm();
          this.refreshServices();
        },
        error: (error) => this.handleError(error)
      });
  }

  /**
   * Mark all form controls as touched to trigger validation
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): void {
    console.error('API Error:', error);
    let errorMessage = 'Ocurrió un error inesperado. Intente nuevamente.';

    if (error.status === 406 && error.error?.message) {
      errorMessage = error.error.message;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage
    });
  }

  /**
   * Cancel form and close dialog
   */
  onCancel(): void {
    this.resetForm();
    this.closeDialog.emit();
  }

  /**
   * Refreshes the services list
   */
  refreshServices(): void {
    this.serviceService.refreshServices();
  }

  /**
   * Lifecycle hook - component destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
