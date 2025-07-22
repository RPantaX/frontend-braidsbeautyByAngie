// pages/user-list/user-list.component.ts
import { Component, OnInit, OnDestroy, signal, computed, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import {
  UserDto,
  RoleDto,
  UserFilter,
  DropdownOption,
  USER_STATUS_MAP,
  ADMIN_STATUS_MAP,
  ROLE_LABELS,
  UserStatusMapping,
} from '../../../../../../shared/models/users/users.interface';
import { UserService } from '../../../../../../core/services/users/users.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;

  private destroy$ = new Subject<void>();

  // Signals para manejo de estado
  users = signal<UserDto[]>([]);
  filteredUsers = signal<UserDto[]>([]);
  roles = signal<RoleDto[]>([]);
  loading = signal<boolean>(false);

  // Filtros
  filters = signal<UserFilter>({
    enabled: true,
    searchTerm: ''
  });

  // UI State
  selectedUsers = signal<UserDto[]>([]);
  globalFilterValue = signal<string>('');

  // Computed values
  roleOptions = computed(() => [
    { label: 'Todos los roles', value: null },
    ...this.roles().map(role => ({
      label: ROLE_LABELS[role.name] || role.name.replace('ROLE_', ''),
      value: role.id
    }))
  ]);

  statusOptions = computed(() => [
    { label: 'Todos', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false }
  ]);

  adminOptions = computed(() => [
    { label: 'Todos los tipos', value: null },
    { label: 'Administradores', value: true },
    { label: 'Usuarios', value: false }
  ]);

  totalActiveUsers = computed(() =>
    this.users().filter(user => user.enabled).length
  );

  totalAdminUsers = computed(() =>
    this.users().filter(user => this.userService.isUserAdmin(user)).length
  );

  constructor(
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupRefreshSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= DATA LOADING =================

  private loadInitialData(): void {
    this.loading.set(true);

    // Cargar usuarios y roles
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.applyFilters();
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al cargar usuarios: ' + error.message);
        }
      });

    // Cargar roles
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

  private setupRefreshSubscription(): void {
    this.userService.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadInitialData();
      });
  }

  // ================= FILTER METHODS =================

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.globalFilterValue.set(value);

    this.filters.update(current => ({
      ...current,
      searchTerm: value
    }));

    this.applyFilters();
  }

  onStatusFilterChange(selectedStatus: boolean | undefined ): void {
    this.filters.update(current => ({
      ...current,
      enabled: selectedStatus
    }));
    this.applyFilters();
  }

  onRoleFilterChange(selectedRoleId: number | null): void {
    this.filters.update(current => ({
      ...current,
      roleId: selectedRoleId || undefined
    }));
    this.applyFilters();
  }

  onAdminFilterChange(selectedAdmin: boolean | undefined): void {
    this.filters.update(current => ({
      ...current,
      admin: selectedAdmin
    }));
    this.applyFilters();
  }

  private applyFilters(): void {
    const currentFilters = this.filters();
    const allUsers = this.users();

    const filtered = this.userService.filterUsers(allUsers, currentFilters);
    this.filteredUsers.set(filtered);
  }

  clearFilters(): void {
    this.filters.set({
      enabled: true,
      searchTerm: ''
    });
    this.globalFilterValue.set('');
    this.table.clear();
    this.applyFilters();
  }

  // ================= NAVIGATION METHODS =================

  navigateToCreate(): void {
    this.router.navigate(['/test/users/create']);
  }

  navigateToEdit(user: UserDto): void {
    this.router.navigate(['/test/users/edit', user.id]);
  }

  navigateToDetail(user: UserDto): void {
    this.router.navigate(['/test/users/detail', user.id]);
  }

  // ================= ACTION METHODS =================

  confirmDelete(user: UserDto): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al usuario "${user.username}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        this.deleteUser(user.id);
      }
    });
  }

  deleteUser(userId: number): void {
    this.loading.set(true);

    this.userService.deleteUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Usuario eliminado exitosamente');
          this.loadInitialData();
        },
        error: (error) => {
          this.loading.set(false);
          this.showError('Error al eliminar usuario: ' + error.message);
        }
      });
  }

  confirmDeleteSelected(): void {
    const selectedCount = this.selectedUsers().length;

    if (selectedCount === 0) {
      this.showWarn('No hay usuarios seleccionados para eliminar');
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selectedCount} usuario(s) seleccionado(s)?`,
      header: 'Confirmar Eliminación Múltiple',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar todos',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        this.deleteSelectedUsers();
      }
    });
  }

  private deleteSelectedUsers(): void {
    const userIds = this.selectedUsers().map(user => user.id);
    let deletedCount = 0;
    let errors = 0;

    this.loading.set(true);

    // Delete users one by one
    userIds.forEach((id, index) => {
      this.userService.deleteUser(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            deletedCount++;
            if (index === userIds.length - 1) {
              this.handleBulkDeleteComplete(deletedCount, errors);
            }
          },
          error: () => {
            errors++;
            if (index === userIds.length - 1) {
              this.handleBulkDeleteComplete(deletedCount, errors);
            }
          }
        });
    });
  }

  private handleBulkDeleteComplete(deletedCount: number, errors: number): void {
    this.loading.set(false);
    this.selectedUsers.set([]);

    if (errors === 0) {
      this.showSuccess(`${deletedCount} usuario(s) eliminado(s) exitosamente`);
    } else {
      this.showWarn(`${deletedCount} usuario(s) eliminado(s), ${errors} error(es)`);
    }

    this.loadInitialData();
  }

  toggleUserStatus(user: UserDto): void {
    const newStatus = !user.enabled;
    const action = newStatus ? 'activar' : 'desactivar';

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea ${action} al usuario "${user.username}"?`,
      header: `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      icon: 'pi pi-question-circle',
      acceptLabel: `Sí, ${action}`,
      rejectLabel: 'Cancelar',
      accept: () => {
        const updateData = {
          username: user.username,
          email: user.email,
          enabled: newStatus,
          admin: this.userService.isUserAdmin(user),
          roles: user.roles
        };

        this.userService.updateUser(user.id, updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess(`Usuario ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
              this.loadInitialData();
            },
            error: (error) => {
              this.showError(`Error al ${action} usuario: ` + error.message);
            }
          });
      }
    });
  }

  // ================= UTILITY METHODS =================

  getUserStatusInfo(user: UserDto): UserStatusMapping {
    return user.enabled ? USER_STATUS_MAP['enabled'] : USER_STATUS_MAP['disabled'];
  }

  getUserTypeInfo(user: UserDto): UserStatusMapping {
    const isAdmin = this.userService.isUserAdmin(user);
    return isAdmin ? ADMIN_STATUS_MAP['admin'] : ADMIN_STATUS_MAP['user'];
  }

  getUserRolesDisplay(user: UserDto): string {
    return this.userService.formatUserRoles(user);
  }

  getUserAvatar(user: UserDto): string {
    return this.userService.generateUserAvatar(user.username);
  }

  getUserInitials(user: UserDto): string {
    return this.userService.getUserInitials(user);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

  // ================= EXPORT METHODS =================

  exportExcel(): void {
    this.showSuccess('Funcionalidad de exportación en desarrollo');
  }

  exportPDF(): void {
    this.showSuccess('Funcionalidad de exportación en desarrollo');
  }

  // ================= RESPONSIVE METHODS =================

  getTableStyleClass(): string {
    return 'p-datatable-sm p-datatable-striped p-datatable-responsive-demo';
  }

  isSmallScreen(): boolean {
    return window.innerWidth < 768;
  }

  // ================= STATISTICS METHODS =================

  refreshData(): void {
    this.loadInitialData();
  }

  getStatistics() {
    return {
      total: this.users().length,
      active: this.totalActiveUsers(),
      inactive: this.users().length - this.totalActiveUsers(),
      admins: this.totalAdminUsers(),
      users: this.users().length - this.totalAdminUsers()
    };
  }
}
