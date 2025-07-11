import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductsService } from '../../../../../../core/services/products/products.service';
import { ResponseProduct, ResponseProductItemDetail, SaveProduct } from '../../../../../../shared/models/products/product.interface';

@Component({
  selector: 'product-edit-page',
  templateUrl: './edit-product-page.component.html',
  styleUrl: './edit-product-page.component.css',
})
export class EditProductPageComponent implements OnInit{

  public product! : ResponseProduct;
  productDialog: boolean = false;
  productDialogDelete: boolean = false;
  public selectedProduct!: SaveProduct;

  productService = inject(ProductsService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  constructor(
  ){}

  ngOnInit(): void {
    this.activatedRoute.params
    .pipe(
      switchMap(({id}) => this.productService.getProductById(id)),
    ).subscribe(product =>{
      if(!product) return this.router.navigate(['/products/manage']);
      this.product=product;
      return;
    })
  }
  openNew() {
    this.productDialog = true;
  }
  hideDialog() {
    this.productDialog = false;
  }
  openDialogDelete(){
    this.productDialogDelete = true
  }
  onUpdateProduct() {
    this.productDialog = true;
    this.selectedProduct = this.mapResponseProductoSaveProduct(this.product);
  }
  reloadItemProducts() {
    this.productService.getProductById(this.product.productId).subscribe((responseApi) => {
      this.product = responseApi;
    });
  }
  onDeleteProduct(): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar "${this.product.productName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProduct(this.product.productId).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Entidad eliminada correctamente.',
            });
            this.router.navigate(['/products/manage']);  // Notifica al padre que recargue los datos
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

  goBack():void{
    this.router.navigateByUrl('products/list')
  }
  mapResponseProductoSaveProduct(item: ResponseProduct): SaveProduct {
    return {
      productName: item.productName,
      productDescription: item.productDescription,
      productCategoryId: item.responseCategory.productCategoryId,
    };
  }
}
