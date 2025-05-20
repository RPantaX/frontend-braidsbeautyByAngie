import { Component } from '@angular/core';
import { ProductList } from '../../product-list';

@Component({
  selector: 'product-list-page',
  templateUrl: './list-page.component.html',
  styles: ``
})
export class ListPageComponent extends ProductList {

  constructor(){
    super();
  }

}
