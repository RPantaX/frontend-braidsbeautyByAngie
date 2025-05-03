import { NgModule } from '@angular/core';
import { TemplateFollbackDirective } from './template-follback.directive';

@NgModule({
  declarations: [TemplateFollbackDirective],
  exports: [TemplateFollbackDirective],
})
export class DirectivesModule { }
