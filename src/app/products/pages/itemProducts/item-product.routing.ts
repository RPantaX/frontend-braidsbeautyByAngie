import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewPageComponent } from './new-page/new-page.component';
import { NewItemProductModule } from './new-page/new-page.module';

const routes: Routes = [
      //poner el :id al ultimo siempre ya que es un comodin, y puede coincidir con lo demas
      {path: 'new/:idProduct',
        loadChildren: () : Promise<typeof NewItemProductModule> =>
          import('./new-page/new-page.module').then(m => m.NewItemProductModule),
      },
      {path: 'edit/:idItemProduct/:idProduct',
        loadChildren: () : Promise<typeof NewItemProductModule> =>
          import('./new-page/new-page.module').then(m => m.NewItemProductModule),
      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemProductRoutingModule { }
