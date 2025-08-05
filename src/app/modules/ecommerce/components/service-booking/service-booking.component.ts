// service-booking.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Services
import { ScheduleService } from '../../../../core/services/reservations/schedule.service';
import { ReservationService } from '../../../../core/services/reservations/reservation.service';

// Interfaces
import { ServiceDetail, EmployeeOption, TimeSlot } from '../../../../shared/models/ecommerce/ecommerce.interface';
import { ResponseScheduleWithEmployee } from '../../../../shared/models/reservations/schedule.interface';
import { RequestReservation } from '../../../../shared/models/reservations/reservation.interface';
import { EmployeeDto } from '../../../../shared/models/users/employee.interface';

interface BookingData {
  service: ServiceDetail | null;
  employee: EmployeeDto | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
  notes: string;
  reservationId?: number;
}

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
        <div class="step" [class.active]="currentStep() >= 1" [class.completed]="currentStep() > 1">
          <div class="step-number">1</div>
          <span class="step-label">Seleccionar Especialista</span>
        </div>
        <div class="step" [class.active]="currentStep() >= 2" [class.completed]="currentStep() > 2">
          <div class="step-number">2</div>
          <span class="step-label">Seleccionar Horario</span>
        </div>
        <div class="step" [class.active]="currentStep() >= 3">
          <div class="step-number">3</div>
          <span class="step-label">Confirmar Reserva</span>
        </div>
      </div>

      <!-- Step 1: Select Employee -->
      <div class="booking-step" *ngIf="currentStep() === 1">
        <h3 class="step-title">Selecciona tu especialista</h3>
        <p class="step-description">Elige el profesional que realizará tu servicio</p>

        <!-- Loading State -->
        <div class="loading-container" *ngIf="loading()">
          <p-progressSpinner></p-progressSpinner>
          <p>Cargando especialistas disponibles...</p>
        </div>

        <!-- Employee Grid -->
        <div class="employees-grid" *ngIf="!loading() && availableEmployees().length > 0">
          <div class="employee-card"
               *ngFor="let employee of availableEmployees()"
               [class.selected]="selectedEmployee()?.id === employee.employeeDto.id"
               (click)="selectEmployee(employee.employeeDto)">

            <div class="employee-avatar">
              <img [src]="employee.employeeDto.employeeImage || 'assets/images/employee-placeholder.jpg'"
                   [alt]="employee.employeeDto.person?.name" />
            </div>

            <div class="employee-info">
              <h4 class="employee-name">
                {{ employee.employeeDto.person?.name }} {{ employee.employeeDto.person?.lastName }}
              </h4>
              <p class="employee-specialty">
                {{ employee.employeeDto.employeeType?.value }}
              </p>
              <p class="employee-email">
                {{ employee.employeeDto.person?.emailAddress }}
              </p>
            </div>

            <div class="selection-indicator" *ngIf="selectedEmployee()?.id === employee.employeeDto.id">
              <i class="pi pi-check"></i>
            </div>
          </div>
        </div>

        <!-- No Employees -->
        <div class="no-employees" *ngIf="!loading() && availableEmployees().length === 0">
          <i class="pi pi-users"></i>
          <h4>No hay especialistas disponibles</h4>
          <p>Por favor intenta más tarde o contacta con nosotros.</p>
        </div>
      </div>

      <!-- Step 2: Select Date and Time -->
      <div class="booking-step" *ngIf="currentStep() === 2">
        <h3 class="step-title">Selecciona fecha y horario</h3>
        <p class="step-description">
          Elige el día y hora para tu cita con {{ selectedEmployee()?.person?.name }}
        </p>

        <!-- Employee Preview -->
        <div class="employee-preview">
          <img [src]="selectedEmployee()?.employeeImage || 'assets/images/employee-placeholder.jpg'"
               [alt]="selectedEmployee()?.person?.name" class="employee-avatar-small" />
          <div class="employee-details">
            <h4>{{ selectedEmployee()?.person?.name }} {{ selectedEmployee()?.person?.lastName }}</h4>
            <p>{{ selectedEmployee()?.employeeType?.value }}</p>
          </div>
        </div>

        <!-- Date Selection -->
        <div class="date-time-selection">
          <div class="date-section">
            <h4>Selecciona la fecha</h4>
            <p-calendar
              [(ngModel)]="selectedDate"
              [inline]="true"
              [minDate]="minDate"
              [maxDate]="maxDate"
              dateFormat="dd/mm/yy"
              (onSelect)="onDateSelect($event)">
            </p-calendar>
          </div>

          <!-- Time Slots -->
          <div class="time-section" *ngIf="selectedDate()">
            <h4>Horarios disponibles - {{ formatSelectedDate() }}</h4>

            <!-- Loading Time Slots -->
            <div class="loading-container" *ngIf="loadingTimeSlots()">
              <p-progressSpinner [style]="{'width': '30px', 'height': '30px'}"></p-progressSpinner>
              <p>Cargando horarios disponibles...</p>
            </div>

            <!-- Time Slots by Period -->
            <div class="time-slots" *ngIf="!loadingTimeSlots()">
              <div class="time-period" *ngFor="let period of getTimeSlotsByPeriod()">
                <h5 class="period-title">{{ period.label }}</h5>
                <div class="slots-grid">
                  <button *ngFor="let slot of period.slots"
                          class="time-slot"
                          [class.selected]="selectedTimeSlot()?.startTime === slot.startTime && selectedTimeSlot()?.endTime === slot.endTime"
                          [disabled]="!slot.available"
                          (click)="selectTimeSlot(slot)">
                    {{ slot.startTime }} - {{ slot.endTime }}
                  </button>
                </div>
              </div>
            </div>

            <!-- No Slots Available -->
            <div class="no-slots" *ngIf="!loadingTimeSlots() && getAvailableSlots().length === 0">
              <i class="pi pi-calendar-times"></i>
              <h4>No hay horarios disponibles</h4>
              <p>Selecciona otra fecha para ver horarios disponibles.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Confirmation -->
      <div class="booking-step" *ngIf="currentStep() === 3">
        <h3 class="step-title">Confirma tu reserva</h3>
        <p class="step-description">Revisa los detalles de tu cita antes de confirmar</p>

        <!-- Processing State -->
        <div class="processing-reservation" *ngIf="processingReservation()">
          <p-progressSpinner></p-progressSpinner>
          <h4>Procesando tu reserva...</h4>
          <p>Por favor espera mientras confirmamos tu cita.</p>
        </div>

        <!-- Success State -->
        <div class="reservation-success" *ngIf="reservationCompleted()">
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h4>¡Reserva confirmada!</h4>
          <p>Tu cita ha sido reservada exitosamente.</p>
          <div class="reservation-id">
            <strong>ID de Reserva: #{{ reservationId() }}</strong>
          </div>
        </div>

        <!-- Booking Summary -->
        <div class="booking-summary" *ngIf="!processingReservation() && !reservationCompleted()">
          <div class="summary-card">
            <h4>Resumen de la cita</h4>

            <div class="summary-item">
              <span class="summary-label">Servicio:</span>
              <span class="summary-value">{{ service?.serviceDTO?.serviceName }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Especialista:</span>
              <span class="summary-value">
                {{ selectedEmployee()?.person?.name }} {{ selectedEmployee()?.person?.lastName }}
              </span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Fecha:</span>
              <span class="summary-value">{{ formatSelectedDate() }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Horario:</span>
              <span class="summary-value">
                {{ selectedTimeSlot()?.startTime }} - {{ selectedTimeSlot()?.endTime }}
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
      <div class="booking-navigation" *ngIf="!reservationCompleted()">
        <p-button
          label="Anterior"
          icon="pi pi-arrow-left"
          [outlined]="true"
          [disabled]="currentStep() === 1 || processingReservation()"
          (onClick)="previousStep()">
        </p-button>

        <p-button
          [label]="getNextButtonLabel()"
          [icon]="getNextButtonIcon()"
          [loading]="processingReservation()"
          [disabled]="!canProceedToNextStep()"
          (onClick)="nextStep()">
        </p-button>
      </div>

      <!-- Completed Actions -->
      <div class="completed-actions" *ngIf="reservationCompleted()">
        <p-button
          label="Nueva Reserva"
          icon="pi pi-plus"
          (onClick)="startNewReservation()">
        </p-button>

        <p-button
          label="Ver Detalles"
          icon="pi pi-eye"
          [outlined]="true"
          (onClick)="viewReservationDetails()">
        </p-button>
      </div>

      <!-- Booking Help -->
      <div class="booking-help" *ngIf="!reservationCompleted()">
        <p-accordion>
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
            </div>
          </p-accordionTab>
        </p-accordion>
      </div>
    </div>
  `,
  styleUrls: ['./service-booking.component.scss']
})
export class ServiceBookingComponent implements OnInit, OnDestroy {
  // Services
  private readonly scheduleService = inject(ScheduleService);
  private readonly reservationService = inject(ReservationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Input properties
  @Input() service: ServiceDetail | null = null;

  // Output events
  @Output() onReservationComplete = new EventEmitter<{reservationId: number, bookingData: BookingData}>();

  // Reactive signals
  readonly currentStep = signal(1);
  readonly loading = signal(false);
  readonly loadingTimeSlots = signal(false);
  readonly processingReservation = signal(false);
  readonly reservationCompleted = signal(false);
  readonly reservationId = signal<number | null>(null);

  readonly availableEmployees = signal<ResponseScheduleWithEmployee[]>([]);
  readonly selectedEmployee = signal<EmployeeDto | null>(null);
  readonly selectedDate = signal<Date | null>(null);
  readonly selectedTimeSlot = signal<TimeSlot | null>(null);
  readonly availableTimeSlots = signal<TimeSlot[]>([]);

  // Other properties
  customerNotes = '';
  minDate = new Date();
  maxDate: Date = new Date();

  constructor() {
    // Set max date to 3 months from now
    this.maxDate.setMonth(this.maxDate.getMonth() + 3);
  }

  ngOnInit(): void {
    this.loadAvailableEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * PASO 1: Cargar empleados disponibles con horarios desde hoy en adelante
   */
  private loadAvailableEmployees(): void {
    this.loading.set(true);
    const today = this.scheduleService.formatDateForBackend(new Date());

    this.scheduleService.getSchedulesFromDate(today)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => {
          // Filtrar solo empleados que tienen horarios asignados
          const uniqueEmployees = this.getUniqueEmployeesWithSchedules(schedules);
          this.availableEmployees.set(uniqueEmployees);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar especialistas disponibles'
          });
          this.loading.set(false);
        }
      });
  }

  /**
   * Obtener empleados únicos que tienen horarios
   */
  private getUniqueEmployeesWithSchedules(schedules: ResponseScheduleWithEmployee[]): ResponseScheduleWithEmployee[] {
    const employeeMap = new Map<number, ResponseScheduleWithEmployee>();

    schedules.forEach(schedule => {
      if (!employeeMap.has(schedule.employeeDto.id)) {
        employeeMap.set(schedule.employeeDto.id, schedule);
      }
    });

    return Array.from(employeeMap.values());
  }

  /**
   * Seleccionar empleado
   */
  selectEmployee(employee: EmployeeDto): void {
    this.selectedEmployee.set(employee);
    // Reset selections when changing employee
    this.selectedDate.set(null);
    this.selectedTimeSlot.set(null);
    this.availableTimeSlots.set([]);
  }

  /**
   * PASO 2: Manejar selección de fecha y cargar horarios
   */
  onDateSelect(date: Date): void {
    this.selectedDate.set(date);
    this.selectedTimeSlot.set(null);
    this.loadAvailableTimeSlots(date);
  }

  /**
   * Cargar horarios disponibles para la fecha y empleado seleccionados
   */
  private loadAvailableTimeSlots(date: Date): void {
    const employee = this.selectedEmployee();
    if (!employee || !date) return;

    this.loadingTimeSlots.set(true);
    const dateString = this.scheduleService.formatDateForBackend(date);

    this.scheduleService.getSchedulesBySpecificDate(dateString)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => {
          // Filtrar horarios del empleado seleccionado para la fecha específica
          const employeeSchedules = schedules.filter(s => s.employeeDto.id === employee.id);

          // Convertir a TimeSlots
          const timeSlots = this.convertSchedulesToTimeSlots(employeeSchedules, date);
          this.availableTimeSlots.set(timeSlots);
          this.loadingTimeSlots.set(false);
        },
        error: (error) => {
          console.error('Error loading time slots:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar horarios disponibles'
          });
          this.loadingTimeSlots.set(false);
        }
      });
  }

  /**
   * Convertir schedules a TimeSlots
   */
  private convertSchedulesToTimeSlots(schedules: ResponseScheduleWithEmployee[], date: Date): TimeSlot[] {
    return schedules.map((schedule, index) => ({
      id: `slot-${schedule.scheduleDTO.scheduleId}`,
      startTime: schedule.scheduleDTO.scheduleHourStart.substring(0, 5),
      endTime: schedule.scheduleDTO.scheduleHourEnd.substring(0, 5),
      date: date,
      available: schedule.scheduleDTO.scheduleState === 'FREE', // Asumiendo que tienes este estado
      employeeId: schedule.employeeDto.id,
      employeeName: schedule.employeeDto.employeeName!,
      scheduleId: schedule.scheduleDTO.scheduleId
    }));
  }

  /**
   * Seleccionar horario
   */
  selectTimeSlot(slot: TimeSlot): void {
    if (slot.available) {
      this.selectedTimeSlot.set(slot);
    }
  }

  /**
   * Navegación entre pasos
   */
  nextStep(): void {
    if (this.canProceedToNextStep()) {
      if (this.currentStep() === 3) {
        this.confirmBooking();
      } else {
        this.currentStep.update(step => step + 1);
      }
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  /**
   * Validar si puede proceder al siguiente paso
   */
  canProceedToNextStep(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!this.selectedEmployee();
      case 2:
        return !!this.selectedDate() && !!this.selectedTimeSlot();
      case 3:
        return true;
      default:
        return false;
    }
  }

  /**
   * PASO 3: Confirmar reserva y guardar
   */
  confirmBooking(): void {
    const employee = this.selectedEmployee();
    const timeSlot = this.selectedTimeSlot();

    if (!this.service || !employee || !timeSlot) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Faltan datos para completar la reserva'
      });
      return;
    }

    this.processingReservation.set(true);

    // Crear la reserva
    const reservationRequest: RequestReservation = {
      scheduleId: this.selectedTimeSlot()?.scheduleId!,
      serviceId: this.service.serviceDTO!.serviceId
    };

    this.reservationService.createReservation([reservationRequest])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reservation) => {
          this.reservationId.set(reservation.reservationId);
          this.processingReservation.set(false);
          this.reservationCompleted.set(true);

          // Emitir evento con los datos de la reserva
          const bookingData: BookingData = {
            service: this.service,
            employee: employee,
            date: this.selectedDate(),
            timeSlot: timeSlot,
            notes: this.customerNotes,
            reservationId: reservation.reservationId
          };

          this.onReservationComplete.emit({
            reservationId: reservation.reservationId,
            bookingData: bookingData
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Reserva Confirmada',
            detail: `Tu cita ha sido reservada exitosamente. ID: #${reservation.reservationId}`
          });
        },
        error: (error) => {
          console.error('Error creating reservation:', error);
          this.processingReservation.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo confirmar la reserva. Inténtalo de nuevo.'
          });
        }
      });
  }

  /**
   * Utility methods
   */
  getNextButtonLabel(): string {
    switch (this.currentStep()) {
      case 1:
        return 'Continuar';
      case 2:
        return 'Revisar';
      case 3:
        return 'Confirmar Reserva';
      default:
        return 'Siguiente';
    }
  }

  getNextButtonIcon(): string {
    return this.currentStep() === 3 ? 'pi pi-check' : 'pi pi-arrow-right';
  }

  formatSelectedDate(): string {
    const date = this.selectedDate();
    if (!date) return '';

    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAvailableSlots(): TimeSlot[] {
    return this.availableTimeSlots().filter(slot => slot.available);
  }

  getTimeSlotsByPeriod(): TimePeriod[] {
    const slots = this.getAvailableSlots();
    const periods: TimePeriod[] = [
      { label: 'Mañana', start: 6, end: 12, slots: [] },
      { label: 'Tarde', start: 12, end: 18, slots: [] },
      { label: 'Noche', start: 18, end: 24, slots: [] }
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

  /**
   * Actions después de completar la reserva
   */
  startNewReservation(): void {
    // Reset all state
    this.currentStep.set(1);
    this.selectedEmployee.set(null);
    this.selectedDate.set(null);
    this.selectedTimeSlot.set(null);
    this.availableTimeSlots.set([]);
    this.reservationCompleted.set(false);
    this.reservationId.set(null);
    this.customerNotes = '';

    // Reload employees
    this.loadAvailableEmployees();
  }

  viewReservationDetails(): void {
    const resId = this.reservationId();
    if (resId) {
      this.router.navigate(['/reservations', resId]);
    }
  }
}
