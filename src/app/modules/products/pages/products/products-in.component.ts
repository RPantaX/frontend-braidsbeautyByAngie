import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { ResponsePageableProducts, SaveProduct } from '../../interfaces/product.interface';

@Component({
  selector: 'app-products-in-page',
  templateUrl: 'products-in.component.html'
})

export class ProductInComponent implements OnInit {
  productDialog: boolean = false;
  products!: ResponsePageableProducts;

  productsService = inject(ProductsService);

  constructor() { }

  ngOnInit(): void {
    this.loadPageableProducts();
  }
  openNew() {
    this.productDialog = true;
  }
  hideDialog() {
    this.productDialog = false;
  }
  onCreateProduct() {
    this.productDialog = true;
  }

  reloadProducts() {
    this.loadPageableProducts();
  }
  loadPageableProducts(): void {
    this.productsService.getPageableProducts()
    .subscribe( (products) => {
      console.log(products.responseProductList);
      this.products=products});
  }
}
