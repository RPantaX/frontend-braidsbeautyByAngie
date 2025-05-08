import { Component, EventEmitter, inject, Input, Output,  } from '@angular/core';
import { SaveProduct } from '../../../interfaces/product.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../../services/products.service';
import { MessageService } from 'primeng/api';
import { CategoryOption } from '../../../interfaces/categories/category.interface';
import { CategoryService } from '../../../services/category.service';

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
      isEditMode: boolean = false;
      public categories : CategoryOption[] = [];
      public entityForm = new FormGroup({
        productName: new FormControl<string>('', [
          Validators.required,
          Validators.maxLength(100)
        ]),
        productDescription: new FormControl<string>(''),
        productImage: new FormControl<string>(''),
        productCategoryId: new FormControl<number>(0,),
        category: new FormControl<CategoryOption>({ productCategoryId: 0, productCategoryName: ''}),
      });

      entidadService = inject(ProductsService);
      messageService = inject(MessageService);
      categoryService = inject(CategoryService);

      constructor(
      ){}

      get currentEntity(): SaveProduct{
        const entity = this.entityForm.value as SaveProduct;
        return entity;
      }

      ngOnInit(): void {
          this.categoryService.findAllCategories()
          .subscribe((categories) => {
            this.categories = categories;
          } );
      }
      ngOnChanges(): void {
        if (this.entity) {
          // Si hay datos en la entidad, los carga en el formulario
          this.entityForm.patchValue(this.entity);
          this.isEditMode = true;
        } else {
          // Si no hay datos, reinicia el formulario
          this.entityForm.reset();
          this.isEditMode = false;
        }
      }
      ngOnDestroy(): void {
        this.entityForm.reset();
      }
      onSubmit(): void {
        if (this.entityForm.invalid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete los campos obligatorios y verifique que la información sea válida.' });
          return;
        }

        const entity = this.entityForm.value as SaveProduct;

        if (this.productId) {
          // Modo edición
          this.entidadService.updateProduct(this.productId, entity).subscribe(
            () => {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entidad actualizada' });
              this.refreshEntities.emit();
              this.closeDialog.emit();
              this.isEditMode = false;
              this.entityForm.reset();
            },
            (error) => this.handleError(error) // Manejar errores
          );
          return;
        }
        // Modo creación
        this.entidadService.createProduct(entity).subscribe(
          () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entidad creada' });
            this.refreshEntities.emit();
            this.closeDialog.emit();
            this.entityForm.reset();
          },
          (error) => this.handleError(error) // Manejar errores
        );
      }

      // Manejo del error
      private handleError(error: any): void {
        if (error.status === 406) {
          const message = error.error.message || 'Error en la solicitud';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error inesperado. Intente nuevamente.' });
        }
      }

      onCancel(): void {
        this.isEditMode = false; // Cambiar a "modo creación"
        this.entityForm.reset(); // Restablecer el formulario
        this.closeDialog.emit(); // Emitir el evento de cierre
      }
}
