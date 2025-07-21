import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para el layout switcher

// Tu componente
import { ProductInComponent } from './products-in.component';

// Módulos de PrimeNG
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Tus otros módulos
import { PipesModule } from '../../../../shared/pipes/pipes.module';
import { NewProductPageModule } from './new-page/new-page.module';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChipModule } from 'primeng/chip';

const routes: Routes = [
  {
    path: '',
    component: ProductInComponent,
  }
];

@NgModule({
  declarations: [
    ProductInComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    PipesModule,
    NewProductPageModule,

    // PrimeNG
    DataViewModule,
    ButtonModule,
    TagModule,
    ChipModule,
    DividerModule,
    ProgressSpinnerModule,
    DialogModule,
    ConfirmDialogModule,
    SelectButtonModule
  ]
})
export class ProductsInModule { }
