import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productImage'
})
export class ProductImagePipe implements PipeTransform {

  transform(img: String): string {
    if(!img){
      return 'assets/no-image.png';
    }
    //if(product.productImage) return product.productImage;
    return `assets/products/product-1.png`
  }

}
