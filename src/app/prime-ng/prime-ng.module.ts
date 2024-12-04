import { NgModule } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { MenuItem } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule } from 'primeng/sidebar';
import { StyleClassModule } from 'primeng/styleclass';
import { Sidebar } from 'primeng/sidebar';

@NgModule({
  exports: [
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
    StyleClassModule
  ]
})
export class PrimeNgModule { }
