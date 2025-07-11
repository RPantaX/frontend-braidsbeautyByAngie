import { Component, computed, effect, ElementRef, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { SaveProduct } from '../../../../../shared/models/products/product.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../../../../core/services/products/products.service';
import { MessageService } from 'primeng/api';
import { CategoryOption } from '../../../../../shared/models/categories/category.interface';
import { CategoryService } from '../../../../../core/services/products/category.service';

@Component({
  selector: 'app-new-product-page',
  templateUrl: './new-page.component.html',
  styleUrl: './new-page.component.scss',
})
export class NewPageComponent {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() refreshEntities = new EventEmitter<void>();
  @Output() dialogToDelete = new EventEmitter<void>();
  @Input() entity!: SaveProduct;
  @Input() productId!: number;
  @Input() entityDialog!: boolean;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Signals
  private readonly _isEditMode = signal<boolean>(false);
  private readonly _categories = signal<CategoryOption[]>([]);
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _productNameError = signal<string | null>(null);
  private readonly _selectedFile = signal<File | null>(null);
  private readonly _imagePreview = signal<string | null>(null);
  private readonly _hasImageChanged = signal<boolean>(false);
  private readonly _shouldDeleteImage = signal<boolean>(false);
  private readonly _originalImageUrl = signal<string | null>(null);

  // Computed signals
  readonly isEditMode = computed(() => this._isEditMode());
  readonly categories = computed(() => this._categories());
  readonly isSubmitting = computed(() => this._isSubmitting());
  readonly productNameError = computed(() => this._productNameError());
  readonly selectedFile = computed(() => this._selectedFile());
  readonly imagePreview = computed(() => this._imagePreview());
  readonly hasImageChanged = computed(() => this._hasImageChanged());
  readonly shouldDeleteImage = computed(() => this._shouldDeleteImage());

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
    categoryId: new FormControl<number>(0, [Validators.required]),
    category: new FormControl<CategoryOption>({ productCategoryId: 0, productCategoryName: '' }),
  });

  constructor() {
    // Effect para manejar cambios en la entidad
    effect(() => {
      if (this.entity && this.productId) {
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
    this.resetImageState();
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

    // Cargar datos del formulario
    const { imagen, deleteFile, ...restOfEntity } = this.entity;
    this.entityForm.patchValue(restOfEntity);

    // Manejar imagen existente
    if (imagen) {
      this._originalImageUrl.set(imagen);
      this._imagePreview.set(imagen);
    }

    this.resetImageState();
    this._productNameError.set(null);
  }

  private resetForm(): void {
    this._isEditMode.set(false);
    this.entityForm.reset();
    this.resetImageState();
    this._productNameError.set(null);
  }

  private resetImageState(): void {
    this._selectedFile.set(null);
    this._hasImageChanged.set(false);
    this._shouldDeleteImage.set(false);

    if (!this.isEditMode()) {
      this._imagePreview.set(null);
      this._originalImageUrl.set(null);
    }

    // Resetear el input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validation = this.validateImageFile(file);

      if (!validation.isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo inválido',
          detail: validation.error
        });
        this.resetImageSelection();
        return;
      }

      this._selectedFile.set(file);
      this._hasImageChanged.set(true);
      this._shouldDeleteImage.set(false);

      // Generar previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this._imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    if (this.isEditMode() && this._originalImageUrl()) {
      // En modo edición, marcar para eliminar
      this._shouldDeleteImage.set(true);
      this._hasImageChanged.set(true);
    }

    this._selectedFile.set(null);
    this._imagePreview.set(null);

    // Resetear el input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private resetImageSelection(): void {
    this._selectedFile.set(null);

    // Restaurar la imagen original si estamos en modo edición
    if (this.isEditMode() && this._originalImageUrl()) {
      this._imagePreview.set(this._originalImageUrl());
      this._hasImageChanged.set(false);
      this._shouldDeleteImage.set(false);
    } else {
      this._imagePreview.set(null);
    }

    // Resetear el input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
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

    const formData = new FormData();
    formData.append('productName', this.entityForm.get('productName')?.value || '');
    formData.append('productDescription', this.entityForm.get('productDescription')?.value || '');
    formData.append('productCategoryId', this.entityForm.get('categoryId')?.value?.toString() || '');

    // Manejar imagen según el estado
    if (this.shouldDeleteImage()) {
      formData.append('deleteFile', 'true');
    } else if (this.selectedFile()) {
      formData.append('imagen', this.selectedFile()!);
    }

    const action = this.isEditMode()
      ? this.entidadService.updateProduct(this.productId, formData)
      : this.entidadService.createProduct(formData);

    action.subscribe({
      next: () => {
        const message = this.isEditMode() ? 'Producto actualizado' : 'Producto creado';
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${message} exitosamente`
        });
        this.refreshEntities.emit();
        this.closeDialog.emit();
        this.resetForm();
      },
      error: (error) => this.handleError(error),
      complete: () => this._isSubmitting.set(false)
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.entityForm.controls).forEach(key => {
      const control = this.entityForm.get(key);
      control?.markAsTouched();
    });
  }

  private handleError(error: any): void {
    console.error('Error en operación:', error);

    if (error.status === 500 && error.error?.code === 'ERP00002') {
      this._productNameError.set(error.error.message || 'Ya existe un producto con este nombre');
      this._isSubmitting.set(false);

      const nameControl = this.entityForm.get('productName');
      if (nameControl) {
        nameControl.markAsTouched();
      }
    } else {
      this._isSubmitting.set(false);
      const message = error.error?.message || 'Ocurrió un error inesperado. Intente nuevamente.';
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: message
      });
    }
  }

  onCancel(): void {
    this.closeDialog.emit();
    this.resetForm();
  }

  getFieldError(fieldName: string): string | null {
    const control = this.entityForm.get(fieldName);

    if (fieldName === 'productName' && this.productNameError()) {
      return this.productNameError();
    }

    if (control && control.errors && control.touched) {
      return this.getErrorMessage(fieldName, control.errors);
    }

    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.entityForm.get(fieldName);

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

  private validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Formato de archivo no soportado. Use JPG, PNG, GIF o WebP.' };
    }
    if (file.size > maxSizeInBytes) {
      return { isValid: false, error: 'La imagen no debe exceder los 5MB.' };
    }
    return { isValid: true };
  }
}
