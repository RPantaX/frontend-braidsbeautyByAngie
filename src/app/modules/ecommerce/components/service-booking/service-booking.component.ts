import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  ServiceDetail,
  EmployeeOption,
  TimeSlot
} from '../../../../shared/models/ecommerce/ecommerce.interface';
interface TimePeriod {
  label: string;
  start: number;
  end: number;
  slots: TimeSlot[];
}
@Component({
  selector: 'app-service-booking',
  template: `
    <div class="service-booking">

      <!-- Booking Steps -->
      <div class="booking-steps">
        <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
          <div class="step-number">1</div>
          <span class="step-label">Seleccionar Especialista</span>
        </div>
        <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
          <div class="step-number">2</div>
          <span class="step-label">Elegir Fecha</span>
        </div>
        <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
          <div class="step-number">3</div>
          <span class="step-label">Seleccionar Horario</span>
        </div>
        <div class="step" [class.active]="currentStep >= 4">
          <div class="step-number">4</div>
          <span class="step-label">Confirmar</span>
        </div>
      </div>

      <!-- Step 1: Select Employee -->
      <div class="booking-step" *ngIf="currentStep === 1">
        <h3 class="step-title">Selecciona tu especialista</h3>
        <p class="step-description">Elige el profesional que realizará tu servicio</p>

        <div class="employees-grid" *ngIf="availableEmployees.length > 0">
          <div
            class="employee-card"
            *ngFor="let employee of availableEmployees"
            [class.selected]="selectedEmployee?.id === employee.id"
            (click)="selectEmployee(employee)">

            <div class="employee-avatar">
              <img
                [src]="'assets/images/employee-placeholder.jpg'"
                [alt]="employee.name" />
            </div>

            <div class="employee-info">
              <h4 class="employee-name">{{ employee.name }}</h4>
              <p class="employee-specialty" *ngIf="employee.specialty">
                {{ employee.specialty }}
              </p>
              <!--<div class="employee-rating" *ngIf="employee.rating">
                <p-rating
                  [(ngModel)]="employee.rating"
                  [readonly]="true"
                  [cancel]="false"
                  styleClass="employee-rating-stars">
                </p-rating>
                <span class="rating-text">{{ employee.rating.toFixed(1) }}</span>
              </div>
              <p class="employee-experience" *ngIf="employee.yearsExperience">
                {{ employee.yearsExperience }} años de experiencia
              </p> -->
            </div>

            <div class="selection-indicator" *ngIf="selectedEmployee?.id === employee.id">
              <i class="pi pi-check"></i>
            </div>
          </div>
        </div>

        <div class="no-employees" *ngIf="availableEmployees.length === 0">
          <i class="pi pi-users"></i>
          <h4>No hay especialistas disponibles</h4>
          <p>Por favor intenta más tarde o contacta con nosotros.</p>
        </div>
      </div>

      <!-- Step 2: Select Date -->
      <div class="booking-step" *ngIf="currentStep === 2">
        <h3 class="step-title">Selecciona la fecha</h3>
        <p class="step-description">Elige el día para tu cita con {{ selectedEmployee?.name }}</p>

        <div class="date-selection">
          <p-calendar
            [(ngModel)]="selectedDate"
            [inline]="true"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [disabledDates]="disabledDates"
            dateFormat="dd/mm/yy"
            (onSelect)="onDateSelect($event)"
            styleClass="booking-calendar">
          </p-calendar>

          <div class="date-info" *ngIf="selectedDate">
            <h4>Fecha seleccionada:</h4>
            <p class="selected-date">{{ formatSelectedDate() }}</p>
            <p class="availability-info">
              {{ getAvailableSlotsCount() }} horarios disponibles
            </p>
          </div>
        </div>
      </div>

      <!-- Step 3: Select Time -->
      <div class="booking-step" *ngIf="currentStep === 3">
        <h3 class="step-title">Selecciona el horario</h3>
        <p class="step-description">
          Horarios disponibles para {{ formatSelectedDate() }} con {{ selectedEmployee?.name }}
        </p>

        <div class="time-slots">
          <div class="time-period" *ngFor="let period of getTimeSlotsByPeriod()">
            <h4 class="period-title">{{ period.label }}</h4>
            <div class="slots-grid">
              <button
                *ngFor="let slot of period.slots"
                class="time-slot"
                [class.selected]="selectedTimeSlot === slot"
                [disabled]="!slot.available"
                (click)="selectTimeSlot(slot)">
                {{ slot.startTime }} - {{ slot.endTime }}
              </button>
            </div>
          </div>
        </div>

        <div class="no-slots" *ngIf="getAvailableSlots().length === 0">
          <i class="pi pi-calendar-times"></i>
          <h4>No hay horarios disponibles</h4>
          <p>Selecciona otra fecha o especialista.</p>
        </div>
      </div>

      <!-- Step 4: Confirmation -->
      <div class="booking-step" *ngIf="currentStep === 4">
        <h3 class="step-title">Confirma tu reserva</h3>
        <p class="step-description">Revisa los detalles de tu cita antes de confirmar</p>

        <div class="booking-summary">
          <div class="summary-card">
            <h4>Resumen de la cita</h4>

            <div class="summary-item">
              <span class="summary-label">Servicio:</span>
              <span class="summary-value">{{ service?.serviceDTO?.serviceName }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Especialista:</span>
              <span class="summary-value">{{ selectedEmployee?.name }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Fecha:</span>
              <span class="summary-value">{{ formatSelectedDate() }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Horario:</span>
              <span class="summary-value">
                {{ selectedTimeSlot?.startTime }} - {{ selectedTimeSlot?.endTime }}
              </span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Duración:</span>
              <span class="summary-value">{{ service?.serviceDTO!.durationTimeAprox | duration }}</span>
            </div>

            <div class="summary-item total">
              <span class="summary-label">Precio:</span>
              <span class="summary-value">{{ service?.serviceDTO!.servicePrice | price }}</span>
            </div>
          </div>

          <!-- Customer Notes -->
          <div class="customer-notes">
            <h4>Notas adicionales (opcional)</h4>
            <textarea
              pInputTextarea
              [(ngModel)]="customerNotes"
              placeholder="Comparte cualquier información adicional sobre tu cita..."
              rows="3"
              class="w-full">
            </textarea>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="booking-navigation">
        <p-button
          label="Anterior"
          icon="pi pi-arrow-left"
          [outlined]="true"
          [disabled]="currentStep === 1"
          (onClick)="previousStep()">
        </p-button>

        <p-button
          [label]="getNextButtonLabel()"
          [icon]="getNextButtonIcon()"
          [disabled]="!canProceedToNextStep()"
          (onClick)="nextStep()">
        </p-button>
      </div>

      <!-- Booking Help -->
      <div class="booking-help">
        <p-accordionTab header="¿Necesitas ayuda?">
          <div class="help-content">
            <div class="help-item">
              <i class="pi pi-phone"></i>
              <div>
                <h5>Llámanos</h5>
                <p>+51 123 456 789</p>
              </div>
            </div>
            <div class="help-item">
              <i class="pi pi-envelope"></i>
              <div>
                <h5>Envíanos un email</h5>
                <p>reservasangiebraids.com</p>
              </div>
            </div>
            <div class="help-item">
              <i class="pi pi-question-circle"></i>
              <div>
                <h5>Preguntas frecuentes</h5>
                <p>Consulta nuestras FAQ para resolver dudas comunes</p>
              </div>
            </div>
          </div>
        </p-accordionTab>
      </div>
    </div>
  `,
  //styleUrls: ['./service-booking.component.scss']
})
export class ServiceBookingComponent implements OnInit {
  @Input() service: ServiceDetail | null = null;
  @Input() availableEmployees: EmployeeOption[] = [];
  @Input() availableTimeSlots: TimeSlot[] = [];

  // Two-way binding properties
  @Input() selectedEmployee: EmployeeOption | null = null;
  @Output() selectedEmployeeChange = new EventEmitter<EmployeeOption | null>();

  @Input() selectedTimeSlot: TimeSlot | null = null;
  @Output() selectedTimeSlotChange = new EventEmitter<TimeSlot | null>();

  @Input() selectedDate: Date = new Date();
  @Output() selectedDateChange = new EventEmitter<Date>();

  // Legacy outputs for backward compatibility (deprecated)
  @Output() onEmployeeChange = new EventEmitter<EmployeeOption>();
  @Output() onTimeSlotChange = new EventEmitter<TimeSlot>();
  @Output() onDateChange = new EventEmitter<Date>();
  @Output() onBookAppointment = new EventEmitter<any>();

  currentStep = 1;
  customerNotes = '';
  minDate = new Date();
  maxDate: Date = new Date();
  disabledDates: Date[] = [];

  ngOnInit(): void {
    // Set max date to 3 months from now
    this.maxDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 3);

    // Initialize with first step
    if (this.availableEmployees.length > 0 && !this.selectedEmployee) {
      this.currentStep = 1;
    } else if (this.selectedEmployee) {
      this.currentStep = 2;
    }
  }

  /**
   * Select employee
   */
  selectEmployee(employee: EmployeeOption): void {
    this.selectedEmployee = employee;

    // Emit both new and legacy events
    this.selectedEmployeeChange.emit(employee);
    this.onEmployeeChange.emit(employee);
  }

  /**
   * Select time slot
   */
  selectTimeSlot(slot: TimeSlot): void {
    if (slot.available) {
      this.selectedTimeSlot = slot;

      // Emit both new and legacy events
      this.selectedTimeSlotChange.emit(slot);
      this.onTimeSlotChange.emit(slot);
    }
  }

  /**
   * Handle date selection
   */
  onDateSelect(date: Date): void {
    this.selectedDate = date;
    this.selectedTimeSlot = null; // Reset time slot when date changes

    // Emit both new and legacy events
    this.selectedDateChange.emit(date);
    this.selectedTimeSlotChange.emit(null);
    this.onDateChange.emit(date);
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    if (this.canProceedToNextStep()) {
      if (this.currentStep === 4) {
        this.confirmBooking();
      } else {
        this.currentStep++;
      }
    }
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Check if can proceed to next step
   */
  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.selectedEmployee;
      case 2:
        return !!this.selectedDate;
      case 3:
        return !!this.selectedTimeSlot;
      case 4:
        return true;
      default:
        return false;
    }
  }

  /**
   * Get next button label
   */
  getNextButtonLabel(): string {
    switch (this.currentStep) {
      case 1:
        return 'Continuar';
      case 2:
        return 'Seleccionar Horario';
      case 3:
        return 'Revisar';
      case 4:
        return 'Confirmar Reserva';
      default:
        return 'Siguiente';
    }
  }

  /**
   * Get next button icon
   */
  getNextButtonIcon(): string {
    return this.currentStep === 4 ? 'pi pi-check' : 'pi pi-arrow-right';
  }

  /**
   * Confirm booking
   */
  confirmBooking(): void {
    const bookingData = {
      service: this.service,
      employee: this.selectedEmployee,
      date: this.selectedDate,
      timeSlot: this.selectedTimeSlot,
      notes: this.customerNotes
    };

    this.onBookAppointment.emit(bookingData);
  }

  /**
   * Format selected date
   */
  formatSelectedDate(): string {
    if (!this.selectedDate) return '';

    return this.selectedDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get available slots for selected date and employee
   */
  getAvailableSlots(): TimeSlot[] {
    if (!this.selectedEmployee || !this.selectedDate) return [];

    return this.availableTimeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return (
        slot.employeeId === this.selectedEmployee!.id &&
        slotDate.toDateString() === this.selectedDate.toDateString() &&
        slot.available
      );
    });
  }

  /**
   * Get available slots count
   */
  getAvailableSlotsCount(): number {
    return this.getAvailableSlots().length;
  }

  /**
   * Get time slots grouped by period
   */
  getTimeSlotsByPeriod(): TimePeriod[] {
    const slots = this.getAvailableSlots();
    const periods: TimePeriod[] = [
      { label: 'Mañana', start: 6, end: 12, slots: [] as TimeSlot[] },
      { label: 'Tarde', start: 12, end: 18, slots: [] as TimeSlot[] },
      { label: 'Noche', start: 18, end: 24, slots: [] as TimeSlot[] }
    ];

    slots.forEach(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      const period = periods.find(p => hour >= p.start && hour < p.end);
      if (period) {
        period.slots.push(slot);
      }
    });

    return periods.filter(p => p.slots.length > 0);
  }
  getTimeSlotsByPeriodAlternative(): Array<{label: string, start: number, end: number, slots: TimeSlot[]}> {
    const slots = this.getAvailableSlots();
    const periods = [
      { label: 'Mañana', start: 6, end: 12, slots: [] as TimeSlot[] },
      { label: 'Tarde', start: 12, end: 18, slots: [] as TimeSlot[] },
      { label: 'Noche', start: 18, end: 24, slots: [] as TimeSlot[] }
    ];

    slots.forEach(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      const period = periods.find(p => hour >= p.start && hour < p.end);
      if (period) {
        period.slots.push(slot);
      }
    });

    return periods.filter(p => p.slots.length > 0);
  }
}
