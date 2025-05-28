import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { SecurityState } from '../interfaces/SecurityState';
import { isLoadLogin } from '../redux/selectors/auth.selector';
import { AuthService } from '../../app/core/services/auth/login.service';
import { KeyStorage } from '../../@utils/enums/KeyStorage';
import { loadAction } from '../redux/actions/auth.action';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard {
	constructor(
		private readonly _store: Store<SecurityState>,
		private readonly _authService: AuthService,
		private readonly _router: Router
	) {}

	canActivate(): Observable<boolean> {
		return this._guard();
	}

	canLoad(): Observable<boolean> {
		return this._guard();
	}

  private _guard(): Observable<boolean> {
    const token = localStorage.getItem(KeyStorage.TOKEN);

    if (!token) {
      this._router.navigateByUrl('/auth');
      return of(false);
    }

    return this._authService.getUserInLocalStorage().pipe(
      map((user) => {
        if (!user) {
          this._router.navigateByUrl('/auth');
          return false;
        }

        // Dispatch la acción para marcar como cargado
        this._store.dispatch(loadAction());
        return true;
      }),
      catchError(() => {
        this._router.navigateByUrl('/auth');
        return of(false);
      })
    );
  }
}
