// schedules-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulesComponent } from './schedules.component';
import { SchedulesListComponent } from './list-page/schedules-list.component';
import { CreateScheduleComponent } from './create-schedule/create-schedule.component';
import { SelectEmployeeComponent } from './create-schedule/steps/select-employee/select-employee.component';
import { SelectDateTimeComponent } from './create-schedule/steps/select-date-time/select-date-time.component';
import { ConfirmationComponent } from './create-schedule/steps/confirmation/confirmation.component';
import { EmployeeScheduleDetailComponent } from './search-page/employee-schedule-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SchedulesComponent,
    children: [
      {
        path: '',
        component: SchedulesListComponent
      },
      {
        path: 'create',
        component: CreateScheduleComponent,
        children: [
          {
            path: '',
            redirectTo: 'select-employee',
            pathMatch: 'full'
          },
          {
            path: 'select-employee',
            component: SelectEmployeeComponent
          },
          {
            path: 'select-datetime',
            component: SelectDateTimeComponent
          },
          {
            path: 'confirmation',
            component: ConfirmationComponent
          }
        ]
      },
      {
        path: 'employee/:employeeId',
        component: EmployeeScheduleDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulesRoutingModule { }
