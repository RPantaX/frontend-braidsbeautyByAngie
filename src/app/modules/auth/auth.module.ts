import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth.routing';

@NgModule({
	imports: [
		AuthRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		MatTooltipModule,
		MatIconModule,
		MatProgressSpinnerModule,
		HttpClientModule,
		TranslateModule,
		CommonModule,


	],
	providers: [],
	exports: [AuthComponent],
	declarations: [AuthComponent],
})
export class AuthModule {
	static forRoot(): ModuleWithProviders<AuthModule> {
		return {
			ngModule: AuthModule,
		};
	}
}
