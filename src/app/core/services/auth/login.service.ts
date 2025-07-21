import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environments.prod';
import { Login, TokenResponse, TokenValidationResponse, User } from '../../../shared/models/auth/auth.interface';
import { Router } from '@angular/router';
import { KeyStorage } from '../../../../@utils/enums/KeyStorage';
import { LocalStorageService } from '../../../shared/services/storage/local-storage.service';

@Injectable({providedIn: 'root'})
export class AuthService {

  private baseUrl: string = environment.baseUrl + '/user-service';
  private router = inject(Router);
  private http = inject(HttpClient);
  private _localStorageService = inject(LocalStorageService);
  constructor() { }

  login(login: Login): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/token`, login).pipe(
      map((response: TokenResponse) => {
        return response;
      })
    );
  }
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/${id}`);
  }


  setUserInLocalStorage(token: TokenResponse, user: User): void {
    localStorage.setItem(KeyStorage.TOKEN, JSON.stringify(token));
    localStorage.setItem(KeyStorage.USER, JSON.stringify(user));
  }
	getUserInLocalStorage(): Observable<User> {
		const user = this._localStorageService.getItem<User>(KeyStorage.USER)!;

		return of(user);
	}
  redirectTo(user: User): Observable<User> {

    void this.router.navigateByUrl('/home');
    return of(user);
  }
  validateToken(): Observable<boolean> {
    const idToken: TokenResponse = JSON.parse(localStorage.getItem(KeyStorage.TOKEN) as string) || null;
    if (!idToken) {
      this.router.navigateByUrl('/auth');
      return of(false);
    }

    return this.http.get<TokenValidationResponse>(`${this.baseUrl}/auth/validate?token=${idToken.token}`).pipe(
      map(({valid}) => {
        if (!valid) {
          this.router.navigateByUrl('/auth');
        }
        return valid;
      })
    );
  }
  	deleteUserInLocalStorage(): Observable<string[]> {
		this._localStorageService.removeItem(KeyStorage.TOKEN);
		this._localStorageService.removeItem(KeyStorage.REFRESH_TOKEN);
		this._localStorageService.removeItem(KeyStorage.USER);
		void this.router.navigateByUrl('/auth');
		return of([]);
	}
}
