import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { tap } from 'rxjs';

import { ItemProductService } from '../../../../../../../core/services/products/items-products.service';
import { VariationService } from '../../../../../../../core/services/products/variation.service';
import { ItemProductSave, ItemProductFormData } from '../../../../../../../shared/models/products/item-product.interface';
import { Variation, VariationOptionEntity } from '../../../../../../../shared/models/vatiations/variation.interface';

@Component({
  selector: 'item-product-new-page',
  templateUrl: './new-page.component.html',
  styleUrl: './new-page.component.scss',
})
export class NewPageComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private idItemProduct!: number;
  idProduct!: number;

  isEditMode = false;
  variations = signal<Variation[]>([]);
  optionVariations = signal<VariationOptionEntity[]>([]);

  // Signals para manejo de imágenes
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _skuError = signal<string | null>(null);
  private readonly _selectedFile = signal<File | null>(null);
  private readonly _imagePreview = signal<string | null>(null);
  private readonly _hasImageChanged = signal<boolean>(false);
  private readonly _shouldDeleteImage = signal<boolean>(false);
  private readonly _originalImageUrl = signal<string | null>(null);

  // Computed signals
  readonly isSubmitting = () => this._isSubmitting();
  readonly skuError = () => this._skuError();
  readonly selectedFile = () => this._selectedFile();
  readonly imagePreview = () => this._imagePreview();
  readonly hasImageChanged = () => this._hasImageChanged();
  readonly shouldDeleteImage = () => this._shouldDeleteImage();

  entityForm: FormGroup = this.fb.group({
    productId: [0],
    productItemSKU: ['', [Validators.required, Validators.maxLength(100)]],
    productItemQuantityInStock: [0, [Validators.required, Validators.min(0)]],
    productItemImage: [''],
    productItemPrice: [0, [Validators.required, Validators.min(0.01)]],
    requestVariations: this.fb.array([], Validators.minLength(1)),
    variationName: [''],
    variationOptionValue: [''],
  });

  entidadService = inject(ItemProductService);
  variatonService = inject(VariationService);
  messageService = inject(MessageService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  constructor() {
    // Limpiar error de SKU cuando el usuario modifique el campo
    this.entityForm.get('productItemSKU')?.valueChanges.subscribe(() => {
      if (this._skuError()) {
        this._skuError.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.loadRouteParams();
    this.getVariationList();
    this.listenVariationNameChanges();
  }

  ngOnDestroy(): void {
    this.entityForm.reset();
    this.resetImageState();
  }

  get variationsArray(): FormArray {
    return this.entityForm.get('requestVariations') as FormArray;
  }

  private loadRouteParams(): void {
    this.idItemProduct = Number(this.route.snapshot.paramMap.get('idItemProduct'));
    this.idProduct = Number(this.route.snapshot.paramMap.get('id'));

    if (this.idItemProduct && this.idProduct) {
      this.isEditMode = true;
      this.entidadService.getListItemProductById(this.idItemProduct).subscribe(item => {
        this.entityForm.patchValue(item);
        this.entityForm.get('productId')?.setValue(this.idProduct);
        this.populateVariationsArray(item.variations || []);

        // Manejar imagen existente
        if (item.productItemImage) {
          this._originalImageUrl.set(item.productItemImage);
          this._imagePreview.set(item.productItemImage);
        }
        this.resetImageState();
      });
    } else {
      this.entityForm.get('productId')?.setValue(this.idProduct);
    }
  }

  private populateVariationsArray(variations: any[]): void {
    this.variationsArray.clear();
    variations.forEach(v => {
      this.variationsArray.push(this.fb.group({
        variationName: [v.variationName, Validators.required],
        variationOptionValue: [v.options, Validators.required],
      }));
    });
  }

  private listenVariationNameChanges(): void {
    this.entityForm.get('variationName')!.valueChanges.pipe(
      tap(() => {
        this.entityForm.get('variationOptionValue')!.setValue('');
        this.optionVariations.set([]);
      }),
      tap((variationName) => {
        const selectedVariation = this.variations().find(v => v.variationName === variationName);
        if (selectedVariation) {
          this.optionVariations.set(selectedVariation.variationOptionEntities);
        }
      })
    ).subscribe();
  }

  // ============ MÉTODOS DE MANEJO DE IMÁGENES ============

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
    if (this.isEditMode && this._originalImageUrl()) {
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
    if (this.isEditMode && this._originalImageUrl()) {
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

  private resetImageState(): void {
    this._selectedFile.set(null);
    this._hasImageChanged.set(false);
    this._shouldDeleteImage.set(false);

    if (!this.isEditMode) {
      this._imagePreview.set(null);
      this._originalImageUrl.set(null);
    }

    // Resetear el input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
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

  // ============ MÉTODOS DE VARIACIONES ============

  addToVariation(): void {
    const name = this.entityForm.get('variationName')?.value;
    const option = this.entityForm.get('variationOptionValue')?.value;
    if (!name || !option) return;

    const variationGroup = this.fb.group({
      variationName: [name, Validators.required],
      variationOptionValue: [option, Validators.required],
    });

    this.variationsArray.push(variationGroup);
    this.entityForm.get('variationName')?.reset();
    this.entityForm.get('variationOptionValue')?.reset();
  }

  deleteVariation(index: number): void {
    this.variationsArray.removeAt(index);
  }

  // ============ SUBMIT Y VALIDACIONES ============

  submit(): void {
    // Limpiar errores previos
    this._skuError.set(null);

    if (this.entityForm.invalid) {
      this.markFormGroupTouched();
      this.showMessage('error', 'Error', 'Por favor, complete los campos obligatorios y verifique que la información sea válida.');
      return;
    }

    this._isSubmitting.set(true);

    const formData: ItemProductFormData = {
      productId: this.entityForm.get('productId')?.value,
      productItemSKU: this.entityForm.get('productItemSKU')?.value,
      productItemQuantityInStock: this.entityForm.get('productItemQuantityInStock')?.value,
      productItemPrice: this.entityForm.get('productItemPrice')?.value,
      requestVariations: this.variationsArray.value
    };
    // Manejar imagen según el estado
    if (this.shouldDeleteImage()) {
      formData.deleteFile = true;
    } else if (this.selectedFile()) {
      formData.imagen = this.selectedFile()!;
    }

    const operation = this.isEditMode
      ? this.entidadService.updateItemProduct(this.idItemProduct, formData)
      : this.entidadService.saveItemProduct(formData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Item de producto actualizado' : 'Item de producto creado';
        this.handleSuccess(message);
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

    // También marcar los controles del FormArray
    this.variationsArray.controls.forEach(group => {
      Object.keys((group as FormGroup).controls).forEach(key => {
        const control = group.get(key);
        control?.markAsTouched();
      });
    });
  }

  private handleSuccess(message: string): void {
    this.showMessage('success', 'Éxito', message);
    this.entityForm.reset();
    this.resetImageState();
    this._isSubmitting.set(false);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/products/manage/edit/', this.idProduct]);
    });
  }

  private handleError(error: any): void {
    console.error('Error en operación:', error);

    // Verificar si es el error específico de SKU duplicado
    if (error.status === 500 && error.error?.code === 'ERI00002') {
      this._skuError.set(error.error.message || 'Ya existe un item con este SKU');
      const skuControl = this.entityForm.get('productItemSKU');
      if (skuControl) {
        skuControl.markAsTouched();
      }
    } else {
      const message = error.status === 406
        ? error.error?.message || 'Error en la solicitud'
        : 'Ocurrió un error inesperado. Intente nuevamente.';

      this.showMessage('error', 'Error', message);
    }
    this._isSubmitting.set(false);
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  // ============ VALIDACIONES Y ERRORES ============

  isInvalid(controlName: string): boolean {
    const control = this.entityForm.get(controlName);

    // Caso especial para el SKU del producto
    if (controlName === 'productItemSKU' && this.skuError()) {
      return true;
    }

    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: string): string | null {
    const control = this.entityForm.get(fieldName);

    // Caso especial para el SKU del producto
    if (fieldName === 'productItemSKU' && this.skuError()) {
      return this.skuError();
    }

    if (control && control.errors && (control.dirty || control.touched)) {
      return this.getErrorMessage(fieldName, control.errors);
    }

    return null;
  }

  private getErrorMessage(fieldName: string, errors: any): string {
    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }
    if (errors['maxlength']) {
      return `${this.getFieldDisplayName(fieldName)} debe tener máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['min']) {
      return `${this.getFieldDisplayName(fieldName)} debe ser mayor a ${errors['min'].min}`;
    }
    if (errors['pattern']) {
      return `${this.getFieldDisplayName(fieldName)} no tiene un formato válido`;
    }
    if (errors['minlength']) {
      return `Debe agregar al menos una variación`;
    }
    return 'Campo inválido';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'productItemSKU': 'El SKU',
      'productItemQuantityInStock': 'La cantidad en stock',
      'productItemPrice': 'El precio',
      'productItemImage': 'La imagen',
      'requestVariations': 'Las variaciones'
    };
    return displayNames[fieldName] || fieldName;
  }

  private getVariationList(): void {
    this.variatonService.getVariationList().subscribe(response => {
      this.variations.set(response);
    });
  }
}
