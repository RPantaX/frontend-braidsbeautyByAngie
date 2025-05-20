import { Component, EventEmitter, Input, Output, OnInit, OnChanges, OnDestroy, SimpleChanges, input, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PromotionService } from '../../../services/promotion.service';
import { CategoryOption } from '../../../../../shared/models/categories/category.interface';
import { PromotionDTO } from '../../../../../shared/models/promotions/promotion.interface';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-new-promotion-page',
  templateUrl: './new-page.component.html',
  styleUrls: ['./new-page.component.scss']
})
export class NewPromotionPageComponent implements OnInit, OnChanges, OnDestroy {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() refreshEntities = new EventEmitter<void>();
  entity = input.required<PromotionDTO | null>();
  promotionId = input.required<number>();

  isEditMode: boolean = false;
  isSubmitting: boolean = false;

  // Form group declaration using FormBuilder for cleaner code
  entityForm: FormGroup;

  // Subject for cleaning up subscriptions
  private destroy$ = new Subject<void>();

  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  promotionService = inject(PromotionService);
  constructor() {
    // Initialize form with FormBuilder
    this.entityForm = this.initializeForm();
  }

  /**
   * Initialize form with default values and validators
   */
  private initializeForm(): FormGroup {
    return this.fb.group({
      promotionName: ['', [Validators.required, Validators.maxLength(100)]],
      promotionDescription: [''],
      promotionDiscountRate: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
      promotionStartDate: [new Date()],
      promotionEndDate: [new Date()],
      productCategoryIds: [[]]
    });
  }

  /**
   * Lifecycle hook - component initialization
   */
  ngOnInit(): void {

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
    // Format dates if they're strings
    const formattedEntity = {
      ...entity,
      promotionStartDate: entity.promotionStartDate instanceof Date ?
        entity.promotionStartDate : new Date(entity.promotionStartDate),
      promotionEndDate: entity.promotionEndDate instanceof Date ?
        entity.promotionEndDate : new Date(entity.promotionEndDate)
    };

    this.entityForm.patchValue(formattedEntity);

  }

  /**
   * Reset form to default values
   */
  private resetForm(): void {
    this.entityForm.reset({
      promotionDiscountRate: 0,
      promotionStartDate: new Date(),
      promotionEndDate: new Date(),
    });
    this.isEditMode = false;
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
        detail: 'Por favor, complete los campos obligatorios correctamente'
      });
      return;
    }

    const promotion = this.entityForm.value as PromotionDTO;
    this.isSubmitting = true;

    if (this.isEditMode && this.promotionId) {
      this.updatePromotion(this.promotionId(), promotion);
    } else {
      this.createPromotion(promotion);
    }
  }

  /**
   * Create a new promotion
   */
  private createPromotion(promotion: PromotionDTO): void {
    this.promotionService.createPromotion(promotion)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Promoción creada correctamente'
          });
          this.refreshEntities.emit();
          this.closeDialog.emit();
          this.resetForm();
          this.refreshPromotions();
        },
        error: (error) => this.handleError(error)
      });
  }

  /**
   * Update an existing promotion
   */
  private updatePromotion(id: number, promotion: PromotionDTO): void {
    this.promotionService.updatePromotion(id, promotion)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Promoción actualizada correctamente'
          });
          this.refreshEntities.emit();
          this.closeDialog.emit();
          this.resetForm();
          this.refreshPromotions();
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
   * Refreshes the promotions list
   */
    refreshPromotions(): void {
      this.promotionService.refreshPromotions();
    }
}
