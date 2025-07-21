// schedules.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { StepsModule } from 'primeng/steps';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';

import { SchedulesComponent } from './schedules.component';
import { SchedulesListComponent } from './list-page/schedules-list.component';
import { SchedulesRoutingModule } from './schedules.module.routing';
import { EmployeeScheduleDetailComponent } from './search-page/employee-schedule-detail.component';
import { ConfirmationComponent } from './create-schedule/steps/confirmation/confirmation.component';
import { SelectDateTimeComponent } from './create-schedule/steps/select-date-time/select-date-time.component';
import { SelectEmployeeComponent } from './create-schedule/steps/select-employee/select-employee.component';
import { CreateScheduleComponent } from './create-schedule/create-schedule.component';

@NgModule({
  declarations: [
    SchedulesComponent,
    SchedulesListComponent,
    CreateScheduleComponent,
    SelectEmployeeComponent,
    SelectDateTimeComponent,
    ConfirmationComponent,
    EmployeeScheduleDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SchedulesRoutingModule,

    // PrimeNG
    ButtonModule,
    CalendarModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    TableModule,
    ToastModule,
    StepsModule,
    ProgressSpinnerModule,
    AvatarModule,
    TagModule,
    ToolbarModule,
    PanelModule,
    DividerModule,
    ChipModule,
    SkeletonModule
  ]
})
export class SchedulesModule { }
