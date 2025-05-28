import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyStorage } from '../../@utils/enums/KeyStorage';

@Injectable({
	providedIn: 'root',
})
export class LoginGuard {
	constructor(private readonly activatedRoute: ActivatedRoute, private readonly router: Router) {}

	canActivate(): boolean {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
		const url = (this.activatedRoute as any)['_futureSnapshot']['_routerState']['url'] as string;

		if (
			localStorage.getItem(KeyStorage.TOKEN) != null &&
			//localStorage.getItem(KeyStorage.REFRESH_TOKEN) != null &&
			localStorage.getItem(KeyStorage.USER) != null
		) {
			if (url === '') void this.router.navigateByUrl('/home');
			else void this.router.navigateByUrl(url);
			return false;
		}

		return true;
	}
}
