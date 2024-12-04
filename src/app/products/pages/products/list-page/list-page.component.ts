import { Component, OnInit } from '@angular/core';
import { ResponsePageableProducts } from '../../../interfaces/product.interface';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styles: ``
})
export class ListPageComponent implements OnInit{
  public products : ResponsePageableProducts = {
    "responseProductList": [],
    "pageNumber": 0,
    "pageSize": 0,
    "totalPages": 0,
    "totalElements": 0,
    "end": true
  };

  constructor(private productsService : ProductsService){}
  ngOnInit(): void {
    this.productsService.getPageableProducts()
    .subscribe( products => this.products=products);
  }
}
