import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PromotionComponent } from "./promotion.component";
import { PromotionListComponent } from "./list-page/list-page.component";
import { NewPromotionPageModule } from "./new-page/new-page.module";
import { CommonModule } from "@angular/common";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";

const routes: Routes = [
  {
    path: '',
    component: PromotionComponent,
  }
];

@NgModule({
  declarations: [
    PromotionComponent,
  ],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    DialogModule,

    PromotionListComponent,
    RouterModule.forChild(routes),
    NewPromotionPageModule,

  ],
  providers: [],

})
export class PromotionModule { }
