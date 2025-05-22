import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { ReservationComponent } from "./reservation.component";
import { ServiceListComponent } from "./list-page/list-page.component";

const routes: Routes = [
  {
    path: '',
    component: ReservationComponent,
  }
];

@NgModule({
  declarations: [
    ReservationComponent,
  ],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    DialogModule,

    ServiceListComponent,
    RouterModule.forChild(routes),

  ],
  providers: [],

})
export class ReservationModule { }
