import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[appTemplateFollbak]' })
export class TemplateFollbackDirective {
  constructor(public templateRef: TemplateRef<unknown>) { }
}
