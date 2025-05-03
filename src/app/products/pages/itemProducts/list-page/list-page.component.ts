import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ItemProductList } from '../item-product-list';
import { ResponseProductItemDetail } from '../../../interfaces/product.interface';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ItemProductService } from '../../../services/products/items-products.service';
import { Router } from '@angular/router';

@Component({
  selector: 'item-product-list-page',
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.css',
})
export class ListItemProductPageComponent extends ItemProductList {

   constructor(
    private confirmationService: ConfirmationService,
    private itemProductService: ItemProductService,
    private messageService: MessageService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
   ) {
    super();
   }
   onDeleteItemProduct(item:ResponseProductItemDetail ): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar el item con el SKU: "${item.productItemSKU}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.itemProductService.deleteItemproduct(item.productItemId).subscribe(
          () => {
            this.items = this.items.filter(i => i.productItemId !== item.productItemId);
            this._changeDetectorRef.detectChanges();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Entidad eliminada correctamente.',
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ocurrió un error al eliminar la entidad.',
            });
          }
        );
      },
    });
  }

}
