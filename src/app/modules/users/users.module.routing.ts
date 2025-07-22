import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesModule } from './pages/employees/employees.module';
const routes: Routes = [
  {
    path: 'employees',
    loadChildren: (): Promise<typeof EmployeesModule> =>
      import('./pages/employees/employees.module').then((m) => m.EmployeesModule),
  },
  {
    path: 'users',
    loadChildren: (): Promise<typeof EmployeesModule> =>
      import('./pages/users/users.module').then((m) => m.UsersModule),
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
