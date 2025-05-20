import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotionModule } from './pages/promotions/promotion.module';
import { CategoryModule } from './pages/categories/category.module';
import { ReservationModule } from './pages/reservations/reservation.module';
const routes: Routes = [
  {
    path: '',
    loadChildren: (): Promise<typeof ReservationModule> =>
      import('./pages/reservations/reservation.module').then((m) => m.ReservationModule),
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
  //CATEGORIA
  //PROMOTIONS
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
