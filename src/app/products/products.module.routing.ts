import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageModule } from './pages/manage.module';
const routes: Routes = [
  {
    path: 'manage',
    loadChildren: (): Promise<typeof ManageModule> =>
      import('./pages/manage.module').then((m) => m.ManageModule),
  },

  //CATEGORIA
  //PROMOTIONS
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
