import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { ServiceListComponent } from "./list-page/list-page.component";
import { NewServicePageModule } from "./pages/new-page/new-page.module";
import { ToastModule } from "primeng/toast";
import { ToolbarModule } from "primeng/toolbar";
import { ServicesComponent } from "./services.component";

const routes: Routes = [
  {
    path: '',
    component: ServicesComponent,
  }
];

@NgModule({
  declarations: [
    ServicesComponent,
  ],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    DialogModule,
    ToastModule,
    ToolbarModule,
    NewServicePageModule,
    ServiceListComponent,
    RouterModule.forChild(routes),

  ],
  providers: [],

})
export class ServicesModule { }
