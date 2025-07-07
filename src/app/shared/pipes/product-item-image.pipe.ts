import { Pipe, PipeTransform } from '@angular/core';
import { ResponseProductItemDetail } from '../models/products/product.interface';

@Pipe({
  name: 'productItemImage'
})
export class ProductItemImagePipe implements PipeTransform {

  transform(itemProduct : ResponseProductItemDetail): string {
    if(!itemProduct.productItemImage) return 'assets/no-image.png';

    //if(itemProduct.productItemImage) return itemProduct.productItemImage;

    return `assets/products/product-1.png`

  }

}
