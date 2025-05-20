import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CategoryComponent } from "./category.component";
import { CategoryListComponent } from "./list-page/list-page.component";
import { CommonModule } from "@angular/common";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { NewCategoryPageModule } from "./new-page/new-page.module";

const routes: Routes = [
  {
    path: '',
    component: CategoryComponent,
  }
];

@NgModule({
  declarations: [
    CategoryComponent,
  ],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    DialogModule,

    CategoryListComponent,
    RouterModule.forChild(routes),
    NewCategoryPageModule,
  ],
  providers: [],
})
export class CategoryModule { }
