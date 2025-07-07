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

  constructor(
  ) {}

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
    if (this.entityForm.invalid) {
      this.showMessage('error', 'Error', 'Por favor, complete los campos obligatorios y verifique que la información sea válida.');
      return;
    }

    const entity = this.entityForm.value as ItemProductSave;

    if (this.isEditMode) {
      this.entidadService.updateItemProduct(this.idItemProduct, entity).subscribe({
        next: () => this.handleSuccess('Entidad actualizada'),
        error: (error) => this.handleError(error),
      });
    } else {
      this.entidadService.saveItemProduct(entity).subscribe({
        next: () => this.handleSuccess('Entidad creada'),
        error: (error) => this.handleError(error),
      });
    }
  }

  private handleSuccess(message: string): void {
    this.showMessage('success', 'Éxito', message);
    this.entityForm.reset();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/products/manage/edit/', this.idProduct]);
    });
  }

  private handleError(error: any): void {
    const message = error?.status === 406
      ? error.error.message || 'Error en la solicitud'
      : 'Ocurrió un error inesperado. Intente nuevamente.';
    this.showMessage('error', 'Error', message);
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  isInvalid(controlName: string): boolean {
    const control = this.entityForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private getVariationList(): void {
    this.variatonService.getVariationList().subscribe(response => {
      this.variations.set(response);
    });
  }
}
