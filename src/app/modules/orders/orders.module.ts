import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { TimelineModule } from 'primeng/timeline';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { SkeletonModule } from 'primeng/skeleton';

// Shared Module
import { SharedModule } from '../../shared/shared.module';
import { OrderListComponent } from './pages/orders/orders-list.component';
import { OrderDetailComponent } from './pages/orders/search-page/order-detail.component';
import { OrderStatusComponent } from './pages/orders/components/app-order-status.component';
import { OrderFiltersComponent } from './pages/orders/components/app-order-filters.component';

// Components

const routes = [
  {
    path: '',
    component: OrderListComponent,
    title: 'Órdenes'
  },
  {
    path: ':id',
    component: OrderDetailComponent,
    title: 'Detalle de Orden'
  }
];

@NgModule({
  declarations: [
    OrderListComponent,
    OrderDetailComponent,
    OrderStatusComponent,
    OrderFiltersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // PrimeNG
    TableModule,
    CardModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
    ProgressSpinnerModule,
    TooltipModule,
    ConfirmDialogModule,
    PaginatorModule,
    DividerModule,
    ChipModule,
    TimelineModule,
    PanelModule,
    AccordionModule,
    TabViewModule,
    SkeletonModule,

    // Shared
    SharedModule
  ],
  exports: [
    OrderListComponent,
    OrderDetailComponent,
    OrderStatusComponent,
  ]
})
export class OrdersModule { }
