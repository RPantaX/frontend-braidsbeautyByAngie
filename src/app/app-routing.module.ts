import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404PageComponent } from './shared/pages/error404-page/error404-page.component';
import { HomeComponent } from './shared/pages/home/home.component';
import { AuthComponent } from './modules/auth/auth.component';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from '../@security/guards/auth.guard';
import { UserGuard } from '../@security/guards/user.guard';
import { EnumRolesUsuario } from '../@utils/enums/EnumRoles';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: HomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'home',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard', // ← ESTA RUTA FALTABA
        loadChildren: () => import('./shared/pages/home/components/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'products',
        canActivate: [AuthGuard, UserGuard],
        data: { rol: EnumRolesUsuario.ADMIN },
        loadChildren: () => import('./modules/products/products.module').then(m => m.ProductsModule),
      },
      {
        path: 'reservations',
        canActivate: [AuthGuard, UserGuard],
        data: { rol: EnumRolesUsuario.ADMIN },
        loadChildren: () => import('./modules/reservations/reservations.module').then(m => m.ReservationsModule),
      },
      /*{
        path: 'orders',
        canActivate: [AuthGuard, UserGuard],
        data: { rol: EnumRolesUsuario.ADMIN },
        loadChildren: () => import('./modules/orders/orders.module').then(m => m.OrdersModule),
      },*/
      {
        path: 'users',
        canActivate: [AuthGuard, UserGuard],
        data: { rol: EnumRolesUsuario.ADMIN },
        loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
      },
      {
        path: 'test',
        canActivate: [AuthGuard, UserGuard],
        data: { rol: EnumRolesUsuario.ADMIN },
        loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule),
      },
      {
        path: 'itemProduct',
        canActivate: [AuthGuard, UserGuard],
        data: { rol: EnumRolesUsuario.ADMIN },
        loadChildren: () =>
          import('./modules/products/pages/products/item-products/item-product.module').then(
            (m) => m.ItemProductModule
          ),
      },
    ]
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: '',
        loadChildren: (): Promise<typeof AuthModule> =>
          import('./modules/auth/auth.module').then((m) => m.AuthModule),
      },
    ]
  },
  {
    path: '404',
    component: Error404PageComponent,
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'not-found',
    redirectTo: '404',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
