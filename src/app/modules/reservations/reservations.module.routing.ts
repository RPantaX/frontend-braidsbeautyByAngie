import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotionModule } from './pages/promotions/promotion.module';
import { CategoryModule } from './pages/categories/category.module';
import { ServicesModule } from './pages/services/services.module';
const routes: Routes = [
  {
    path: '',
    loadChildren: (): Promise<typeof ServicesModule> =>
      import('./pages/services/services.module').then((m) => m.ServicesModule),
  },
  {
    path: 'promotions',
    loadChildren: (): Promise<typeof PromotionModule> =>
      import('./pages/promotions/promotion.module').then((m) => m.PromotionModule),
  },
  {
    path: 'categories',
    loadChildren: (): Promise<typeof CategoryModule> =>
      import('./pages/categories/category.module').then((m) => m.CategoryModule),
  },
  {
    path: 'schedules',
    loadChildren: () => import('./pages/schedules/schedules.module').then(m => m.SchedulesModule),
  },
  //CATEGORIA
  //PROMOTIONS
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
