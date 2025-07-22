// pages/user-detail/user-detail.component.ts
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../../../../core/services/users/users.service';
import { RoleDto, UserDto } from '../../../../../../shared/models/users/users.interface';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Signals
  user = signal<UserDto | null>(null);
  loading = signal<boolean>(false);
  userId = signal<number | null>(null);
  userStatistics = signal<any>(null);

  // Computed values
  userFullInfo = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return null;

    return {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      enabled: currentUser.enabled,
      isAdmin: this.userService.isUserAdmin(currentUser),
      roles: currentUser.roles,
      rolesFormatted: this.userService.formatUserRoles(currentUser),
      createdAt: currentUser.createdAt,
      modifiedAt: currentUser.modifiedAt,
      keycloakId: currentUser.keycloakId
    };
  });

  statusInfo = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return null;

    return {
      enabled: {
        value: currentUser.enabled,
        label: currentUser.enabled ? 'Activo' : 'Inactivo',
        severity: currentUser.enabled ? 'success' : 'danger' as 'success' | 'danger',
        icon: currentUser.enabled ? 'pi pi-check-circle' : 'pi pi-times-circle'
      },
      type: {
        value: this.userService.isUserAdmin(currentUser),
        label: this.userService.isUserAdmin(currentUser) ? 'Administrador' : 'Usuario Regular',
        severity: this.userService.isUserAdmin(currentUser) ? 'info' : 'warning' as 'info' | 'warning',
        icon: this.userService.isUserAdmin(currentUser) ? 'pi pi-crown' : 'pi pi-user'
      }
    };
  });

  userInitials = computed(() => {
    const currentUser = this.user();
    return currentUser ? this.userService.getUserInitials(currentUser) : 'NA';
  });

  ngOnInit(): void {
    this.loadUserId();
    this.loadUserData();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= DATA LOADING =================

  private loadUserId(): void {
    const id = this.route.snapshot.params['id'];
    if (!id || isNaN(+id)) {
      this.showError('ID de usuario inválido');
      this.navigateToList();
      return;
    }
    this.userId.set(+id);
  }

  private loadUserData(): void {
    const id = this.userId();
    if (!id) return;

    this.loading.set(true);

    this.userService.getUserById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al cargar usuario: ' + error.message);
          this.navigateToList();
        }
      });
  }

  private loadStatistics(): void {
    this.userService.getUserStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.userStatistics.set(stats);
        },
        error: (error) => {
          console.warn('Error loading statistics:', error);
        }
      });
  }

  // ================= NAVIGATION =================

  navigateToList(): void {
    this.router.navigate(['/test/users']);
  }

  navigateToEdit(): void {
    const id = this.userId();
    if (id) {
      this.router.navigate(['/test/users/edit', id]);
    }
  }

  // ================= ACTIONS =================

  confirmDelete(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al usuario "${currentUser.username}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        this.deleteUser();
      }
    });
  }

  private deleteUser(): void {
    const id = this.userId();
    if (!id) return;

    this.loading.set(true);

    this.userService.deleteUser(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Usuario eliminado exitosamente');
          this.navigateToList();
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al eliminar usuario: ' + error.message);
        }
      });
  }
  sendEmail(): void {
    const email = this.userFullInfo()?.email;
    if (email) {
      window.open(`mailto:${email}`);
    } else {
      this.showWarn('El email del usuario no está disponible.');
    }
  }
  toggleUserStatus(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    const newStatus = !currentUser.enabled;
    const action = newStatus ? 'activar' : 'desactivar';

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea ${action} al usuario "${currentUser.username}"?`,
      header: `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      icon: 'pi pi-question-circle',
      acceptLabel: `Sí, ${action}`,
      rejectLabel: 'Cancelar',
      accept: () => {
        const updateData = {
          username: currentUser.username,
          email: currentUser.email,
          enabled: newStatus,
          admin: this.userService.isUserAdmin(currentUser),
          roles: currentUser.roles
        };

        this.userService.updateUser(currentUser.id, updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess(`Usuario ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
              this.loadUserData();
            },
            error: (error) => {
              this.showError(`Error al ${action} usuario: ` + error.message);
            }
          });
      }
    });
  }

  toggleAdminStatus(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    const isCurrentlyAdmin = this.userService.isUserAdmin(currentUser);
    const newAdminStatus = !isCurrentlyAdmin;
    const action = newAdminStatus ? 'convertir en administrador' : 'quitar permisos de administrador';

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea ${action} al usuario "${currentUser.username}"?`,
      header: 'Confirmar Cambio de Permisos',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        // Build new roles
        const roles: RoleDto[] = [];
        const userRole = this.userService.roles().find(r => r.name === 'ROLE_USER');
        if (userRole) roles.push(userRole);

        if (newAdminStatus) {
          const adminRole = this.userService.roles().find(r => r.name === 'ROLE_ADMIN');
          if (adminRole) roles.push(adminRole);
        }

        const updateData = {
          username: currentUser.username,
          email: currentUser.email,
          enabled: currentUser.enabled,
          admin: newAdminStatus,
          roles
        };

        this.userService.updateUser(currentUser.id, updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess('Permisos de usuario actualizados exitosamente');
              this.loadUserData();
            },
            error: (error) => {
              this.showError('Error al actualizar permisos: ' + error.message);
            }
          });
      }
    });
  }

  refreshData(): void {
    this.loadUserData();
    this.loadStatistics();
  }

  // ================= UTILITY METHODS =================

  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  copyToClipboard(text: string, label: string): void {
    if (!text) {
      this.showWarn('No hay información para copiar');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess(`${label} copiado al portapapeles`);
    }).catch(() => {
      this.showError('Error al copiar al portapapeles');
    });
  }

  exportUserInfo(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    const info = {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      enabled: currentUser.enabled,
      roles: currentUser.roles.map(r => r.name),
      isAdmin: this.userService.isUserAdmin(currentUser),
      createdAt: currentUser.createdAt,
      modifiedAt: currentUser.modifiedAt,
      keycloakId: currentUser.keycloakId,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(info, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `usuario_${currentUser.id}_${currentUser.username}.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.showSuccess('Información del usuario exportada');
  }

  printUserInfo(): void {
    window.print();
  }

  getRoleColor(roleName: string): string {
    const colors: Record<string, string> = {
      'ROLE_ADMIN': 'p-tag-warning',
      'ROLE_USER': 'p-tag-info',
      'ROLE_EMPLOYEE': 'p-tag-success',
      'ROLE_MANAGER': 'p-tag-danger'
    };
    return colors[roleName] || 'p-tag-secondary';
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
}
