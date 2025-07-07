import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { APIErrorResponse } from "../../@utils/interfaces/ApiResponse";

import { inject, Injectable } from '@angular/core';
import { MessageService } from "../../app/shared/message/message.service";
import { TranslateService } from "@ngx-translate/core";
import { KeyStorage } from "../../@utils/enums/KeyStorage";
import { TokenResponse } from "../../app/shared/models/auth/auth.interface";
import { EnumErrorCode } from "../../@utils/enums/EnumErrorCode";


const ERROR_CODE = Object.values(EnumErrorCode as unknown as string[]);
@Injectable({providedIn: 'root'})
export class SecurityInterceptor implements HttpInterceptor{
  private readonly _messageService: MessageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _snackBar = this._messageService.snackBar;
	private readonly _duration = 5000;
  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(this._getCloneReques(req)).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiResponse = error.error as APIErrorResponse;
        const internalServerErrorMessage =  this._translate.instant('errors.serverError');
        const { message, status  } = apiResponse;
       if (status === 500 || status === 503) {
        		this._snackBar.error(message || internalServerErrorMessage, this._duration);
						return throwError(() => new Error(status.toString()));
       } else if (status === 403) {
         // Maneja el error de autorización aquí
         console.error('Error de autorización:', error);
       } else {
         // Maneja otros errores aquí
         console.error('Error:', error);
       }
       return throwError(() => error);
     })
    );

    throw new Error("Method not implemented.");
  }
	private _getCloneReques(request: HttpRequest<unknown>): HttpRequest<unknown> {
		let clonedRequest: HttpRequest<unknown> = request.clone({});

		let idToken: TokenResponse | null = null;

		idToken =JSON.parse(localStorage.getItem(KeyStorage.TOKEN) as string) || null;

		if (idToken) {
			clonedRequest = request.clone({
				setHeaders: {
					authorization: `Bearer ${idToken.token}`,
				},
			});
		}

		return clonedRequest;
	}
}
