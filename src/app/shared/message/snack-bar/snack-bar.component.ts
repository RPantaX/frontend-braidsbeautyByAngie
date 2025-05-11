import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackBarOptions, TypeSnackBar } from '../message.types';

@Component({
	selector: 'app-snack-bar',
	templateUrl: './snack-bar.component.html',
	styleUrls: ['./snack-bar.component.scss'],
})
export class SnackBarComponent {
	information = TypeSnackBar.Information;
	warning = TypeSnackBar.Warning;
	error = TypeSnackBar.Error;
	success = TypeSnackBar.Success;
	loading = TypeSnackBar.Loading;

	constructor(
		private readonly _matSnackBarRef: MatSnackBarRef<SnackBarComponent>,
		@Inject(MAT_SNACK_BAR_DATA) public options: SnackBarOptions
	) {}

	close(): void {
		this._matSnackBarRef.dismiss();
	}
}
