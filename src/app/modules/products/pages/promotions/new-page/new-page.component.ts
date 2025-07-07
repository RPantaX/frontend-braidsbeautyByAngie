import { Component, EventEmitter, Input, Output, OnInit, OnChanges, OnDestroy, SimpleChanges, input, inject, signal, effect } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PromotionService } from '../../../../../core/services/products/promotion.service';
import { CategoryOption } from '../../../../../shared/models/categories/category.interface';
import { PromotionDTO } from '../../../../../shared/models/promotions/promotion.interface';
import { catchError, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject, timer } from 'rxjs';

@Component({
  selector: 'app-new-promotion-page',
  templateUrl: './new-page.component.html',
  styleUrls: ['./new-page.component.scss']
})
export class NewPromotionPageComponent implements OnInit, OnDestroy {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() refreshEntities = new EventEmitter<void>();

  entity = input<PromotionDTO | null>(null);
  promotionId = input<number | null>(null);

  isEditMode = signal(false);
  isSubmitting = signal(false);

  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  promotionService = inject(PromotionService);

  // Form group declaration using FormBuilder for cleaner code
  entityForm: FormGroup;

  // Subject for cleaning up subscriptions
  private destroy$ = new Subject<void>();

  constructor() {
    this.entityForm = this.initializeForm();

    // Reacciona a los cambios en la entidad de entrada para editar o resetear
    effect(() => {
      const currentEntity = this.entity();
      if (currentEntity) {
        this.isEditMode.set(true);
        this.patchFormValues(currentEntity);
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true }); // Permite modificar signals dentro del efecto
  }

  /**
   * Initialize form with default values and validators
   */
  private initializeForm(): FormGroup {
    return this.fb.group({
      promotionName: ['', {
        validators: [Validators.required, Validators.maxLength(100)],
        asyncValidators: [this.promotionNameValidator()], // ✅ Validador asíncrono
        updateOn: 'blur' // Valida al perder el foco para optimizar
      }],
      promotionDescription: [''],
      promotionDiscountRate: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
      promotionStartDate: [new Date()],
      promotionEndDate: [new Date()]
    });
  }
  private promotionNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const name = control.value;
      if (!name) {
        return of(null);
      }

      // Si estamos editando y el nombre no ha cambiado, es válido.
      if (this.isEditMode() && name.toLowerCase() === this.entity()?.promotionName.toLowerCase()) {
        return of(null);
      }

      // Espera 500ms antes de llamar a la API
      return timer(500).pipe(
        switchMap(() =>
          this.promotionService.getPromotionByName(name).pipe(
            // Si la API devuelve una promoción, el nombre ya existe -> inválido
            map(response => (response ? { promotionExists: true } : null)),
            // Si la API falla o no encuentra nada, el nombre está disponible -> válido
            catchError(() => of(null))
          )
        )
      );
    };
  }
  /**
   * Lifecycle hook - component initialization
   */
  ngOnInit(): void {

  }

  /**
   * Lifecycle hook - component destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
   * Patch form values from entity
   */
  private patchFormValues(entity: PromotionDTO): void {
    this.entityForm.patchValue({
      ...entity,
      promotionStartDate: entity.promotionStartDate ? new Date(entity.promotionStartDate) : new Date(),
      promotionEndDate: entity.promotionEndDate ? new Date(entity.promotionEndDate) : new Date(),
    });
  }

  /**
   * Reset form to default values
   */
  private resetForm(): void {
    this.entityForm.reset({
      promotionName: '',
      promotionDescription: '',
      promotionDiscountRate: 0,
      promotionStartDate: new Date(),
      promotionEndDate: new Date()
    });
    this.isEditMode.set(false);
  }

  /**
   * Handle category selection change
   */
  onCategoryChange(event: any): void {
    const selectedIds = event.value.map((cat: CategoryOption) => cat.productCategoryId);
    this.entityForm.get('productCategoryIds')?.setValue(selectedIds);
  }

  /**
   * Form submission handler
   */
  onSubmit(): void {
    if (this.entityForm.invalid) {
      this.markFormGroupTouched(this.entityForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete los campos obligatorios.'
      });
      return;
    }

    this.isSubmitting.set(true);
    const promotionData = this.entityForm.value;

    const action$ = this.isEditMode() && this.promotionId()
      ? this.promotionService.updatePromotion(this.promotionId()!, promotionData)
      : this.promotionService.createPromotion(promotionData);

    action$.pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => this.handleSuccess(this.isEditMode() ? 'actualizada' : 'creada'),
      error: (err) => this.handleError(err)
    });
  }
  private handleSuccess(action: 'creada' | 'actualizada'): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Promoción ${action} correctamente`
    });
    this.refreshEntities.emit();
    this.closeDialog.emit();
    this.promotionService.refreshPromotions();
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
    let errorMessage = 'Ocurrió un error inesperado.';

    // ✅ Lógica específica para el error de promoción duplicada
    if (error.error?.code === 'ERPN00023') {
      errorMessage = 'Ya existe una promoción con este nombre.';
      this.entityForm.get('promotionName')?.setErrors({ promotionExists: true });
    } else if (error.error?.message) {
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
   * Refreshes the promotions list
   */
    refreshPromotions(): void {
      this.promotionService.refreshPromotions();
    }
}
