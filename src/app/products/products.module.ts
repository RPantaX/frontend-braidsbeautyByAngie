import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductPageComponent } from './pages/products/product-page/product-page.component';
import { LayoutPageComponent } from './pages/products/layout-page/layout-page.component';
import { SearchPageComponent } from './pages/products/search-page/search-page.component';
import { ListPageComponent } from './pages/products/list-page/list-page.component';
import { NewPageComponent } from './pages/products/new-page/new-page.component';
import { CategoryPageComponent } from './pages/categories/category-page/category-page.component';
import { ItemProductPageComponent } from './pages/itemProducts/item-product-page/item-product-page.component';


@NgModule({
  declarations: [
    ProductPageComponent,
    LayoutPageComponent,
    SearchPageComponent,
    ListPageComponent,
    NewPageComponent,
    CategoryPageComponent,
    ItemProductPageComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
  ]
})
export class ProductsModule { }
