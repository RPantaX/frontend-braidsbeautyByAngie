import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Snackbar, SnackBarOptions, TypeSnackBar } from './message.types';
import { SnackBarComponent } from './snack-bar/snack-bar.component';

@Injectable({providedIn: 'root'})
export class MessageService {
  _matSnackBar = inject(MatSnackBar);
  _matDialog = inject(MatDialog);
  constructor() { }

  	get snackBar(): Snackbar {
		return {
			error: (message: string, duration?: number): void =>
				this._snackBar(message, TypeSnackBar.Error, duration),
			warning: (message: string, duration?: number): void =>
				this._snackBar(message, TypeSnackBar.Warning, duration),
			info: (message: string, duration?: number): void =>
				this._snackBar(message, TypeSnackBar.Information, duration),
			success: (message: string, duration?: number): void =>
				this._snackBar(message, TypeSnackBar.Success, duration),
		};
	}

	private _snackBar(message: string, type: TypeSnackBar, duration?: number): void {
		const data: SnackBarOptions = {
			message,
			type,
			buttonClosed: true,
		};

		this._matSnackBar.openFromComponent(SnackBarComponent, {
			data,
			panelClass: [`app-snackbar-${type}`],
			duration,
		});
	}
}
