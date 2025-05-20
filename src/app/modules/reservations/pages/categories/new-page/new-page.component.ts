import { Component, EventEmitter, Input, Output, OnInit, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ResponseCategory, CategoryRegister } from '../../../../../shared/models/categories/category.interface';
import { PromotionDTO } from '../../../../../shared/models/promotions/promotion.interface';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CategoryService } from '../../../../../core/services/reservations/category.service';

@Component({
  selector: 'app-new-category-page',
  templateUrl: './new-page.component.html',
  styleUrls: ['./new-page.component.scss']
})
export class NewCategoryPageComponent implements OnInit, OnChanges, OnDestroy {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() refreshEntities = new EventEmitter<void>();
  @Input() entity: ResponseCategory | null = null;
  @Input() categoryId: number = 0;
  @Input() promotions: PromotionDTO[] = [];

  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  selectedPromotions: number[] = [];

  // Form group declaration using FormBuilder for cleaner code
  entityForm: FormGroup;

  // Subject for cleaning up subscriptions
  private destroy$ = new Subject<void>();
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  categoryService = inject(CategoryService);
  constructor(
  ) {
    // Initialize form with FormBuilder
    this.entityForm = this.initializeForm();
  }

  /**
   * Initialize form with default values and validators
   */
  private initializeForm(): FormGroup {
    return this.fb.group({
      productCategoryName: ['', [Validators.required, Validators.maxLength(100)]],
      promotionListId: [[]]
    });
  }

  /**
   * Lifecycle hook - component initialization
   */
  ngOnInit(): void {
    // Additional initialization if needed
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
  private patchFormValues(entity: ResponseCategory): void {
    // Extract promotion IDs from the entity
    this.selectedPromotions = entity.promotionDTOList ?
      entity.promotionDTOList.map(promotion => promotion.promotionId) :
      [];

    // Patch form values
    this.entityForm.patchValue({
      productCategoryName: entity.productCategoryName,
      promotionListId: this.selectedPromotions
    });
  }

  /**
   * Reset form to default values
   */
  private resetForm(): void {
    this.entityForm.reset();
    this.selectedPromotions = [];
    this.isEditMode = false;
  }

  /**
   * Handle promotion selection change
   */
  onPromotionChange(event: any): void {
    this.selectedPromotions = event.value;
    this.entityForm.get('promotionListId')?.setValue(this.selectedPromotions);
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

    const category: CategoryRegister = {
      categoryName: this.entityForm.get('productCategoryName')?.value,
      promotionListId: this.entityForm.get('promotionListId')?.value || []
    };

    this.isSubmitting = true;

    if (this.isEditMode && this.categoryId) {
      this.updateCategory(this.categoryId, category);
    } else {
      this.createCategory(category);
    }
  }

  /**
   * Create a new category
   */
  private createCategory(category: CategoryRegister): void {
    this.categoryService.createCategory(category)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Categoría creada correctamente'
          });
          this.refreshEntities.emit();
          this.closeDialog.emit();
          this.resetForm();
          this.refreshCategories();
        },
        error: (error) => this.handleError(error)
      });
  }

  /**
   * Update an existing category
   */
  private updateCategory(id: number, category: CategoryRegister): void {
    this.categoryService.updateCategory(id, category)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Categoría actualizada correctamente'
          });
          this.refreshEntities.emit();
          this.closeDialog.emit();
          this.resetForm();
          this.refreshCategories();
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
   * Refreshes the categories list
   */
  refreshCategories(): void {
    this.categoryService.refreshCategories();
  }
  removePromotion(promotionId: number): void {
    this.selectedPromotions = this.selectedPromotions.filter(id => id !== promotionId);
    this.entityForm.get('promotionListId')?.setValue(this.selectedPromotions);
  }
}
