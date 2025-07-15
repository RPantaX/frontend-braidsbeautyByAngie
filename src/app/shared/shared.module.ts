import { NgModule } from '@angular/core';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { HomeComponent } from './pages/home/home.component';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { CommonModule } from '@angular/common';
import { LanguageComponent } from './pages/home/components/language/language.component';
import { TranslateModule } from '@ngx-translate/core';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { StyleClassModule } from 'primeng/styleclass';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
  declarations: [
    Error404PageComponent,
    HomeComponent
  ],
  exports:[
    Error404PageComponent,
    HomeComponent
  ],
  imports:[
    CommonModule,
    FormsModule,
    PrimeNgModule,
    TranslateModule,

    // PrimeNG Modules
    MenuModule,
    TooltipModule,
    StyleClassModule,
    ConfirmDialogModule,
    ToastModule,
    SidebarModule,
    ButtonModule,
    AvatarModule,
    RippleModule,
    BreadcrumbModule,
    InputTextModule,
    BadgeModule,

    // Standalone Components
    LanguageComponent,
    PipesModule
  ],
  providers: [
    MessageService,
    ConfirmationService   ]
})
export class SharedModule { }
