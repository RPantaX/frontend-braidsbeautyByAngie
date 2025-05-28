import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Login, TokenResponse } from '../../../shared/models/auth/auth.interface';
import { AuthService } from '../../../core/services/auth/login.service';
import { Store } from '@ngrx/store';
import { SecurityState } from '../../../../@security/interfaces/SecurityState';
import { cancelLoadingAction, loadingAction, loginAction } from '../../../../@security/redux/actions/auth.action';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private _store = inject(Store<SecurityState>); // Inyectar el store de NgRx o cualquier otro estado global
  // Signals para el estado del componente
  isLoading = signal(false);
  loginError = signal<string | null>(null);
  showPassword = signal(false);

  // Formulario reactivo
  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Getters para facilitar el acceso a los controles
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Métodos para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${fieldName === 'username' ? 'Usuario' : 'Contraseña'} es requerido`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Mínimo ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  // Toggle para mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  // Método para el submit del formulario
  submit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.loginError.set(null);

      const loginData: Login = {
        username: this.username?.value,
        password: this.password?.value
      };
      this._store.dispatch(loadingAction());
      this.authService.login(loginData).subscribe({
        next: ({token}) => {

          this._store.dispatch(loginAction({ token }));
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.loginError.set('Usuario o contraseña incorrectos');
          this._store.dispatch(cancelLoadingAction());
          console.error('Login error:', error);
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.loginForm.markAllAsTouched();
    }
  }
}
