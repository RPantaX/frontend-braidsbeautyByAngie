import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styles: ``
})
export class LoginPageComponent {
  public userForm: FormGroup;
  public errorMessage: string | null = null;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.userForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  get usernameControl() {
    return this.userForm.get('username');
  }

  get passwordControl() {
    return this.userForm.get('password');
  }

  onLogin(): void {
    this.errorMessage = null;
    if (this.userForm.invalid) {
      return;
    }

    const { username, password } = this.userForm.value;

    this.authService.login(username,password)
      .subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error en el login:', err);
          this.errorMessage = err.message?.message || 'Usuario o contrasena incorrectos.';
        }
      });
  }

}
