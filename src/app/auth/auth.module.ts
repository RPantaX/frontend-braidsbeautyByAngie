import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { MaterialModule } from '../material/material.module';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    LayoutPageComponent,
    RegisterPageComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PrimeNgModule,

    ReactiveFormsModule
  ]
})
export class AuthModule { }
