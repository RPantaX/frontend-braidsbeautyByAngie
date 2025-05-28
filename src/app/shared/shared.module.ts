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
    CommonModule,
    TranslateModule,
    // PrimeNG Modules - NUEVOS REQUERIDOS
    MenuModule,           // ← Para p-menu
    TooltipModule,        // ← Para pTooltip
    StyleClassModule,     // ← Para pStyleClass

    // PrimeNG Modules - OPCIONALES pero recomendados
    ConfirmDialogModule,  // ← Para confirmaciones elegantes
    ToastModule,          // ← Para notificaciones
    LanguageComponent
  ],
  providers: [
    MessageService,
    ConfirmationService   ]
})
export class SharedModule { }
