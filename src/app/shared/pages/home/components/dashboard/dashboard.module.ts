import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

// Dashboard Components
import { DashboardComponent } from './dashboard.component';

// Services
import { MessageService } from 'primeng/api';
import { PipesModule } from '../../../../pipes/pipes.module';
import { DashboardRoutingModule } from './dashboard.module.routing';

// Shared Modules

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,

    // PrimeNG
    ButtonModule,
    CardModule,
    ChartModule,
    DropdownModule,
    CalendarModule,
    SkeletonModule,
    ProgressSpinnerModule,
    TagModule,
    ToastModule,
    TooltipModule,

    // Shared
    PipesModule
  ],
  providers: [
    MessageService
  ]
})
export class DashboardModule { }
