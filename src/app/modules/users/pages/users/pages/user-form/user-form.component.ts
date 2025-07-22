// pages/user-form/user-form.component.ts
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';

import {
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
  RoleDto,
  EmployeeMatchDto,
  UserFormErrors,
  PasswordValidation,
  PASSWORD_REQUIREMENTS,
  USERNAME_REQUIREMENTS,
  USER_ERROR_MESSAGES
} from '../../../../../../shared/models/users/users.interface';
import { UserService } from '../../../../../../core/services/users/users.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  formErrorMessages = computed(() => Object.values(this.formErrors()));
  // Signals para manejo de estado
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  roles = signal<RoleDto[]>([]);
  currentUser = signal<UserDto | null>(null);
  isEditMode = signal<boolean>(false);
  formErrors = signal<UserFormErrors>({});

  // Employee matching
  employeeMatch = signal<EmployeeMatchDto | null>(null);
  searchingEmployee = signal<boolean>(false);
  documentSearchTerm = signal<string>('');

  // Password validation
  passwordValidation = signal<PasswordValidation>({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
    isValid: false
  });

  // Form
  userForm!: FormGroup;

  // Computed values
  roleOptions = computed(() =>
    this.roles().map(role => ({
      label: role.name.replace('ROLE_', ''),
      value: role.id,
      roleName: role.name
    }))
  );

  formTitle = computed(() =>
    this.isEditMode() ? 'Editar Usuario' : 'Nuevo Usuario'
  );

  submitButtonLabel = computed(() =>
    this.isEditMode() ? 'Actualizar Usuario' : 'Crear Usuario'
  );

  showPasswordFields = computed(() => !this.isEditMode());

  employeeInfo = computed(() => {
    const employee = this.employeeMatch();
    if (!employee) return null;

    return {
      fullName: `${employee.person.name} ${employee.person.lastName}`,
      email: employee.person.emailAddress,
      phone: employee.person.phoneNumber,
      documentType: employee.person.documentType.value,
      employeeType: employee.employeeType.value,
      avatar: employee.employeeImage
    };
  });

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkRouteMode();
    this.loadRoles();
    this.setupFormValidation();
    this.setupEmployeeSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= INITIALIZATION =================

  private initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(USERNAME_REQUIREMENTS.minLength),
        Validators.maxLength(USERNAME_REQUIREMENTS.maxLength),
        Validators.pattern(USERNAME_REQUIREMENTS.allowedPattern)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(PASSWORD_REQUIREMENTS.minLength),
        Validators.maxLength(PASSWORD_REQUIREMENTS.maxLength),
        this.passwordStrengthValidator.bind(this)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      enabled: [true],
      admin: [false],
      document: [''],
      keycloakId: ['']
    }, {
      validators: [this.passwordMatchValidator]
    });

    // Remove password validators in edit mode
    if (this.isEditMode()) {
      this.userForm.removeControl('password');
      this.userForm.removeControl('confirmPassword');
    }
  }

  private checkRouteMode(): void {
    const routeData = this.route.snapshot.data;
    const userId = this.route.snapshot.params['id'];

    this.isEditMode.set(routeData['mode'] === 'edit' && !!userId);

    if (this.isEditMode()) {
      this.loadUserData(+userId);
    }
  }

  private loadRoles(): void {
    this.userService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles.set(roles);
        },
        error: (error) => {
          this.showError('Error al cargar roles: ' + error.message);
        }
      });
  }

  private loadUserData(userId: number): void {
    this.loading.set(true);

    this.userService.getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.populateForm(user);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al cargar usuario: ' + error.message);
          this.navigateToList();
        }
      });
  }

  private populateForm(user: UserDto): void {
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      enabled: user.enabled,
      admin: this.userService.isUserAdmin(user),
      keycloakId: user.keycloakId || ''
    });
  }

  // ================= FORM VALIDATION =================

  private setupFormValidation(): void {
    // Username async validation
    this.userForm.get('username')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => {
          if (!username || username.length < USERNAME_REQUIREMENTS.minLength) {
            return [];
          }
          const excludeId = this.isEditMode() ? this.currentUser()?.id : undefined;
          return this.userService.validateUsernameAvailable(username, excludeId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(isAvailable => {
        const usernameControl = this.userForm.get('username');
        if (usernameControl && !isAvailable) {
          usernameControl.setErrors({ ...usernameControl.errors, usernameExists: true });
        } else if (usernameControl?.errors?.['usernameExists']) {
          delete usernameControl.errors['usernameExists'];
          if (Object.keys(usernameControl.errors).length === 0) {
            usernameControl.setErrors(null);
          }
        }
        this.updateFormErrors();
      });

    // Email async validation
    this.userForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          if (!email || !this.isValidEmail(email)) {
            return [];
          }
          const excludeId = this.isEditMode() ? this.currentUser()?.id : undefined;
          return this.userService.validateEmailAvailable(email, excludeId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(isAvailable => {
        const emailControl = this.userForm.get('email');
        if (emailControl && !isAvailable) {
          emailControl.setErrors({ ...emailControl.errors, emailExists: true });
        } else if (emailControl?.errors?.['emailExists']) {
          delete emailControl.errors['emailExists'];
          if (Object.keys(emailControl.errors).length === 0) {
            emailControl.setErrors(null);
          }
        }
        this.updateFormErrors();
      });

    // Password validation
    if (!this.isEditMode()) {
      this.userForm.get('password')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(password => {
          this.validatePassword(password || '');
          this.updateFormErrors();
        });
    }

    // General form changes
    this.userForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateFormErrors();
      });
  }

  private setupEmployeeSearch(): void {
    this.userForm.get('document')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(documentNumber => {
        this.documentSearchTerm.set(documentNumber || '');
        if (documentNumber && documentNumber.length >= 8) {
          this.searchEmployee(documentNumber);
        } else {
          this.employeeMatch.set(null);
        }
      });
  }

  private searchEmployee(documentNumber: string): void {
    this.searchingEmployee.set(true);

    this.userService.findEmployeeByDocument(documentNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee) => {
          this.employeeMatch.set(employee);
          this.searchingEmployee.set(false);

          if (employee) {
            // Auto-fill email if empty
            const emailControl = this.userForm.get('email');
            if (emailControl && !emailControl.value) {
              emailControl.setValue(employee.person.emailAddress);
            }

            this.showSuccess('Empleado encontrado y vinculado');
          } else {
            this.showWarn('No se encontró un empleado con este número de documento');
          }
        },
        error: (error) => {
          this.searchingEmployee.set(false);
          this.employeeMatch.set(null);
          console.error('Error searching employee:', error);
        }
      });
  }

  // ================= VALIDATORS =================

  private passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.value;
    if (!password) return null;

    const validation = this.userService.validatePasswordStrength(password);
    return validation.isValid ? null : { passwordWeak: true };
  }

  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): void {
    const validation: PasswordValidation = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
      hasMinLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      isValid: false
    };

    validation.isValid = validation.hasUpperCase &&
                        validation.hasLowerCase &&
                        validation.hasNumber &&
                        validation.hasSpecialChar &&
                        validation.hasMinLength;

    this.passwordValidation.set(validation);
  }

  private updateFormErrors(): void {
    const errors: UserFormErrors = {};
    const controls = this.userForm.controls;

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.invalid && (control.dirty || control.touched)) {
        errors[key] = this.getControlErrorPrivate(key, control.errors);
      }
    });

    // Add form-level errors
    if (this.userForm.errors?.['passwordMismatch'] &&
        this.userForm.get('confirmPassword')?.touched) {
      errors['confirmPassword'] = USER_ERROR_MESSAGES.PASSWORDS_NOT_MATCH;
    }

    this.formErrors.set(errors);
  }

  private getControlErrorPrivate(controlName: string, errors: any): string {
    if (!errors) return '';

    const errorKeys = Object.keys(errors);
    const firstError = errorKeys[0];

    switch (firstError) {
      case 'required':
        return this.getRequiredErrorMessage(controlName);
      case 'email':
        return USER_ERROR_MESSAGES.EMAIL_INVALID;
      case 'minlength':
        return this.getMinLengthErrorMessage(controlName, errors.minlength.requiredLength);
      case 'maxlength':
        return this.getMaxLengthErrorMessage(controlName, errors.maxlength.requiredLength);
      case 'pattern':
        return controlName === 'username'
          ? USER_ERROR_MESSAGES.USERNAME_PATTERN
          : 'Formato inválido';
      case 'usernameExists':
        return USER_ERROR_MESSAGES.USERNAME_EXISTS;
      case 'emailExists':
        return USER_ERROR_MESSAGES.EMAIL_EXISTS;
      case 'passwordWeak':
        return 'La contraseña no cumple con los requisitos de seguridad';
      default:
        return 'Error de validación';
    }
  }

  private getRequiredErrorMessage(controlName: string): string {
    const messages: Record<string, string> = {
      username: USER_ERROR_MESSAGES.USERNAME_REQUIRED,
      email: USER_ERROR_MESSAGES.EMAIL_REQUIRED,
      password: USER_ERROR_MESSAGES.PASSWORD_REQUIRED,
      confirmPassword: USER_ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED
    };
    return messages[controlName] || 'Este campo es requerido';
  }

  private getMinLengthErrorMessage(controlName: string, requiredLength: number): string {
    if (controlName === 'username') return USER_ERROR_MESSAGES.USERNAME_MIN_LENGTH;
    if (controlName === 'password') return USER_ERROR_MESSAGES.PASSWORD_MIN_LENGTH;
    return `Debe tener al menos ${requiredLength} caracteres`;
  }

  private getMaxLengthErrorMessage(controlName: string, requiredLength: number): string {
    if (controlName === 'username') return USER_ERROR_MESSAGES.USERNAME_MAX_LENGTH;
    if (controlName === 'password') return USER_ERROR_MESSAGES.PASSWORD_MAX_LENGTH;
    return `No puede exceder ${requiredLength} caracteres`;
  }

  // ================= FORM SUBMISSION =================

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      this.updateFormErrors();
      this.showError('Por favor, corrija los errores en el formulario');
      return;
    }

    this.saving.set(true);

    if (this.isEditMode()) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser(): void {
    const formData = this.buildCreateUserRequest();

    this.userService.createUser(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showSuccess('Usuario creado exitosamente');
          this.navigateToList();
        },
        error: (error) => {
          this.saving.set(false);
          this.showError('Error al crear usuario: ' + error.message);
        }
      });
  }

  private updateUser(): void {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    const formData = this.buildUpdateUserRequest();

    this.userService.updateUser(userId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showSuccess('Usuario actualizado exitosamente');
          this.navigateToList();
        },
        error: (error) => {
          this.saving.set(false);
          this.showError('Error al actualizar usuario: ' + error.message);
        }
      });
  }

  private buildCreateUserRequest(): CreateUserRequest {
    const formValue = this.userForm.value;

    return {
      username: formValue.username.trim(),
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      enabled: formValue.enabled,
      admin: formValue.admin,
      document: formValue.document?.trim() || undefined,
      keycloakId: formValue.keycloakId?.trim() || undefined
    };
  }

  private buildUpdateUserRequest(): UpdateUserRequest {
    const formValue = this.userForm.value;
    const currentUser = this.currentUser();

    // Build roles array based on admin status
    const roles: RoleDto[] = [];
    const userRole = this.roles().find(r => r.name === 'ROLE_USER');
    if (userRole) roles.push(userRole);

    if (formValue.admin) {
      const adminRole = this.roles().find(r => r.name === 'ROLE_ADMIN');
      if (adminRole) roles.push(adminRole);
    }

    return {
      username: formValue.username.trim(),
      email: formValue.email.trim().toLowerCase(),
      enabled: formValue.enabled,
      admin: formValue.admin,
      roles
    };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  // ================= NAVIGATION =================

  onCancel(): void {
    if (this.userForm.dirty) {
      if (confirm('¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.')) {
        this.navigateToList();
      }
    } else {
      this.navigateToList();
    }
  }

  navigateToList(): void {
    this.router.navigate(['/test/users']);
  }

  // ================= UTILITY METHODS =================

  getControlError(controlName: string): string {
    return this.formErrors()[controlName] || '';
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getPasswordStrengthClass(): string {
    const validation = this.passwordValidation();
    const score = [
      validation.hasMinLength,
      validation.hasUpperCase,
      validation.hasLowerCase,
      validation.hasNumber,
      validation.hasSpecialChar
    ].filter(Boolean).length;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthLabel(): string {
    const strengthClass = this.getPasswordStrengthClass();
    const labels = {
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte'
    };
    return labels[strengthClass as keyof typeof labels];
  }

  clearEmployeeMatch(): void {
    this.employeeMatch.set(null);
    this.userForm.get('document')?.setValue('');
  }

  generateUsername(): void {
    const email = this.userForm.get('email')?.value;
    if (email) {
      const username = email.split('@')[0];
      this.userForm.get('username')?.setValue(username);
    }
  }
 /**
   * Sugiere un email basado en el nombre del empleado
   */
  suggestEmailFromEmployee(): void {
    const employee = this.employeeMatch();
    if (!employee) return;

    const emailControl = this.userForm.get('email');
    if (emailControl && !emailControl.value) {
      const firstName = employee.person.name.toLowerCase().replace(/\s+/g, '');
      const lastName = employee.person.lastName.toLowerCase().replace(/\s+/g, '');
      const suggestedEmail = `${firstName}.${lastName}@empresa.com`;
      emailControl.setValue(suggestedEmail);
    }
  }

  /**
   * Valida disponibilidad de username en tiempo real
   */
  checkUsernameAvailability(): void {
    const username = this.userForm.get('username')?.value;
    if (!username || username.length < 3) return;

    const excludeId = this.isEditMode() ? this.currentUser()?.id : undefined;
    this.userService.validateUsernameAvailable(username, excludeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAvailable => {
        if (!isAvailable) {
          this.showWarn('Este nombre de usuario ya está en uso');
        }
      });
  }
  /**
   * Valida disponibilidad de email en tiempo real
   */
  checkEmailAvailability(): void {
    const email = this.userForm.get('email')?.value;
    if (!email || !this.isValidEmail(email)) return;

    const excludeId = this.isEditMode() ? this.currentUser()?.id : undefined;
    this.userService.validateEmailAvailable(email, excludeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAvailable => {
        if (!isAvailable) {
          this.showWarn('Este email ya está registrado');
        }
      });
  }

  /**
   * Genera una contraseña segura automáticamente
   */
  generateSecurePassword(): void {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    this.userForm.patchValue({
      password: password,
      confirmPassword: password
    });

    this.showSuccess('Contraseña segura generada automáticamente');
  }

  /**
   * Copia la contraseña generada al portapapeles
   */
  copyPasswordToClipboard(): void {
    const password = this.userForm.get('password')?.value;
    if (!password) {
      this.showWarn('No hay contraseña para copiar');
      return;
    }

    navigator.clipboard.writeText(password).then(() => {
      this.showSuccess('Contraseña copiada al portapapeles');
    }).catch(() => {
      this.showError('Error al copiar al portapapeles');
    });
  }
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    // This method can be used with a password visibility toggle button
    // Implementation would depend on the UI library password component
  }

  // ================= MESSAGE METHODS =================

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  private showWarn(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      life: 3000
    });
  }

  // ================= FORM HELPERS =================

  resetForm(): void {
    this.userForm.reset({
      enabled: true,
      admin: false
    });
    this.employeeMatch.set(null);
    this.formErrors.set({});
    this.passwordValidation.set({
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
      hasMinLength: false,
      isValid: false
    });
  }

  prefillTestData(): void {
    // For development/testing purposes
    this.userForm.patchValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!@#',
      confirmPassword: 'Test123!@#',
      enabled: true,
      admin: false
    });
  }
}
