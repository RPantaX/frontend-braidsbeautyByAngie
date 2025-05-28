import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../models/auth/auth.interface';
import { logoutAction } from '../../../../@security/redux/actions/auth.action';
import { SecurityState } from '../../../../@security/interfaces/SecurityState';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: `
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-name {
      font-weight: 600;
      color: var(--text-color);
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-btn {
      color: var(--red-500) !important;
      transition: color 0.3s ease;
    }

    .logout-btn:hover {
      color: var(--red-600) !important;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-section {
      background: var(--surface-ground);
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem;
    }

    @media (max-width: 768px) {
      .user-name {
        max-width: 100px;
      }

      .header-controls {
        gap: 0.5rem;
      }

      .user-section {
        margin: 0.5rem;
        padding: 0.75rem;
      }
    }
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  private destroy$ = new Subject<void>();

  sidebarVisible: boolean = false;
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;

  // Definir el menú del usuario en el componente
  userMenuItems: MenuItem[] = [];

  constructor(private store: Store<SecurityState>,
    private confirmationService: ConfirmationService,  // ← NUEVO
    private messageService: MessageService
  ) {
    // Selector para obtener el usuario del estado
    this.currentUser$ = this.store.select(state => state.userState.user);

    // Inicializar el menú del usuario
    this.initializeUserMenu();
  }

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        command: () => this.navigateToProfile()
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.navigateToSettings()
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
        styleClass: 'text-red-500'
      }
    ];
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

    logout(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas cerrar sesión?',
      header: 'Confirmar Logout',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cerrar sesión',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.store.dispatch(logoutAction());
        this.sidebarVisible = false;

        // Opcional: Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Sesión cerrada',
          detail: 'Has cerrado sesión correctamente'
        });
      },
      reject: () => {
        // Opcional: El usuario canceló
        console.log('Logout cancelado');
      }
    });
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Usuario';

    // Priorizar nombre completo, luego nombre de usuario, luego email
    return this.currentUser.username ||
           this.currentUser.email?.split('@')[0] ||
           'Usuario';
  }

  getUserAvatar(): string {
    // Si el usuario tiene avatar, usarlo, sino usar uno por defecto
    /*return this.currentUser?.imagen ||
           'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';*/
    return 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
  }

  navigateToProfile(): void {
    // Implementar navegación al perfil
    console.log('Navegando al perfil...');
  }

  navigateToSettings(): void {
    // Implementar navegación a configuración
    console.log('Navegando a configuración...');
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
