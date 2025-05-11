export enum TypeMessage {
	Information = 'information',
	Warning = 'warning',
	Error = 'wrror',
	Question = 'question',
	Loading = 'loading',
}

export interface MessageOptions {
	type: TypeMessage;
	title?: string;
	message: string;
	translate?: boolean;
}

export interface MessageResult {
	isConfirmed: boolean;
}

export enum TypeSnackBar {
	Information = 'information',
	Success = 'success',
	Warning = 'warning',
	Error = 'error',
	Loading = 'loading',
}

export interface SnackBarOptions {
	message: string;
	buttonClosed: boolean;
	type: TypeSnackBar | null;
}

export interface Snackbar {
	error(message: string, duration?: number): void;
	warning(message: string, duration?: number): void;
	info(message: string, duration?: number): void;
	success(message: string, duration?: number): void;
}
