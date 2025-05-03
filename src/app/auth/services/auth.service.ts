import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usernameSubject = new BehaviorSubject<string>('');

  private baseUrl = 'http://127.0.0.1:9110';
  private clientId = 'gateway-app';
  private clientSecret = '12345';
  private claims!: any;
  private username?: string;
  private isAuth?: boolean;

  constructor(private http: HttpClient, private router: Router) {}

  getAuthorizationCode(): Observable<any> {
    return this.http.get(`${this.baseUrl}/oauth2/authorization/client-app`, { withCredentials: true });
  }

  login(username: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    console.log(body.toString());
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    console.log(headers);
    return this.http.get<{ code: string }>(`http://localhost:8080/oauth2/authorization/client-app`)
            .pipe(
              tap((response) => {this.getToken(response.code); console.log(response.code)}),
              catchError(err => {
                console.error('Error durante el login:', err);
                throw err.error; // Propaga el error al componente para manejarlo allí
              })
            )
    ;
  }

  getToken(code: string): Observable<any> {
    console.log(code);
    const body = new URLSearchParams();
    body.set('code', code);
    body.set('grant_type', 'authorization_code');
    body.set('redirect_uri', 'http://127.0.0.1:8080/authorized');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
    });
    return this.http.post(`${this.baseUrl}/oauth2/token`, body.toString(), { headers }).pipe(
      tap((response : any) => this.onLogin(response?.access_token))
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getTokenFromStorage(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getTokenFromStorage();
  }
  onLogin (token: any) {
    this.claims = JSON.parse(window.atob(token.split(".")[1])) //el token se separa por puntos cabezera, claims, firma./viene en base 64->atob nos permite decodificar un script en base 64
    this.isAuth = true;
    this.username = this.claims.sub;
    sessionStorage.setItem('access_token', JSON.stringify({
      isAuth: this.isAuth,
      username: this.username
    }));
    sessionStorage.setItem('access_token',token)
    this.usernameSubject.next(this.claims.sub);
  };
  logout(): void {
    this.username = undefined;
    this.isAuth = true;
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
