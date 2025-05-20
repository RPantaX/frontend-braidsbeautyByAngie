import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { NewPromotionPageComponent } from './new-page.component';

@NgModule({
  declarations: [
    NewPromotionPageComponent
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
    MultiSelectModule,
    CalendarModule
  ],
  exports: [NewPromotionPageComponent],
  providers: [ConfirmationService, MessageService],
})
export class NewPromotionPageModule { }
