import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { NewCategoryPageComponent } from './new-page.component';

@NgModule({
  declarations: [
    NewCategoryPageComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ChipModule,
    InputTextModule,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    MultiSelectModule
  ],
  exports: [NewCategoryPageComponent],
  providers: [ConfirmationService, MessageService],
})
export class NewCategoryPageModule { }
