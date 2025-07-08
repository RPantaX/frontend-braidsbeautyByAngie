import { Component, computed, effect, EventEmitter, inject, Input, Output, signal,  } from '@angular/core';
import { SaveProduct } from '../../../../../shared/models/products/product.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../../../../core/services/products/products.service';
import { MessageService } from 'primeng/api';
import { CategoryOption } from '../../../../../shared/models/categories/category.interface';
import { CategoryService } from '../../../../../core/services/products/category.service';

@Component({
  selector: 'app-new-product-page',
  templateUrl: './new-page.component.html',
  styles: ``
})
export class NewPageComponent {
      @Output() closeDialog = new EventEmitter<void>();
      @Output() refreshEntities = new EventEmitter<void>();
      @Output() dialogToDelete = new EventEmitter<void>();
      @Input() entity!: SaveProduct;
      @Input() productId!: number;
      @Input() entityDialog!:boolean;
        // Signals
      private readonly _isEditMode = signal<boolean>(false);
      private readonly _categories = signal<CategoryOption[]>([]);
      private readonly _isSubmitting = signal<boolean>(false);
      private readonly _productNameError = signal<string | null>(null);

        // Computed signals
      readonly isEditMode = computed(() => this._isEditMode());
      readonly categories = computed(() => this._categories());
      readonly isSubmitting = computed(() => this._isSubmitting());
      readonly productNameError = computed(() => this._productNameError());

      entidadService = inject(ProductsService);
      messageService = inject(MessageService);
      categoryService = inject(CategoryService);

      public entityForm = new FormGroup({
      productName: new FormControl<string>('', [
          Validators.required,
          Validators.maxLength(100)
        ]),
        productDescription: new FormControl<string>('', [
        Validators.maxLength(500)
        ]),
        productImage: new FormControl<string>(''),
        categoryId: new FormControl<number>(0, [Validators.required]),
        category: new FormControl<CategoryOption>({ productCategoryId: 0, productCategoryName: ''}),
      });

       constructor() {
    // Effect para manejar cambios en la entidad
      effect(() => {
      if (this.entity) {
        this.loadEntityData();
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });

    // Effect para limpiar el error del nombre cuando el usuario cambie el valor
    effect(() => {
      const nameControl = this.entityForm.get('productName');
      if (nameControl) {
        nameControl.valueChanges.subscribe(() => {
          if (this._productNameError()) {
            this._productNameError.set(null);
          }
        });
      }
    });
  }

        get currentEntity(): SaveProduct {
        const formValue = this.entityForm.value;
        return {
          productName: formValue.productName || '',
          productDescription: formValue.productDescription || '',
          productImage: formValue.productImage || '',
          productCategoryId: formValue.categoryId || 0
        } as SaveProduct;
  }

      ngOnInit(): void {
          this.loadCategories();
      }
        ngOnChanges(): void {
        if (this.entity) {
          this.loadEntityData();
        } else {
          this.resetForm();
        }
      }
      ngOnDestroy(): void {
        this.entityForm.reset();
      }
        private loadCategories(): void {
        this.categoryService.findAllCategories().subscribe({
          next: (categories) => {
            this._categories.set(categories);
          },
          error: (error) => {
            console.error('Error loading categories:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al cargar las categorías'
            });
          }
        });
      }

      private loadEntityData(): void {
        this._isEditMode.set(true);
        this.entityForm.patchValue(this.entity);
        this._productNameError.set(null); // Limpiar error al cargar datos
      }

      private resetForm(): void {
        this._isEditMode.set(false);
        this.entityForm.reset();
        this._productNameError.set(null);
      }

      onSubmit(): void {
        // Limpiar error previo del nombre
      this._productNameError.set(null);

      if (this.entityForm.invalid) {
        this.markFormGroupTouched();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor, complete los campos obligatorios y verifique que la información sea válida.'
        });
        return;
      }

      this._isSubmitting.set(true);
      const entity = this.currentEntity;

      const operation = this.isEditMode() && this.productId
        ? this.entidadService.updateProduct(this.productId, entity)
        : this.entidadService.createProduct(entity);

      operation.subscribe({
        next: () => {
          const message = this.isEditMode() ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente';
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message
          });
          this.refreshEntities.emit();
          this.closeDialog.emit();
          this.resetForm();
        },
        error: (error) => {
          this.handleError(error);
        },
        complete: () => {
          this._isSubmitting.set(false);
        }
      });
    }

      // Manejo del error
    private markFormGroupTouched(): void {
        Object.keys(this.entityForm.controls).forEach(key => {
          const control = this.entityForm.get(key);
          control?.markAsTouched();
        });
      }

    private handleError(error: any): void {
      console.error('Error en operación:', error);

      // Verificar si es el error específico de nombre duplicado
      if (error.status === 500 && error.error?.code === 'ERP00002') {
        // Establecer el error específico para el campo nombre
        this._productNameError.set(error.error.message || 'Ya existe un producto con este nombre');
        this._isSubmitting.set(false);
        // Marcar el campo como tocado para mostrar el error
        const nameControl = this.entityForm.get('productName');
        if (nameControl) {
          nameControl.markAsTouched();
        }
      } else {
        // Otros errores se manejan con el mensaje general
        const message = error.error?.message || 'Ocurrió un error inesperado. Intente nuevamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message
        });
      }
    }

        onCancel(): void {
    this.resetForm();
    this.closeDialog.emit();
  }

  // Método para obtener el error de un campo específico
  getFieldError(fieldName: string): string | null {
    const control = this.entityForm.get(fieldName);

    // Caso especial para el nombre del producto
    if (fieldName === 'productName' && this.productNameError()) {
      return this.productNameError();
    }

    if (control && control.errors && control.touched) {
      return this.getErrorMessage(fieldName, control.errors);
    }

    return null;
  }

  // Método para verificar si un campo es inválido
  isFieldInvalid(fieldName: string): boolean {
    const control = this.entityForm.get(fieldName);

    // Caso especial para el nombre del producto
    if (fieldName === 'productName' && this.productNameError()) {
      return true;
    }

    return !!(control && control.invalid && control.touched);
  }

  private getErrorMessage(fieldName: string, errors: any): string {
    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }
    if (errors['maxlength']) {
      return `${this.getFieldDisplayName(fieldName)} debe tener máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'productName': 'El nombre del producto',
      'productDescription': 'La descripción',
      'categoryId': 'La categoría'
    };
    return displayNames[fieldName] || fieldName;
  }
}
