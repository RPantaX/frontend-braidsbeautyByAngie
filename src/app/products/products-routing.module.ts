import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewPageComponent } from './pages/products/new-page/new-page.component';
import { SearchPageComponent } from './pages/products/search-page/search-page.component';
import { ListPageComponent } from './pages/products/list-page/list-page.component';
import { ProductPageComponent } from './pages/products/product-page/product-page.component';
import { HomeComponent } from '../shared/pages/home/home.component';

const routes: Routes = [
  {
    path:'',
    component:HomeComponent,
    children:[
      //poner el :id al ultimo siempre ya que es un comodin, y puede coincidir con lo demas
      {path: 'new-product', component: NewPageComponent},
      {path: 'search', component: SearchPageComponent},
      {path: 'edit/:id', component: NewPageComponent},
      {path: 'list', component: ListPageComponent},
      {path: ':id', component: ProductPageComponent},
      {path: '**', redirectTo:'list'},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
