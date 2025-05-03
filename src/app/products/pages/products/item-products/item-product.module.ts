import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ItemProductPageComponent } from '../../itemProducts/item-product-page/item-product-page.component';
import { PipesModule } from '../../../../shared/pipes/pipes.module';

import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ListItemProductPageComponent } from './list-page/list-page.component';


@NgModule({
  declarations: [
    ListItemProductPageComponent,
    ItemProductPageComponent,
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
    TableModule,
    ReactiveFormsModule,
    PipesModule,
    ToastModule,
    DialogModule,
    RadioButtonModule,
    ConfirmDialogModule,
    FloatLabelModule,
  ],
  exports: [ListItemProductPageComponent, ItemProductPageComponent],
  providers: [ConfirmationService,MessageService],
})
export class ItemProductModule { }
