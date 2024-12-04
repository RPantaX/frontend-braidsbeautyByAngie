import { NgModule } from '@angular/core';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { HomeComponent } from './pages/home/home.component';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    Error404PageComponent,
    HomeComponent
  ],
  exports:[
    Error404PageComponent
  ],
  imports:[
    PrimeNgModule,
    CommonModule
  ]
})
export class SharedModule { }
