import { Component, EventEmitter, Input, Output, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, input, signal, effect } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../../../../core/services/products/category.service';
import { ResponseCategory, CategoryRegister } from '../../../../../shared/models/categories/category.interface';
import { PromotionDTO } from '../../../../../shared/models/promotions/promotion.interface';
import { catchError, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject, timer } from 'rxjs';

@Component({
  selector: 'app-new-category-page',
  templateUrl: './new-page.component.html',
  styleUrls: ['./new-page.component.scss']
})
export class NewCategoryPageComponent implements OnInit, OnDestroy {
  // Entradas y salidas del componente
  @Output() closeDialog = new EventEmitter<void>();
  @Output() refreshEntities = new EventEmitter<void>();

  // Usamos input() para las propiedades de entrada (más moderno que @Input)
  entity = input<ResponseCategory | null>(null);
  categoryId = input<number>(0);
  promotions = input<PromotionDTO[]>([]);

  isEditMode = signal(false);
  isSubmitting = signal(false);
  selectedPromotions = signal<number[]>([]);

  // Subject for cleaning up subscriptions
  private destroy$ = new Subject<void>();
  // Inyección de dependencias

  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private categoryService = inject(CategoryService);

  // Form group declaration using FormBuilder for cleaner code
  entityForm: FormGroup;
   constructor() {
    this.entityForm = this.initializeForm();

    // Usamos effect() para reaccionar a cambios en el input `entity`
    effect(() => {
      const currentEntity = this.entity();
      if (currentEntity) {
        console.log('Current entity:', currentEntity);
        this.isEditMode.set(true);
        this.patchFormValues(currentEntity);
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });
  }

  /**
   * Inicializa el formulario con validadores síncronos y asíncronos.
   */
  private initializeForm(): FormGroup {
    return this.fb.group({
      productCategoryName: ['',
        {
          validators: [Validators.required, Validators.maxLength(100), Validators.minLength(2)],
          asyncValidators: [this.categoryNameValidator()], // ✅ Validador asíncrono
          updateOn: 'blur' // Opcional: valida solo cuando se pierde el foco
        }
      ],
      promotionListId: [[]]
    });
  }
  /**
   * Validador asíncrono para verificar si el nombre de la categoría ya existe.
   */
  private categoryNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const name = control.value;
      if (!name) {
        return of(null); // Si no hay valor, no validar
      }

      // Si estamos en modo edición y el nombre no ha cambiado, es válido.
      if (this.isEditMode() && name.toLowerCase() === this.entity()?.productCategoryName.toLowerCase()) {
        return of(null);
      }

      // Espera 500ms después de que el usuario deja de escribir para lanzar la petición
      return timer(500).pipe(
        switchMap(() =>
          this.categoryService.getCategoryByName(name).pipe(
            // Si el servicio encuentra una categoría, el nombre ya existe -> inválido
            map(response => (response ? { categoryExists: true } : null)),
            // Si el servicio retorna error (ej. 404, o tu error custom), significa que el nombre está disponible -> válido
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
    // Additional initialization if needed
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
    const promotionIds = entity.promotionDTOList ? entity.promotionDTOList.map(p => p.promotionId) : [];
    this.selectedPromotions.set(promotionIds);
    this.entityForm.patchValue({
      productCategoryName: entity.productCategoryName,
      promotionListId: promotionIds
    });
  }

  /**
   * Reset form to default values
   */
  private resetForm(): void {
    this.entityForm.reset({
        productCategoryName: '',
        promotionListId: []
    });
    this.selectedPromotions.set([]);
    this.isEditMode.set(false);
  }

  /**
   * Handle promotion selection change
   */
  onPromotionChange(event: any): void {
    const promotionIds = event.value;
    this.selectedPromotions.set(promotionIds);
    this.entityForm.get('promotionListId')?.setValue(promotionIds);
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

    this.isSubmitting.set(true);

    const category: CategoryRegister = {
      categoryName: this.entityForm.get('productCategoryName')?.value,
      promotionListId: this.entityForm.get('promotionListId')?.value || []
    };

    if (this.isEditMode() && this.categoryId()) {
      this.updateCategory(this.categoryId(), category);
    } else {
      this.createCategory(category);
    }
  }

  /**
   * Create a new category
   */
  private createCategory(category: CategoryRegister): void {
    this.categoryService.createCategory(category)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.handleSuccess('Categoría creada correctamente'),
        error: (err) => this.handleError(err)
      });
  }


  /**
   * Update an existing category
   */
  private updateCategory(id: number, category: CategoryRegister): void {
    this.categoryService.updateCategory(id, category)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.handleSuccess('Categoría actualizada correctamente'),
        error: (err) => this.handleError(err)
      });
  }

  /**
   * Maneja la respuesta exitosa de la API.
   */
  private handleSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail });
    this.refreshEntities.emit();
    this.closeDialog.emit();
    this.categoryService.refreshCategories();
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
    let errorMessage = 'Ocurrió un error inesperado. Intente nuevamente.';

    // ✅ Si el backend retorna el error de que ya existe, lo asignamos al input.
    if (error.error?.code === 'ERC00009') {
      errorMessage = 'Ya existe una categoría con este nombre.';
      this.entityForm.get('productCategoryName')?.setErrors({ categoryExists: true });
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
  }

  /**
   * Cancel form and close dialog
   */
  onCancel(): void {
    this.closeDialog.emit();
  }

  /**
   * Refreshes the categories list
   */
  refreshCategories(): void {
    this.categoryService.refreshCategories();
  }
   removePromotion(promotionId: number): void {
    const updatedPromos = this.selectedPromotions().filter(id => id !== promotionId);
    this.selectedPromotions.set(updatedPromos);
    this.entityForm.get('promotionListId')?.setValue(updatedPromos);
  }
}
