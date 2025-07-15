import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../models/auth/auth.interface';
import { logoutAction } from '../../../../@security/redux/actions/auth.action';
import { SecurityState } from '../../../../@security/interfaces/SecurityState';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

interface QuickStats {
  ordersToday: number;
  salesToday: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  private destroy$ = new Subject<void>();

  // Sidebar state
  sidebarVisible: boolean = false;
  expandedSections = new Set<string>();

  // User data
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;

  // Theme
  isDarkTheme = false;

  // Search
  searchTerm = '';

  // Notifications
  notificationCount = 3;
  notificationItems: MenuItem[] = [];

  // Breadcrumb
  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

  // Quick stats
  quickStats: QuickStats = {
    ordersToday: 0,
    salesToday: 0
  };

  // Menu items
  userMenuItems: MenuItem[] = [];

  constructor(
    private store: Store<SecurityState>,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private dashboardService: DashboardService
  ) {
    this.currentUser$ = this.store.select(state => state.userState.user);
    this.initializeMenus();
    this.loadThemePreference();
    this.initializeExpandedSections();
  }

  ngOnInit(): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    this.updateBreadcrumb();
    this.loadQuickStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMenus(): void {
    // User menu
    this.userMenuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.navigateToProfile()
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.navigateToSettings()
      },
      {
        label: 'Ayuda',
        icon: 'pi pi-question-circle',
        command: () => this.openHelp()
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

    // Notification items
    this.notificationItems = [
      {
        label: 'Nueva orden recibida',
        icon: 'pi pi-shopping-cart',
        command: () => this.router.navigate(['/orders'])
      },
      {
        label: 'Producto con stock bajo',
        icon: 'pi pi-exclamation-triangle',
        command: () => this.router.navigate(['/products'])
      },
      {
        label: 'Nueva reserva',
        icon: 'pi pi-calendar',
        command: () => this.router.navigate(['/reservations'])
      },
      {
        separator: true
      },
      {
        label: 'Ver todas las notificaciones',
        icon: 'pi pi-bell',
        command: () => this.router.navigate(['/notifications'])
      }
    ];
  }

  private initializeExpandedSections(): void {
    // Keep management section expanded by default
    this.expandedSections.add('management');
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme-preference');
    this.isDarkTheme = savedTheme === 'dark';
    this.applyTheme();
  }

  private updateBreadcrumb(): void {
    // This would be updated based on current route
    this.breadcrumbItems = [
      { label: 'Dashboard', routerLink: '/dashboard' },
      { label: 'Inicio' }
    ];
  }

  private loadQuickStats(): void {
    // Load quick stats from dashboard service
    this.dashboardService.getTodayTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        this.quickStats.ordersToday = transactions.length;
        this.quickStats.salesToday = transactions.reduce((sum, t) => sum + t.amount, 0);
      });
  }

  // Sidebar methods
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleMenuSection(section: string): void {
    if (this.expandedSections.has(section)) {
      this.expandedSections.delete(section);
    } else {
      this.expandedSections.add(section);
    }
  }

  getMenuChevron(section: string): string {
    return this.expandedSections.has(section) ? 'pi-chevron-down' : 'pi-chevron-right';
  }

  // Theme methods
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    localStorage.setItem('theme-preference', this.isDarkTheme ? 'dark' : 'light');

    this.messageService.add({
      severity: 'info',
      summary: 'Tema cambiado',
      detail: `Tema ${this.isDarkTheme ? 'oscuro' : 'claro'} aplicado`,
      life: 2000
    });
  }

  private applyTheme(): void {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = this.isDarkTheme
        ? 'assets/themes/arya-blue/theme.css'
        : 'assets/themes/saga-blue/theme.css';
    }
  }

  // Search methods
  performSearch(): void {
    if (this.searchTerm.trim()) {
      // Implement global search logic
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda',
        detail: `Buscando: ${this.searchTerm}`,
        life: 2000
      });

      // Navigate to search results or filter current view
      this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
    }
  }

  // User methods
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Usuario';
    return this.currentUser.username ||
           this.currentUser.email?.split('@')[0] ||
           'Usuario';
  }

  getUserAvatar(): string {
    /*return this.currentUser?.imagen ||
           'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';*/
           return'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
  }

  // Navigation methods
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  openHelp(): void {
    window.open('/help', '_blank');
  }

  // Logout method
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

        this.messageService.add({
          severity: 'success',
          summary: 'Sesión cerrada',
          detail: 'Has cerrado sesión correctamente',
          life: 2000
        });
      }
    });
  }

  // Utility methods
  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }
}
