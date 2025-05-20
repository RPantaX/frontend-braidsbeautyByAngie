import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
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
import { DropdownModule } from 'primeng/dropdown';
import { NewPageComponent } from './new-page.component';
import { PipesModule } from '../../../../../shared/pipes/pipes.module';

@NgModule({
  declarations: [
    NewPageComponent
  ],
  imports: [
    CommonModule,
    MenuModule,
    ButtonModule,
    CardModule,
    FieldsetModule,
    PanelModule,
    MenubarModule,
    ToolbarModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    InputTextModule,
    RippleModule,
    SidebarModule,
    StyleClassModule,
    ChipModule,
    DividerModule,
    ProgressSpinnerModule,
    DropdownModule,
    TableModule,
    ReactiveFormsModule,
    PipesModule,
    ToastModule,
    DialogModule,
    RadioButtonModule,
    ConfirmDialogModule,
    FloatLabelModule,
  ],
  exports: [NewPageComponent],
  providers: [ConfirmationService,MessageService],
})
export class NewProductPageModule { }
