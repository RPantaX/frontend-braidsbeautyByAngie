import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditProductModule } from './products/pages/product-page/edit-product-page.module';
import { ProductsInModule } from './products/products-in.module';


const routes: Routes = [

  {
    path: 'edit/:id',
    loadChildren: (): Promise<typeof EditProductModule> =>
      import('./products/pages/product-page/edit-product-page.module').then((m) => m.EditProductModule),
  },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ManageRoutingModule {}
