import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageModule } from './pages/manage.module';
import { PromotionModule } from './pages/promotions/promotion.module';
import { CategoryModule } from './pages/categories/category.module';
const routes: Routes = [
  {
    path: 'manage',
    loadChildren: (): Promise<typeof ManageModule> =>
      import('./pages/manage.module').then((m) => m.ManageModule),
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
export class ProductsRoutingModule { }
