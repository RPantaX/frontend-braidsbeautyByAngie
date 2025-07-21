// pages/employee-form/employee-form.component.ts
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import {
  CreateEmployeeRequest,
  EmployeeDto,
  EmployeeTypeDto,
  DocumentTypeDto,
  EmployeeFormData,
  EmployeeFormErrors
} from '../../../../../../shared/models/users/employee.interface';
import { EmployeeService } from '../../../../../../core/services/users/employee.service';
import { UtilsService } from '../../../../../../core/services/users/utils.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  private utilsService = inject(UtilsService);
  // Signals para manejo de estado
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  employeeTypes = signal<EmployeeTypeDto[]>([]);
  documentTypes = signal<DocumentTypeDto[]>([]);
  currentEmployee = signal<EmployeeDto | null>(null);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<SafeUrl | null>(null);
  isEditMode = signal<boolean>(false);
  formErrors = signal<EmployeeFormErrors>({});

  hasFormErrors = computed(() => Object.keys(this.formErrors()).length > 0);
  formErrorValues = computed(() => Object.values(this.formErrors()));
  // Form
  employeeForm!: FormGroup;

  // Computed values
  employeeTypeOptions = computed(() =>
    this.employeeTypes().map(type => ({
      label: type.value,
      value: type.id
    }))
  );

  documentTypeOptions = computed(() =>
    this.documentTypes().map(type => ({
      label: type.value,
      value: type.id
    }))
  );

  formTitle = computed(() =>
    this.isEditMode() ? 'Editar Empleado' : 'Nuevo Empleado'
  );

  submitButtonLabel = computed(() =>
    this.isEditMode() ? 'Actualizar Empleado' : 'Crear Empleado'
  );

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkRouteMode();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= INITIALIZATION =================

  private initializeForm(): void {
    this.employeeForm = this.fb.group({
      // Personal Information
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      documentNumber: ['', [Validators.required, Validators.minLength(8)]],
      documentTypeId: [null, [Validators.required]],
      employeeTypeId: [null, [Validators.required]],

      // Address Information
      street: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      postalCode: ['', [Validators.required, Validators.maxLength(10)]],
      country: ['', [Validators.required, Validators.maxLength(50)]],
      addressDescription: ['', [Validators.maxLength(200)]],

      // File handling
      deleteFile: [false]
    });

    // Watch for form changes to update errors
    this.employeeForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateFormErrors();
      });
  }

  private checkRouteMode(): void {
    const routeData = this.route.snapshot.data;
    const employeeId = this.route.snapshot.params['id'];

    this.isEditMode.set(routeData['mode'] === 'edit' && !!employeeId);

    if (this.isEditMode()) {
      this.loadEmployeeData(+employeeId);
    }
  }

  private loadInitialData(): void {
    this.loading.set(true);

    forkJoin({
      employeeTypes: this.utilsService.getAllEmployeeTypes(),
      documentTypes: this.utilsService.getAllDocumentTypes()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ employeeTypes, documentTypes }) => {
          this.employeeTypes.set(employeeTypes);
          this.documentTypes.set(documentTypes);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al cargar datos iniciales: ' + error.message);
        }
      });
  }

  private loadEmployeeData(employeeId: number): void {
    this.loading.set(true);

    this.employeeService.getEmployeeById(employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee) => {
          this.currentEmployee.set(employee);
          this.populateForm(employee);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al cargar empleado: ' + error.message);
          this.navigateToList();
        }
      });
  }

  private populateForm(employee: EmployeeDto): void {
    if (!employee.person) return;

    this.employeeForm.patchValue({
      name: employee.person.name,
      lastName: employee.person.lastName,
      emailAddress: employee.person.emailAddress,
      phoneNumber: employee.person.phoneNumber,
      documentNumber: employee.person.documentNumber || '',
      documentTypeId: employee.person.documentType?.id,
      employeeTypeId: employee.employeeType?.id,

      // Address
      street: employee.person.address?.street,
      city: employee.person.address?.city,
      state: employee.person.address?.state,
      postalCode: employee.person.address?.postalCode,
      country: employee.person.address?.country,
      addressDescription: employee.person.address?.description || '',

      deleteFile: false
    });

    // Set current image if exists
    if (employee.employeeImage) {
      this.imagePreview.set(employee.employeeImage);
    }
  }

  // ================= FORM VALIDATION =================

  private updateFormErrors(): void {
    const errors: EmployeeFormErrors = {};
    const controls = this.employeeForm.controls;

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.invalid && (control.dirty || control.touched)) {
        errors[key] = this.getControlErrorprivate(key, control.errors);
      }
    });

    this.formErrors.set(errors);
  }

  private getControlErrorprivate(controlName: string, errors: any): string {
    if (!errors) return '';

    const errorMessages: Record<string, Record<string, string>> = {
      name: {
        required: 'El nombre es requerido',
        minlength: 'El nombre debe tener al menos 2 caracteres',
        maxlength: 'El nombre no puede exceder 50 caracteres'
      },
      lastName: {
        required: 'El apellido es requerido',
        minlength: 'El apellido debe tener al menos 2 caracteres',
        maxlength: 'El apellido no puede exceder 50 caracteres'
      },
      emailAddress: {
        required: 'El email es requerido',
        email: 'El formato del email no es válido'
      },
      phoneNumber: {
        required: 'El teléfono es requerido',
        pattern: 'El formato del teléfono no es válido'
      },
      documentNumber: {
        required: 'El número de documento es requerido',
        minlength: 'El documento debe tener al menos 8 caracteres'
      },
      documentTypeId: {
        required: 'El tipo de documento es requerido'
      },
      employeeTypeId: {
        required: 'El tipo de empleado es requerido'
      },
      street: {
        required: 'La dirección es requerida',
        maxlength: 'La dirección no puede exceder 100 caracteres'
      },
      city: {
        required: 'La ciudad es requerida',
        maxlength: 'La ciudad no puede exceder 50 caracteres'
      },
      state: {
        required: 'El estado/provincia es requerido',
        maxlength: 'El estado no puede exceder 50 caracteres'
      },
      postalCode: {
        required: 'El código postal es requerido',
        maxlength: 'El código postal no puede exceder 10 caracteres'
      },
      country: {
        required: 'El país es requerido',
        maxlength: 'El país no puede exceder 50 caracteres'
      }
    };

    const controlErrors = errorMessages[controlName];
    if (!controlErrors) return 'Error de validación';

    const firstError = Object.keys(errors)[0];
    return controlErrors[firstError] || 'Error de validación';
  }
  getControlError(controlName: string): string {
    return this.formErrors()[controlName] || '';
  }

  // ================= FILE HANDLING =================

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showError('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.showError('El archivo no puede exceder 5MB');
      return;
    }

    this.selectedFile.set(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      this.imagePreview.set(safeUrl);
    };
    reader.readAsDataURL(file);

    // Reset delete flag
    this.employeeForm.patchValue({ deleteFile: false });
  }

  onFileRemove(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);

    if (this.isEditMode() && this.currentEmployee()?.employeeImage) {
      this.employeeForm.patchValue({ deleteFile: true });
    }
  }

  // ================= FORM SUBMISSION =================

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched();
      this.updateFormErrors();
      this.showError('Por favor, corrija los errores en el formulario');
      return;
    }

    this.saving.set(true);

    const formData = this.buildEmployeeRequest();

    const operation = this.isEditMode()
      ? this.employeeService.updateEmployee(this.currentEmployee()!.id, formData)
      : this.employeeService.createEmployee(formData);

    operation.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving.set(false);
          const message = this.isEditMode()
            ? 'Empleado actualizado exitosamente'
            : 'Empleado creado exitosamente';
          this.showSuccess(message);
          this.navigateToList();
        },
        error: (error) => {
          this.saving.set(false);
          this.showError('Error al guardar empleado: ' + error.message);
        }
      });
  }

  private buildEmployeeRequest(): CreateEmployeeRequest {
    const formValue = this.employeeForm.value;

    return {
      employeeTypeId: formValue.employeeTypeId,
      name: formValue.name.trim(),
      lastName: formValue.lastName.trim(),
      phoneNumber: formValue.phoneNumber.trim(),
      emailAddress: formValue.emailAddress.trim().toLowerCase(),
      employeeImage: this.selectedFile(),
      street: formValue.street.trim(),
      city: formValue.city.trim(),
      state: formValue.state.trim(),
      postalCode: formValue.postalCode.trim(),
      addressDescription: formValue.addressDescription?.trim() || '',
      country: formValue.country.trim(),
      documentNumber: formValue.documentNumber.trim(),
      documentTypeId: formValue.documentTypeId,
      deleteFile: formValue.deleteFile
    };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  // ================= NAVIGATION =================

  onCancel(): void {
    if (this.employeeForm.dirty) {
      if (confirm('¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.')) {
        this.navigateToList();
      }
    } else {
      this.navigateToList();
    }
  }

  navigateToList(): void {
    this.router.navigate(['/test/employees']);
  }

  // ================= UTILITY METHODS =================

  isControlInvalid(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getCurrentImageUrl(): string | SafeUrl | null {
    if (this.imagePreview()) {
      return this.imagePreview();
    }

    if (this.isEditMode() && this.currentEmployee()?.employeeImage && !this.employeeForm.get('deleteFile')?.value) {
      return this.currentEmployee()!.employeeImage!;
    }

    return null;
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
}
