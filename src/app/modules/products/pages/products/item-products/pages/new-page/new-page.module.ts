import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule } from 'primeng/sidebar';
import { StyleClassModule } from 'primeng/styleclass';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { NewPageComponent } from './new-page.component';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from '../../../../../../../shared/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: NewPageComponent,
  },
];
@NgModule({
  declarations: [
    NewPageComponent
  ],
  imports: [
    CommonModule,
    InputTextModule,
    RippleModule,
    SidebarModule,
    StyleClassModule,
    ChipModule,
    DividerModule,
    ProgressSpinnerModule,
    TableModule,
    ReactiveFormsModule,
    PipesModule,
    ToastModule,
    DialogModule,
    RadioButtonModule,
    ConfirmDialogModule,
    FloatLabelModule,
    DropdownModule,

    RouterModule.forChild(routes),
  ],
  exports: [NewPageComponent],
  providers: [MessageService],
})
export class NewItemProductModule { }
