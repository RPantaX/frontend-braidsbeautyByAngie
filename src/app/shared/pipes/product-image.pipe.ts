import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productImage'
})
export class ProductImagePipe implements PipeTransform {

  transform(img: string): string {
    if(!img){
      return 'assets/no-image.png';
    }
    //if(product.productImage) return product.productImage;
    return img;
  }

}
