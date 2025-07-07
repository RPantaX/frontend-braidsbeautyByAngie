import { Component, inject, Input, OnInit } from '@angular/core';
import { ResponseProduct, ResponseProductItemDetail } from '../../../../../shared/models/products/product.interface';
import { ItemProductService } from '../../../../../core/services/products/items-products.service';
import { ProductsService } from '../../../../../core/services/products/products.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ItemProductSave } from '../../../../../shared/models/products/item-product.interface';

@Component({
  selector: 'app-item-product-page',
  templateUrl: 'item-product.component.html',
  styles: `.product-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .product-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 1rem;
  }

  .product-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
  }

  .product-details {
    flex: 1;
  }`
})

export class ItemProductComponent implements OnInit {
  @Input()
  product!: ResponseProduct;

  ngOnInit(): void {
    if ( !this.product ) throw Error('Product property is required');
  }
  public selectedItemProduct!: ItemProductSave;

  itemProductDialogDelete: boolean = false;

  itemProductService = inject(ItemProductService);
  productsService = inject(ProductsService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  constructor(){}

  openNew() {
  }
  openDialogDelete(){
    this.itemProductDialogDelete = true
  }
  editItemProductHandler(item: ResponseProductItemDetail) {
    console.log(item);
    this.selectedItemProduct = this.mapResponseProductItemDetailToItemProductSave(item);
  }
  reloadItemProducts() {
    this.productsService.getProductById(this.product.productId).subscribe((responseApi) => {
      this.product = responseApi;
    });
  }
  async deleteItemProductHandler(item: ResponseProductItemDetail): Promise<void> {
    console.log(item);
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar "${item.productItemId}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.itemProductService.deleteItemproduct(item.productItemId).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Entidad eliminada correctamente.',
            });
            this.reloadItemProducts(); // Notifica al padre que recargue los datos
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

  mapResponseProductItemDetailToItemProductSave(item: ResponseProductItemDetail): ItemProductSave {
    return {
      productId: 0,
      productItemSKU: item.productItemSKU,
      productItemQuantityInStock: item.productItemQuantityInStock,
      productItemImage: item.productItemImage,
      productItemPrice: item.productItemPrice,
      requestVariations: item.variations.map((variation) => ({
        variationName: variation.variationName,
        variationOptionValue: variation.options
      }))
    };
  }
}
