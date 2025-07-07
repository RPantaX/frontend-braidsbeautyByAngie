import { ContentChild, Directive, EventEmitter, Input, Output } from "@angular/core";
import { ResponsePageableProducts, SaveProduct } from "../../../../shared/models/products/product.interface";
import { TemplateFollbackDirective } from "../../../../shared/directives/template-follback.directive";



@Directive({
  selector: '[ProductList]'
})
export abstract class ProductList {
  @Output() deleteProduct = new EventEmitter<SaveProduct>();
  @Output() selectedProduct = new EventEmitter<SaveProduct>();
  @Input() products!: ResponsePageableProducts;
  @ContentChild(TemplateFollbackDirective) contentChild: TemplateFollbackDirective | null = null;

}
