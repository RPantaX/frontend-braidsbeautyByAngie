import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewItemProductModule } from '../../item-products/pages/new-page/new-page.module';

const routes: Routes = [
      //poner el :id al ultimo siempre ya que es un comodin, y puede coincidir con lo demas
      {path: 'new',
        loadChildren: () : Promise<typeof NewItemProductModule> =>
          import('../../item-products/pages/new-page/new-page.module').then(m => m.NewItemProductModule),
      },
      {path: 'edit/:idItemProduct',
        loadChildren: () : Promise<typeof NewItemProductModule> =>
          import('../../item-products/pages/new-page/new-page.module').then(m => m.NewItemProductModule),
      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditProductRoutingModule { }

