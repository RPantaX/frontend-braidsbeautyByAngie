import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from './message.service';
import { SnackBarComponent } from './snack-bar/snack-bar.component';

@NgModule({
	declarations: [SnackBarComponent],
	imports: [
		CommonModule,
		MatProgressSpinnerModule,
		MatDialogModule,
		MatButtonModule,
		TranslateModule,
		MatIconModule,
		MatSnackBarModule,
	],
	providers: [MessageService],
})
export class MessageModule {}
