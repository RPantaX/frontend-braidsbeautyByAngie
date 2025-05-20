import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404PageComponent } from './shared/pages/error404-page/error404-page.component';
import { HomeComponent } from './shared/pages/home/home.component';
import { AuthGuard } from './auth/guards/auth.guard';

//dominio.com/
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'auth',
      loadChildren: ()=> import('./auth/auth.module').then(m=>m.AuthModule)
    },
    {
      path: 'products',
      loadChildren: ()=> import('./modules/products/products.module').then(m=>m.ProductsModule),
    },
    {
      path: 'reservations',
      loadChildren: ()=> import('./modules/reservations/reservations.module').then(m=>m.ReservationsModule),
    },
    {
      path: 'itemProduct',
      loadChildren: () =>
        import('./modules/products/pages/products/item-products/item-product.module').then(
          (m) => m.ItemProductModule
        ),
    },
    {
      path: 'users',
      loadChildren: ()=> import('./users/users.module').then(m=>m.UsersModule),
    },
    ]
  },

  {
    path:'404',
    component:Error404PageComponent,
  },
  {
    path:'home',
    component: HomeComponent,
  },
  //pordefecto
  {
    path:'',
    redirectTo:'home',
    pathMatch: 'full'
  },
  {
    path:'**',
    redirectTo:'404',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
