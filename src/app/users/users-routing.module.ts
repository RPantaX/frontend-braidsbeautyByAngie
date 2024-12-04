import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { NewPageComponent } from './pages/new-page/new-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { UsersPageComponent } from './pages/users-page/users-page.component';
import { HomeComponent } from '../shared/pages/home/home.component';

const routes: Routes = [
  {
  path:'',
  component:HomeComponent,
  children:[
    //poner el :id al ultimo siempre ya que es un comodin, y puede coincidir con lo demas
    {path: 'new-user', component: NewPageComponent},
    {path: 'search', component: SearchPageComponent},
    {path: 'edit/:id', component: NewPageComponent},
    {path: 'list', component: ListPageComponent},
    {path: ':id', component: UsersPageComponent},
    {path: '**', redirectTo:'list'},
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
