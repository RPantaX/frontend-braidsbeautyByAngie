import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { insertUserLogin, loadAction, loginAction, logoutAction, resetStateUserAction, verifyAuthAction } from '../actions/auth.action';
import { AuthService } from '../../../app/core/services/auth/login.service';
import { KeyStorage } from '../../../@utils/enums/KeyStorage';
import { User } from '../../../app/shared/models/auth/auth.interface';


@Injectable()
export class AuthEffect {

  private authService = inject(AuthService);
  private actions$ = inject(Actions);

	constructor(
	) {}

	userLoginEffect = createEffect(() =>
		this.actions$.pipe(
			ofType(loginAction),
			mergeMap((token) => {
        const payloadBase64 = token.token.split('.')[1];
        const payloadDecoded = atob(payloadBase64);
        const payload = JSON.parse(payloadDecoded);
				return this.authService.getUserById(payload.userId).pipe(
					mergeMap((res) => this.authService.redirectTo(res)),
					switchMap((res) => {
            this.authService.setUserInLocalStorage(token, res);
						return [
							insertUserLogin({
								user: res,
							}),
							loadAction(),
						];
					})
				);
			})
		)
	);

	verifyAuthEffect = createEffect(() =>
		this.actions$.pipe(
			ofType(verifyAuthAction),
			mergeMap(({ user }) => {
				return this.authService.getUserInLocalStorage();
			}),
			filter((user) => user != null),
			filter(() => localStorage.getItem(KeyStorage.TOKEN) != null),
			mergeMap((su) =>
				this.authService.validateToken().pipe(
					mergeMap(() => this.authService.getUserInLocalStorage()),
					switchMap((su2) => [
						insertUserLogin({
							user: { ...su2 },
						})
					])
				)
			)
		)
	);

	logoutEffect = createEffect(() =>
		this.actions$.pipe(
			ofType(logoutAction),
			mergeMap(() => this.authService.deleteUserInLocalStorage()),
			switchMap(() => [resetStateUserAction()])
		)
	);

}
