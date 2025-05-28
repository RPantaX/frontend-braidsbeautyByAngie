import { Injectable } from '@angular/core';
import { Router, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { SecurityState } from '../interfaces/SecurityState';
import { currentUser } from '../redux/selectors/auth.selector';
import { EnumRolesUsuario } from '../../@utils/enums/EnumRoles';
import { User } from '../../app/shared/models/auth/auth.interface';

@Injectable({
	providedIn: 'root',
})
export class UserGuard {
	constructor(
		private readonly store: Store<SecurityState>,
		private readonly router: Router
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> {
		const requiredRole = route.data['rol'] as EnumRolesUsuario;
		return this.checkUserRole(requiredRole);
	}

	canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
		const requiredRole = route.data?.['rol'] as EnumRolesUsuario;
		return this.checkUserRole(requiredRole);
	}

	private checkUserRole(requiredRole: EnumRolesUsuario): Observable<boolean> {
		// Si no se especifica un rol requerido, permitir acceso
		if (!requiredRole) {
			return of(true);
		}

		return this.store.select(currentUser).pipe(
			take(1),
			map((user: User) => {
				// Verificar si el usuario existe
				if (!user || !user.roles || user.roles.length === 0) {
					console.warn('Usuario sin roles definidos');
					this.redirectToUnauthorized();
					return false;
				}

				// Verificar si el usuario tiene el rol requerido
				const hasRequiredRole = user.roles.some(userRole =>
					userRole.name === requiredRole ||
					userRole.name === EnumRolesUsuario.ADMIN // Los admin siempre tienen acceso
				);

				if (!hasRequiredRole) {
					console.warn(`Acceso denegado. Se requiere rol: ${requiredRole}, Usuario tiene: ${user.roles.join(', ')}`);
					this.redirectToUnauthorized();
					return false;
				}

				return true;
			}),
			catchError((error) => {
				console.error('Error al verificar roles del usuario:', error);
				this.redirectToUnauthorized();
				return of(false);
			})
		);
	}

	private redirectToUnauthorized(): void {
		// Puedes redirigir a una página de "No autorizado" o al home
		this.router.navigateByUrl('/home'); // o '/home' o '/403'
	}
}
