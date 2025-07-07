import { Component, Input, OnInit } from '@angular/core';
import { ResponseProduct } from '../../../../../../../../shared/models/products/product.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styles: ``
})
export class CardComponent implements OnInit{

  @Input()
  public product!: ResponseProduct;


  ngOnInit(): void {
    if ( !this.product ) throw Error('Product property is required');
  }

}
