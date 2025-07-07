import { ContentChild, Directive,EventEmitter, Input, Output } from '@angular/core';
import { ResponseProductItemDetail } from '../../../../../shared/models/products/product.interface';
import { TemplateFollbackDirective } from '../../../../../shared/directives/template-follback.directive';

@Directive({
  selector: '[itemProductList]' // <-- puedes poner cualquier selector aquí si quieres
})
export abstract class ItemProductList {
  @Input() items: ResponseProductItemDetail[] = [];
  @Input() productId: number = 0;
  @ContentChild(TemplateFollbackDirective) contentChild: TemplateFollbackDirective | null = null;

}
