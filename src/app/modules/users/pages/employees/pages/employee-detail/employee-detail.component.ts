// pages/employee-detail/employee-detail.component.ts
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeService } from '../../../../../../core/services/users/employee.service';
import { EmployeeDto } from '../../../../../../shared/models/users/employee.interface';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Signals
  employee = signal<EmployeeDto | null>(null);
  loading = signal<boolean>(false);
  employeeId = signal<number | null>(null);

  // Computed values
  employeeFullName = computed(() => {
    const emp = this.employee();
    if (!emp?.person) return 'Sin nombre';
    return `${emp.person.name} ${emp.person.lastName}`;
  });

  employeeAvatar = computed(() => {
    const emp = this.employee();
    return emp?.employeeImage ||
           'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
  });

  isActive = computed(() => {
    const emp = this.employee();
    return emp?.person?.state ?? true;
  });

  statusInfo = computed(() => {
    const active = this.isActive();
    return {
      label: active ? 'Activo' : 'Inactivo',
      severity: active ? 'success' : 'danger' as 'success' | 'danger',
      icon: active ? 'pi pi-check-circle' : 'pi pi-times-circle'
    };
  });

  employeeTypeInfo = computed(() => {
    const emp = this.employee();
    const type = emp?.employeeType?.value || 'Sin tipo';

    // Map employee types to colors and icons
    const typeMap: Record<string, { color: string; icon: string }> = {
      'STYLIST': { color: 'bg-purple-100 text-purple-800', icon: 'pi pi-palette' },
      'RECEPTIONIST': { color: 'bg-blue-100 text-blue-800', icon: 'pi pi-phone' },
      'MANAGER': { color: 'bg-green-100 text-green-800', icon: 'pi pi-crown' },
      'ASSISTANT': { color: 'bg-yellow-100 text-yellow-800', icon: 'pi pi-user-plus' },
      'CLEANER': { color: 'bg-gray-100 text-gray-800', icon: 'pi pi-home' }
    };

    return {
      value: type,
      ...typeMap[type] || { color: 'bg-gray-100 text-gray-800', icon: 'pi pi-user' }
    };
  });

  ngOnInit(): void {
    this.loadEmployeeId();
    this.loadEmployeeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= DATA LOADING =================

  private loadEmployeeId(): void {
    const id = this.route.snapshot.params['id'];
    if (!id || isNaN(+id)) {
      this.showError('ID de empleado inválido');
      this.navigateToList();
      return;
    }
    this.employeeId.set(+id);
  }

  private loadEmployeeData(): void {
    const id = this.employeeId();
    if (!id) return;

    this.loading.set(true);

    this.employeeService.getEmployeeById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee) => {
          this.employee.set(employee);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al cargar empleado: ' + error.message);
          this.navigateToList();
        }
      });
  }

  // ================= NAVIGATION =================

  navigateToList(): void {
    this.router.navigate(['/test/employees']);
  }

  navigateToEdit(): void {
    const id = this.employeeId();
    if (id) {
      this.router.navigate(['/test/employees/edit', id]);
    }
  }

  // ================= ACTIONS =================

  confirmDelete(): void {
    const employee = this.employee();
    if (!employee) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al empleado ${this.employeeFullName()}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        this.deleteEmployee();
      }
    });
  }

  private deleteEmployee(): void {
    const id = this.employeeId();
    if (!id) return;

    this.loading.set(true);

    this.employeeService.deleteEmployee(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Empleado eliminado exitosamente');
          this.navigateToList();
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al eliminar empleado: ' + error.message);
        }
      });
  }

  refreshData(): void {
    this.loadEmployeeData();
  }

  // ================= UTILITY METHODS =================

  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  formatPhone(phone: string): string {
    if (!phone) return 'No disponible';

    // Format phone number (assuming it's a simple format)
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  getFullAddress(): string {
    const emp = this.employee();
    const address = emp?.person?.address;

    if (!address) return 'No disponible';

    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  copyToClipboard(text: string, label: string): void {
    if (!text || text === 'No disponible') {
      this.showWarn('No hay información para copiar');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess(`${label} copiado al portapapeles`);
    }).catch(() => {
      this.showError('Error al copiar al portapapeles');
    });
  }

  openEmailClient(): void {
    const emp = this.employee();
    const email = emp?.person?.emailAddress;

    if (!email) {
      this.showWarn('No hay email disponible');
      return;
    }

    window.open(`mailto:${email}`, '_blank');
  }

  callEmployee(): void {
    const emp = this.employee();
    const phone = emp?.person?.phoneNumber;

    if (!phone) {
      this.showWarn('No hay teléfono disponible');
      return;
    }

    window.open(`tel:${phone}`, '_self');
  }

  // ================= EXPORT METHODS =================

  exportEmployeeInfo(): void {
    const emp = this.employee();
    if (!emp) return;

    const info = {
      id: emp.id,
      nombre: this.employeeFullName(),
      email: emp.person?.emailAddress || 'N/A',
      telefono: emp.person?.phoneNumber || 'N/A',
      tipoEmpleado: emp.employeeType?.value || 'N/A',
      tipoDocumento: emp.person?.documentType?.value || 'N/A',
      numeroDocumento: emp.person?.documentNumber || 'N/A',
      direccion: this.getFullAddress(),
      estado: this.statusInfo().label
    };

    const dataStr = JSON.stringify(info, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `empleado_${emp.id}_${this.employeeFullName().replace(/\s+/g, '_')}.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.showSuccess('Información del empleado exportada');
  }

  printEmployeeInfo(): void {
    window.print();
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

  // ================= HELPER METHODS =================

  hasContracts(): boolean {
    const emp = this.employee();
    return !!(emp?.contracts && emp.contracts.length > 0);
  }

  getContractCount(): number {
    const emp = this.employee();
    return emp?.contracts?.length || 0;
  }

  hasUser(): boolean {
    const emp = this.employee();
    return !!(emp?.user && emp.user.id);
  }

  getUserStatus(): { label: string; severity: 'success' | 'danger'; icon: string } {
    const emp = this.employee();
    const enabled = emp?.user?.enabled ?? false;

    return {
      label: enabled ? 'Usuario Activo' : 'Usuario Inactivo',
      severity: enabled ? 'success' : 'danger',
      icon: enabled ? 'pi pi-check-circle' : 'pi pi-times-circle'
    };
  }

  getInitials(): string {
    const emp = this.employee();
    if (!emp?.person) return 'NA';

    const firstName = emp.person.name?.charAt(0) || '';
    const lastName = emp.person.lastName?.charAt(0) || '';

    return (firstName + lastName).toUpperCase();
  }
}
