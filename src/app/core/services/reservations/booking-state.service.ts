// booking-state.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { ServiceDetail, EmployeeOption, TimeSlot, CartItem } from '../../../shared/models/ecommerce/ecommerce.interface';
import { EmployeeDto } from '../../../shared/models/users/employee.interface';

export interface BookingData {
  service: ServiceDetail | null;
  employee: EmployeeDto | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
  notes: string;
  reservationId?: number;
}

export interface BookingOrder {
  reservationId: number;
  bookingData: BookingData;
  products: CartItem[];
  quantities: { [productId: string]: number };
  totalAmount: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {

  // ========== SIGNALS ==========
  private readonly _currentStep = signal(1);
  private readonly _selectedService = signal<ServiceDetail | null>(null);
  private readonly _selectedEmployee = signal<EmployeeDto | null>(null);
  private readonly _selectedDate = signal<Date | null>(null);
  private readonly _selectedTimeSlot = signal<TimeSlot | null>(null);
  private readonly _customerNotes = signal('');
  private readonly _reservationId = signal<number | null>(null);
  private readonly _bookingProducts = signal<CartItem[]>([]);
  private readonly _bookingQuantities = signal<{ [productId: string]: number }>({});
  private readonly _completedBookings = signal<BookingOrder[]>([]);

  // ========== COMPUTED SIGNALS ==========
  readonly currentStep = computed(() => this._currentStep());
  readonly selectedService = computed(() => this._selectedService());
  readonly selectedEmployee = computed(() => this._selectedEmployee());
  readonly selectedDate = computed(() => this._selectedDate());
  readonly selectedTimeSlot = computed(() => this._selectedTimeSlot());
  readonly customerNotes = computed(() => this._customerNotes());
  readonly reservationId = computed(() => this._reservationId());
  readonly bookingProducts = computed(() => this._bookingProducts());
  readonly bookingQuantities = computed(() => this._bookingQuantities());
  readonly completedBookings = computed(() => this._completedBookings());

  // Computed para verificar si el booking está completo
  readonly isBookingComplete = computed(() => {
    return !!(
      this._selectedService() &&
      this._selectedEmployee() &&
      this._selectedDate() &&
      this._selectedTimeSlot() &&
      this._reservationId()
    );
  });

  // Computed para obtener el total del booking
  readonly bookingTotal = computed(() => {
    const service = this._selectedService();
    const products = this._bookingProducts();
    const quantities = this._bookingQuantities();

    let total = service ? service.serviceDTO.servicePrice : 0;

    products.forEach(product => {
      const quantity = quantities[product.id] || 0;
      total += product.price * quantity;
    });

    return total;
  });

  // Computed para datos del booking actual
  readonly currentBookingData = computed((): BookingData => ({
    service: this._selectedService(),
    employee: this._selectedEmployee(),
    date: this._selectedDate(),
    timeSlot: this._selectedTimeSlot(),
    notes: this._customerNotes(),
    reservationId: this._reservationId()!
  }));

  // ========== STEP MANAGEMENT ==========
  setCurrentStep(step: number): void {
    this._currentStep.set(step);
  }

  nextStep(): boolean {
    const current = this._currentStep();
    if (current < 3 && this.canProceedToStep(current + 1)) {
      this._currentStep.set(current + 1);
      return true;
    }
    return false;
  }

  previousStep(): boolean {
    const current = this._currentStep();
    if (current > 1) {
      this._currentStep.set(current - 1);
      return true;
    }
    return false;
  }

  canProceedToStep(step: number): boolean {
    switch (step) {
      case 1:
        return true; // Always can go to step 1
      case 2:
        return !!this._selectedService() && !!this._selectedEmployee();
      case 3:
        return !!this._selectedService() &&
               !!this._selectedEmployee() &&
               !!this._selectedDate() &&
               !!this._selectedTimeSlot();
      default:
        return false;
    }
  }

  // ========== SERVICE MANAGEMENT ==========
  setSelectedService(service: ServiceDetail | null): void {
    this._selectedService.set(service);
    // Reset dependent selections when service changes
    if (service !== this._selectedService()) {
      this.resetFromStep(1);
    }
  }

  // ========== EMPLOYEE MANAGEMENT ==========
  setSelectedEmployee(employee: EmployeeOption | null): void {
    this._selectedEmployee.set(employee);
    // Reset dependent selections when employee changes
    if (employee !== this._selectedEmployee()) {
      this.resetFromStep(2);
    }
  }

  // ========== DATE & TIME MANAGEMENT ==========
  setSelectedDate(date: Date | null): void {
    this._selectedDate.set(date);
    // Reset time slot when date changes
    this._selectedTimeSlot.set(null);
  }

  setSelectedTimeSlot(timeSlot: TimeSlot | null): void {
    this._selectedTimeSlot.set(timeSlot);
  }

  // ========== NOTES MANAGEMENT ==========
  setCustomerNotes(notes: string): void {
    this._customerNotes.set(notes);
  }

  // ========== RESERVATION MANAGEMENT ==========
  setReservationId(id: number | null): void {
    this._reservationId.set(id);
  }

  // ========== PRODUCT MANAGEMENT ==========
  setBookingProducts(products: CartItem[]): void {
    this._bookingProducts.set(products);
  }

  addBookingProduct(product: CartItem, quantity: number = 1): void {
    const currentProducts = this._bookingProducts();
    const currentQuantities = this._bookingQuantities();

    // Check if product already exists
    const existingProductIndex = currentProducts.findIndex(p => p.id === product.id);

    if (existingProductIndex >= 0) {
      // Update quantity
      this.updateProductQuantity(product.id, quantity);
    } else {
      // Add new product
      this._bookingProducts.set([...currentProducts, product]);
      this._bookingQuantities.set({
        ...currentQuantities,
        [product.id]: quantity
      });
    }
  }

  removeBookingProduct(productId: number): void {
    const currentProducts = this._bookingProducts();
    const currentQuantities = this._bookingQuantities();

    this._bookingProducts.set(currentProducts.filter(p => p.id !== productId));

    const updatedQuantities = { ...currentQuantities };
    delete updatedQuantities[productId];
    this._bookingQuantities.set(updatedQuantities);
  }

  updateProductQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeBookingProduct(productId);
      return;
    }

    const currentQuantities = this._bookingQuantities();
    this._bookingQuantities.set({
      ...currentQuantities,
      [productId]: quantity
    });
  }

  clearBookingProducts(): void {
    this._bookingProducts.set([]);
    this._bookingQuantities.set({});
  }

  // ========== BOOKING COMPLETION ==========
  completeBooking(): BookingOrder | null {
    const bookingData = this.currentBookingData();
    const reservationId = this._reservationId();

    if (!this.isBookingComplete() || !reservationId) {
      return null;
    }

    const bookingOrder: BookingOrder = {
      reservationId,
      bookingData,
      products: this._bookingProducts(),
      quantities: this._bookingQuantities(),
      totalAmount: this.bookingTotal(),
      createdAt: new Date()
    };

    // Add to completed bookings
    const currentBookings = this._completedBookings();
    this._completedBookings.set([...currentBookings, bookingOrder]);

    // Reset current booking state
    this.resetState();

    return bookingOrder;
  }

  // ========== STATE MANAGEMENT ==========
  resetFromStep(step: number): void {
    if (step <= 1) {
      this._selectedEmployee.set(null);
      this._selectedDate.set(null);
      this._selectedTimeSlot.set(null);
      this._customerNotes.set('');
      this._reservationId.set(null);
    } else if (step <= 2) {
      this._selectedDate.set(null);
      this._selectedTimeSlot.set(null);
      this._customerNotes.set('');
      this._reservationId.set(null);
    } else if (step <= 3) {
      this._customerNotes.set('');
      this._reservationId.set(null);
    }
  }

  resetState(): void {
    this._currentStep.set(1);
    this._selectedService.set(null);
    this._selectedEmployee.set(null);
    this._selectedDate.set(null);
    this._selectedTimeSlot.set(null);
    this._customerNotes.set('');
    this._reservationId.set(null);
    this._bookingProducts.set([]);
    this._bookingQuantities.set({});
  }

  // ========== UTILITY METHODS ==========
  getBookingById(reservationId: number): BookingOrder | null {
    const bookings = this._completedBookings();
    return bookings.find(b => b.reservationId === reservationId) || null;
  }

  getAllBookings(): BookingOrder[] {
    return this._completedBookings();
  }

  getBookingsByDateRange(startDate: Date, endDate: Date): BookingOrder[] {
    const bookings = this._completedBookings();
    return bookings.filter(booking => {
      const bookingDate = booking.bookingData.date;
      return bookingDate && bookingDate >= startDate && bookingDate <= endDate;
    });
  }

  getTotalBookingsCount(): number {
    return this._completedBookings().length;
  }

  getTotalBookingsRevenue(): number {
    const bookings = this._completedBookings();
    return bookings.reduce((total, booking) => total + booking.totalAmount, 0);
  }

  // ========== VALIDATION METHODS ==========
  validateCurrentStep(): boolean {
    const step = this._currentStep();

    switch (step) {
      case 1:
        return !!this._selectedService() && !!this._selectedEmployee();
      case 2:
        return !!this._selectedDate() && !!this._selectedTimeSlot();
      case 3:
        return true; // Step 3 is for confirmation, no additional validation needed
      default:
        return false;
    }
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    const step = this._currentStep();

    if (step >= 1 && !this._selectedService()) {
      errors.push('Debes seleccionar un servicio');
    }

    if (step >= 1 && !this._selectedEmployee()) {
      errors.push('Debes seleccionar un especialista');
    }

    if (step >= 2 && !this._selectedDate()) {
      errors.push('Debes seleccionar una fecha');
    }

    if (step >= 2 && !this._selectedTimeSlot()) {
      errors.push('Debes seleccionar un horario');
    }

    return errors;
  }

  // ========== DEBUG METHODS ==========
  getDebugInfo() {
    return {
      currentStep: this._currentStep(),
      selectedService: this._selectedService()?.serviceDTO?.serviceName || 'None',
      selectedEmployee: this._selectedEmployee() ?
        `${this._selectedEmployee()?.person?.name} ${this._selectedEmployee()?.person?.lastName}` : 'None',
      selectedDate: this._selectedDate()?.toISOString() || 'None',
      selectedTimeSlot: this._selectedTimeSlot() ?
        `${this._selectedTimeSlot()?.startTime} - ${this._selectedTimeSlot()?.endTime}` : 'None',
      reservationId: this._reservationId() || 'None',
      productsCount: this._bookingProducts().length,
      totalAmount: this.bookingTotal(),
      isComplete: this.isBookingComplete()
    };
  }
}
