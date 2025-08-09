import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EcommerceService } from '../../../../core/services/ecommerce/ecommerce.service';
import {
  EcommerceInterfaceService,
  ServiceDetail,
  CartItem,
  Review,
  TimeSlot,
  EmployeeOption
} from '../../../../shared/models/ecommerce/ecommerce.interface';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading states
  loading = true;
  relatedServicesLoading = false;
  addingToCart = false;

  // Data
  service: ServiceDetail | null = null;
  relatedServices: EcommerceInterfaceService[] = [];
  reviews: Review[] = [];
  availableEmployees: EmployeeOption[] = [];
  availableTimeSlots: TimeSlot[] = [];

  // UI State
  activeTab = 0;
  selectedEmployee: EmployeeOption | null = null;
  selectedTimeSlot: TimeSlot | null = null;
  selectedDate: Date = new Date();
  quantity = 1;

  // Service details
  serviceId: number = 0;
  averageRating = 0;
  totalReviews = 0;

  // Breadcrumb
  breadcrumbItems: any[] = [];

  // Tab options
  tabOptions = [
    { label: 'Descripción', icon: 'pi pi-info-circle' },
    { label: 'Reservar Cita', icon: 'pi pi-calendar' },
    { label: 'Reseñas', icon: 'pi pi-star' },
    { label: 'Servicios Relacionados', icon: 'pi pi-clone' }
  ];

  constructor(
    private ecommerceService: EcommerceService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.serviceId = parseInt(params['id']);
        if (this.serviceId) {
          this.loadServiceData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all service data
   */
  private loadServiceData(): void {
    console.log('Loading service data for ID:', this.serviceId);
    this.loading = true;

    // Cargar servicio primero
    this.ecommerceService.getServiceDetail(this.serviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (service) => {
          console.log('Service detail loaded successfully:', service);
          this.service = service;

          // Setup service-specific data
          this.setupServiceData();
          this.updateBreadcrumb();

          // Cargar servicios relacionados por separado
          this.loadRelatedServices();

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading service data:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la información del servicio',
            life: 5000
          });

          // Redirect back to services list
          this.router.navigate(['/ecommerce/services']);
        }
      });
  }
  /**
   * Load related services separately
   */
  private loadRelatedServices(): void {
    if (!this.service) return;

    this.relatedServicesLoading = true;

    this.ecommerceService.getFeaturedServices(4)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.relatedServices = services.filter(s =>
            s.serviceDTO.serviceId !== this.serviceId
          );
          this.relatedServicesLoading = false;
          console.log('Related services loaded:', this.relatedServices);
        },
        error: (error) => {
          console.error('Error loading related services:', error);
          this.relatedServicesLoading = false;
          // No mostrar error al usuario para servicios relacionados
        }
      });
  }

  /**
   * Setup service-specific data
   */
  private setupServiceData(): void {
    console.log('Setting up service data:', this.service);
    if (!this.service) return;

    // Setup reviews con valores por defecto seguros
    this.reviews = this.service.reviews || [];
    this.totalReviews = this.reviews.length;
    this.averageRating = this.service.averageRating || 0;

    // Setup employees con valores por defecto seguros
    this.availableEmployees = this.service.availableEmployees || [];
    if (this.availableEmployees.length > 0) {
      this.selectedEmployee = this.availableEmployees[0];
    }

    // Setup time slots
    this.availableTimeSlots = this.service.availableTimeSlots || [];
    this.generateTimeSlots();

    console.log('Service data setup complete:', {
      reviews: this.reviews.length,
      employees: this.availableEmployees.length,
      timeSlots: this.availableTimeSlots.length
    });
  }

  /**
   * Generate available time slots for the next 7 days
   */
  private generateTimeSlots(): void {
    // This is a mock implementation
    // In a real application, this would come from the backend
    const slots: TimeSlot[] = [];
    const today = new Date();

    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);

      // Generate slots for each day (9 AM to 6 PM)
      for (let hour = 9; hour < 18; hour++) {
        if (this.availableEmployees.length > 0) {
          this.availableEmployees.forEach(employee => {
            slots.push({
              date: new Date(date),
              startTime: `${hour.toString().padStart(2, '0')}:00`,
              endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
              available: Math.random() > 0.3, // 70% chance of being available
              employeeId: employee.id,
              employeeName: employee.name,
              scheduleId: Math.floor(Math.random() * 1000) // Mock schedule ID
            });
          });
        }
      }
    }

    this.availableTimeSlots = slots;
  }

  /**
   * Update breadcrumb
   */
  private updateBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Inicio', routerLink: '/ecommerce/home' },
      { label: 'Servicios', routerLink: '/ecommerce/services' }
    ];

    if (this.service && this.service.serviceDTO) {
      this.breadcrumbItems.push({
        label: this.service.serviceDTO.serviceName
      });
    }
  }

  /**
   * Add service to cart
   */
  addToCart(): void {
    if (!this.service || !this.service.serviceDTO) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Error',
      detail: 'No se pudo agregar el servicio al carrito',
      life: 3000
    });
    return;
  }

  this.addingToCart = true;

    const cartItem: CartItem = {
      id: this.service.serviceDTO.serviceId,
      type: 'service',
      serviceId: this.service.serviceDTO.serviceId,
      name: this.service.serviceDTO.serviceName,
      description: this.service.serviceDTO.serviceDescription,
      image: this.service.serviceDTO.serviceImage,
      price: this.getServicePrice(),
      quantity: this.quantity,
      maxQuantity: 1,
      duration: this.service.serviceDTO.durationTimeAprox,
      appointmentDateTime: this.selectedTimeSlot?.date,
      employeeId: this.selectedEmployee?.id,
      employeeName: this.selectedEmployee?.name
    };

    this.ecommerceService.addToCart(cartItem);

    this.messageService.add({
      severity: 'success',
      summary: 'Agregado al carrito',
      detail: `${this.service.serviceDTO.serviceName} ha sido agregado al carrito`,
      life: 3000
    });

    this.addingToCart = false;
  }

  /**
   * Book appointment directly
   */
  bookAppointment(): void {
    if (!this.selectedTimeSlot || !this.selectedEmployee) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selección requerida',
        detail: 'Por favor selecciona un empleado y horario',
        life: 3000
      });
      return;
    }

    this.addToCart();
    this.router.navigate(['/ecommerce/checkout']);
  }

  /**
   * Handle employee selection
   */
  onEmployeeSelect(employee: EmployeeOption): void {
    this.selectedEmployee = employee;
    this.selectedTimeSlot = null; // Reset time slot selection
    this.generateTimeSlots(); // Regenerate slots for selected employee
  }

  /**
   * Handle time slot selection
   */
  onTimeSlotSelect(slot: TimeSlot): void {
    if (!slot.available) return;
    this.selectedTimeSlot = slot;
  }

  /**
   * Handle date change
   */
  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.selectedTimeSlot = null;
    this.generateTimeSlots();
  }

  /**
   * Navigate to related service
   */
  goToRelatedService(service: EcommerceInterfaceService): void {
    this.router.navigate(['/ecommerce/services', service.serviceDTO.serviceId]);
  }

  /**
   * Go back to services list
   */
  goBackToServices(): void {
    this.router.navigate(['/ecommerce/services']);
  }

  /**
   * Share service
   */
  shareService(): void {
    if (navigator.share && this.service) {
      navigator.share({
        title: this.service.serviceDTO.serviceName,
        text: this.service.serviceDTO.serviceDescription,
        url: window.location.href
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.messageService.add({
        severity: 'info',
        summary: 'Enlace copiado',
        detail: 'El enlace del servicio ha sido copiado al portapapeles',
        life: 3000
      });
    }
  }

  /**
   * Get service price
   */
  getServicePrice(): number {
    if (!this.service) return 0;
    return this.hasDiscount() ? this.getDiscountedPrice() : this.service.serviceDTO.servicePrice;
  }

  /**
   * Check if service has discount
   */
  hasDiscount(): boolean {
    if (!this.service || !this.service.responseCategoryWIthoutServices) {
      return false;
    }
    return !!(this.service.responseCategoryWIthoutServices.promotionDTOList &&
              this.service.responseCategoryWIthoutServices.promotionDTOList.length > 0);
  }
  /**
   * Get discount percentage
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount() || !this.service) return 0;

    const promotions = this.service.responseCategoryWIthoutServices.promotionDTOList;
    if (!promotions || promotions.length === 0) return 0;

    const promotion = promotions[0];
    return Math.round(promotion.promotionDiscountRate);
  }

  /**
   * Get discounted price
   */
  getDiscountedPrice(): number {
    if (!this.hasDiscount() || !this.service) {
      return this.service?.serviceDTO.servicePrice || 0;
    }

    const promotions = this.service.responseCategoryWIthoutServices.promotionDTOList;
    if (!promotions || promotions.length === 0) {
      return this.service.serviceDTO.servicePrice;
    }

    const originalPrice = this.service.serviceDTO.servicePrice;
    const discountRate = promotions[0].promotionDiscountRate / 100; // Convertir porcentaje

    return originalPrice * (1 - discountRate);
  }

  /**
   * Format duration
   */
  formatDuration(duration: string): string {
    const timeParts = duration.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  /**
   * Get available slots for selected date and employee
   */
  getAvailableSlots(): TimeSlot[] {
    if (!this.selectedEmployee || !this.selectedDate) return [];

    return this.availableTimeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      const selectedDate = new Date(this.selectedDate);

      return (
        slot.employeeId === this.selectedEmployee!.id &&
        slotDate.toDateString() === selectedDate.toDateString() &&
        slot.available
      );
    });
  }

  /**
   * Check if date is selectable (not in the past)
   */
  isDateSelectable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  /**
   * Get rating array for display
   */
  getRatingArray(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  /**
   * Check if rating star should be filled
   */
  isStarFilled(star: number): boolean {
    return star <= this.averageRating;
  }

  /**
   * Handle tab change
   */
  onTabChange(index: number): void {
    this.activeTab = index;
  }

  /**
   * Get category name
   */
  getCategoryName(): string {
    return this.service?.responseCategoryWIthoutServices?.serviceCategoryDTO?.categoryName || 'Sin categoría';
  }

  /**
   * Check if service is available for booking
   */
  isAvailableForBooking(): boolean {
    return this.availableEmployees.length > 0 && this.availableTimeSlots.some(slot => slot.available);
  }

  /**
   * Get next available appointment
   */
  getNextAvailableAppointment(): TimeSlot | null {
    const now = new Date();
    const availableSlots = this.availableTimeSlots
      .filter(slot => slot.available && new Date(slot.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return availableSlots.length > 0 ? availableSlots[0] : null;
  }

  /**
   * Format time slot for display
   */
  formatTimeSlot(slot: TimeSlot): string {
    const date = new Date(slot.date);
    const dateStr = date.toLocaleDateString('es-PE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    return `${dateStr} ${slot.startTime} - ${slot.endTime}`;
  }

  /**
   * Track by function for ngFor performance
   */
  trackBySlotId(index: number, slot: TimeSlot): string {
    return `${slot.employeeId}_${slot.date}_${slot.startTime}`;
  }

  /**
   * Track by function for reviews
   */
  trackByReviewId(index: number, review: Review): number {
    return review.id;
  }

  /**
   * Track by function for related services
   */
  trackByServiceId(index: number, service: EcommerceInterfaceService): number {
    return service.serviceDTO.serviceId;
  }
  /**
 * Track by function for employees
 */
trackByEmployeeId(index: number, employee: EmployeeOption): number {
  return employee.id;
}

/**
 * Check if service can be booked
 */
canBookService(): boolean {
  return !!(this.service &&
            this.selectedEmployee &&
            this.selectedTimeSlot &&
            this.isAvailableForBooking());
}

/**
 * Get service duration in minutes
 */
getServiceDurationMinutes(): number {
  if (!this.service || !this.service.serviceDTO.durationTimeAprox) return 0;

  const timeParts = this.service.serviceDTO.durationTimeAprox.split(':');
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;

  return (hours * 60) + minutes;
}
}
