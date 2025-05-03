import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ProductImagePipe } from './product-image.pipe';
import { ProductItemImagePipe } from './product-item-image.pipe';
import { CurrencySolesPipe } from './currencySoles.pipe';

@NgModule({
  declarations: [ProductImagePipe, ProductItemImagePipe, CurrencySolesPipe],
  imports: [CommonModule],
  exports: [ProductImagePipe, ProductItemImagePipe, CurrencySolesPipe],

})
export class PipesModule { }
