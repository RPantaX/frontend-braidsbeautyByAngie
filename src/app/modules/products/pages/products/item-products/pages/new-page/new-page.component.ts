import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { tap } from 'rxjs';

import { ItemProductService } from '../../../../../../../core/services/products/items-products.service';
import { VariationService } from '../../../../../../../core/services/products/variation.service';
import { ItemProductSave } from '../../../../../../../shared/models/products/item-product.interface';
import { Variation, VariationOptionEntity } from '../../../../../../../shared/models/vatiations/variation.interface';

@Component({
  selector: 'item-product-new-page',
  templateUrl: './new-page.component.html',
  styleUrl: './new-page.component.css',
})
export class NewPageComponent {
  private fb = inject(FormBuilder);
  private idItemProduct!: number;
  idProduct!: number;

  isEditMode = false;
  variations = signal<Variation[]>([]);
  optionVariations = signal<VariationOptionEntity[]>([]);
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _skuError = signal<string | null>(null);

  // Computed signals
  readonly isSubmitting = () => this._isSubmitting();
  readonly skuError = () => this._skuError();

  entityForm: FormGroup = this.fb.group({
    productId: [0],
    productItemSKU: ['', [Validators.required, Validators.maxLength(100)]],
    productItemQuantityInStock: [0, [Validators.required, Validators.min(0)]],
    productItemImage: ['', [Validators.pattern('(https?://.*\\.(?:png|jpg|jpeg|gif))')]],
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
        console.log('errors: ', this.entityForm.errors);
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

  submit(): void {
    // Limpiar errores previos
    this._skuError.set(null);

    if (this.entityForm.invalid) {
      this.markFormGroupTouched();
      this.showMessage('error', 'Error', 'Por favor, complete los campos obligatorios y verifique que la información sea válida.');
      return;
    }
    this._isSubmitting.set(true);
    const entity = {
      productId: this.entityForm.get('productId')?.value,
      productItemSKU: this.entityForm.get('productItemSKU')?.value,
      productItemQuantityInStock: this.entityForm.get('productItemQuantityInStock')?.value,
      productItemImage: this.entityForm.get('productItemImage')?.value,
      productItemPrice: this.entityForm.get('productItemPrice')?.value,
      requestVariations: this.variationsArray.value
    } as ItemProductSave;
    console.log('entity: ', entity);
    console.log('isEditMode:' ,this.isEditMode)
    const operation = this.isEditMode
      ? this.entidadService.updateItemProduct(this.idItemProduct, entity)
      : this.entidadService.saveItemProduct(entity);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Entidad actualizada' : 'Entidad creada';
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
    this._isSubmitting.set(false); // ✅ Establecer aquí también por seguridad
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/products/manage/edit/', this.idProduct]);
    });
  }

    private handleError(error: any): void {
    console.error('Error en operación:', error);

    // Verificar si es el error específico de SKU duplicado
    if (error.status === 500 && error.error?.code === 'ERI00002') {
      // Establecer el error específico para el campo SKU
      this._skuError.set(error.error.message || 'Ya existe un item con este SKU');

      // Marcar el campo como tocado para mostrar el error
      const skuControl = this.entityForm.get('productItemSKU');
      if (skuControl) {
        skuControl.markAsTouched();
      }
    } else {
      // Otros errores se manejan con el mensaje general
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

  // Método mejorado para verificar si un campo es inválido
  isInvalid(controlName: string): boolean {
    const control = this.entityForm.get(controlName);

    // Caso especial para el SKU del producto
    if (controlName === 'productItemSKU' && this.skuError()) {
      return true;
    }

    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Método para obtener el error específico de un campo
getFieldError(fieldName: string): string | null {
  const control = this.entityForm.get(fieldName);

  // Caso especial para el SKU del producto
  if (fieldName === 'productItemSKU' && this.skuError()) {
    return this.skuError(); // ✅ Solo retornar el error, no modificar signals
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
