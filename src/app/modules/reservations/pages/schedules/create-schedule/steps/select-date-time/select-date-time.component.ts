// select-date-time.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { startOfWeek, endOfWeek, format, addDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { RequestSchedule } from '../../../../../../../shared/models/reservations/schedule.interface';
import { ScheduleStateService } from '../../../../../../../core/services/reservations/schedule-state.service';
import { ScheduleService } from '../../../../../../../core/services/reservations/schedule.service';

interface TimeSlot {
  hour: number;
  minute: number;
  display: string;
}

interface WeekSchedule {
  date: Date;
  dayName: string;
  dayNumber: number;
  schedules: RequestSchedule[];
}

@Component({
  selector: 'app-select-date-time',
  templateUrl: './select-date-time.component.html',
  styleUrls: ['./select-date-time.component.scss']
})
export class SelectDateTimeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly scheduleState = inject(ScheduleStateService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly primengConfig = inject(PrimeNGConfig);

  readonly selectedEmployee = computed(() => this.scheduleState.selectedEmployee());
  readonly currentSchedules = computed(() => this.scheduleState.schedules());
  readonly loading = signal(false);
  readonly selectedDate = signal<Date | null>(null);
  readonly startTime = signal<TimeSlot | null>(null);
  readonly endTime = signal<TimeSlot | null>(null);

  // ✅ PASO 1: AÑADIR ESTADO PARA LA SEMANA VISIBLE
  readonly today = new Date();
  // Esta señal controla qué semana estamos viendo. Inicia con la fecha actual.
  readonly viewingDate = signal(new Date());

  // Week view
  readonly currentWeek = signal<WeekSchedule[]>([]);
  readonly weekRange = signal<string>('');
  timeForm: FormGroup;
  readonly timeSlots: TimeSlot[] = [];

  // Computed signal para deshabilitar el botón de "anterior"
  readonly isPreviousWeekDisabled = computed(() => {
    const startOfViewingWeek = startOfWeek(this.viewingDate(), { weekStartsOn: 1 });
    const startOfCurrentWeek = startOfWeek(this.today, { weekStartsOn: 1 });
    return !isBefore(startOfCurrentWeek, startOfViewingWeek);
  });

  constructor() {
    this.generateTimeSlots();
    // ✅ PASO 2: LLAMAR AL NUEVO MÉTODO DE ACTUALIZACIÓN
    this.updateWeekView();

    this.timeForm = this.fb.group({
      selectedDate: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.primengConfig.setTranslation({
        firstDayOfWeek: 1,
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        today: 'Hoy',
        clear: 'Limpiar'
    });
    // Redirect if no employee selected
    if (!this.selectedEmployee()) {
      this.router.navigate(['/schedules/create/select-employee']);
      return;
    }
  }

  private generateTimeSlots(): void {
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 20 && minute === 30) break; // Don't go past 20:00

        this.timeSlots.push({
          hour,
          minute,
          display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        });
      }
    }
  }

  private initializeWeek(): void {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

    const weekDays: WeekSchedule[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      weekDays.push({
        date,
        dayName: format(date, 'EEEE', { locale: es }),
        dayNumber: date.getDate(),
        schedules: []
      });
    }

    this.currentWeek.set(weekDays);
    this.weekRange.set(`${format(start, 'dd MMMM', { locale: es })} - ${format(end, 'dd MMMM', { locale: es })}`);
  }

  onDateSelect(date: Date): void {
    this.selectedDate.set(date);
    this.timeForm.patchValue({ selectedDate: date });
  }

  onStartTimeSelect(timeSlot: TimeSlot): void {
    this.startTime.set(timeSlot);
    this.timeForm.patchValue({ startTime: timeSlot });

    // Reset end time if it's before or equal to start time
    const currentEndTime = this.endTime();
    if (currentEndTime && this.compareTimeSlots(currentEndTime, timeSlot) <= 0) {
      this.endTime.set(null);
      this.timeForm.patchValue({ endTime: null });
    }
  }

  onEndTimeSelect(timeSlot: TimeSlot): void {
    const currentStartTime = this.startTime();
    if (!currentStartTime) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Primero selecciona la hora de inicio'
      });
      return;
    }

    if (this.compareTimeSlots(timeSlot, currentStartTime) <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La hora de fin debe ser posterior a la hora de inicio'
      });
      return;
    }

    this.endTime.set(timeSlot);
    this.timeForm.patchValue({ endTime: timeSlot });
  }
 // --- Lógica de la Vista Semanal (MODIFICADA) ---

  /**
   * ✅ PASO 2: REFACTORIZAR LA LÓGICA DE VISUALIZACIÓN
   * Este método ahora actualiza la vista de la semana basándose en `viewingDate`
   * y carga los horarios existentes desde el estado global.
   */
  private updateWeekView(): void {
    const baseDate = this.viewingDate();
    const start = startOfWeek(baseDate, { weekStartsOn: 1 });
    const end = endOfWeek(baseDate, { weekStartsOn: 1 });

    const allAddedSchedules = this.currentSchedules();
    const weekDays: WeekSchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(start, i);

      // Filtra los horarios del estado que corresponden a este día específico
      const schedulesForThisDay = allAddedSchedules.filter(s =>
         new Date(s.scheduleDate + 'T00:00:00').toDateString() === dayDate.toDateString()
      );

      weekDays.push({
        date: dayDate,
        dayName: format(dayDate, 'EEEE', { locale: es }),
        dayNumber: dayDate.getDate(),
        schedules: schedulesForThisDay.sort((a,b) => a.scheduleHourStart.localeCompare(b.scheduleHourStart)) // Opcional: ordenar
      });
    }

    this.currentWeek.set(weekDays);
    this.weekRange.set(`${format(start, 'd MMMM', { locale: es })} - ${format(end, 'd MMMM yyyy', { locale: es })}`);
  }

  /**
   * ✅ PASO 3: MÉTODOS DE NAVEGACIÓN
   */
  nextWeek(): void {
    this.viewingDate.update(currentDate => addDays(currentDate, 7));
    this.updateWeekView();
  }

  previousWeek(): void {
    if (this.isPreviousWeekDisabled()) return; // Doble chequeo por si acaso
    this.viewingDate.update(currentDate => addDays(currentDate, -7));
    this.updateWeekView();
  }
  addSchedule(): void {
    if (!this.timeForm.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor completa todos los campos'
      });
      return;
    }

    const formValue = this.timeForm.value;
    const employee = this.selectedEmployee();

    if (!employee) return;

    const schedule: RequestSchedule = {
      scheduleDate: this.scheduleService.formatDateForBackend(formValue.selectedDate),
      scheduleHourStart: formValue.startTime.display + ':00',
      scheduleHourEnd: formValue.endTime.display + ':00',
      employeeId: employee.id
    };

    // Check for conflicts
    if (this.hasScheduleConflict(schedule)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Conflicto de horario',
        detail: 'Ya existe un horario que se superpone con el seleccionado'
      });
      return;
    }

    this.scheduleState.addSchedule(schedule);
    this.addScheduleToWeekView(schedule);

    // ✅ PASO 4: ACTUALIZAR LA VISTA
    // Refresca la vista de la semana para mostrar el nuevo horario
    this.updateWeekView();
    // Reset form
    this.selectedDate.set(null);
    this.startTime.set(null);
    this.endTime.set(null);
    this.timeForm.reset();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Horario agregado correctamente'
    });
  }
  removeScheduleByIndex(scheduleToRemove: RequestSchedule): void {
    const allSchedules = this.currentSchedules();
    // Encuentra el índice del horario que coincida en fecha y hora
    const index = allSchedules.findIndex(s =>
        s.scheduleDate === scheduleToRemove.scheduleDate &&
        s.scheduleHourStart === scheduleToRemove.scheduleHourStart &&
        s.scheduleHourEnd === scheduleToRemove.scheduleHourEnd
    );

    // Si se encuentra el índice, se procede a eliminar
     if (index !== -1) {
          this.scheduleState.removeSchedule(index);
          // ✅ PASO 4: ACTUALIZAR LA VISTA
          // Refresca la vista para reflejar la eliminación
          this.updateWeekView();

          this.messageService.add({
              severity: 'info', summary: 'Eliminado', detail: 'Horario eliminado'
          });
      }
  }
  removeSchedule(index: number): void {
    const scheduleToRemove = this.currentSchedules()[index];
    this.scheduleState.removeSchedule(index);
    this.removeScheduleFromWeekView(scheduleToRemove);

    this.messageService.add({
      severity: 'info',
      summary: 'Eliminado',
      detail: 'Horario eliminado'
    });
  }

  private addScheduleToWeekView(schedule: RequestSchedule): void {
    const scheduleDate = new Date(schedule.scheduleDate + 'T00:00:00');
    const weekDays = this.currentWeek();

    const dayIndex = weekDays.findIndex(day =>
      day.date.toDateString() === scheduleDate.toDateString()
    );

    if (dayIndex !== -1) {
      weekDays[dayIndex].schedules.push(schedule);
      this.currentWeek.set([...weekDays]);
    }
  }

  private removeScheduleFromWeekView(schedule: RequestSchedule): void {
    const scheduleDate = new Date(schedule.scheduleDate + 'T00:00:00');
    const weekDays = this.currentWeek();

    const dayIndex = weekDays.findIndex(day =>
      day.date.toDateString() === scheduleDate.toDateString()
    );

    if (dayIndex !== -1) {
      weekDays[dayIndex].schedules = weekDays[dayIndex].schedules.filter(s =>
        !(s.scheduleDate === schedule.scheduleDate &&
          s.scheduleHourStart === schedule.scheduleHourStart &&
          s.scheduleHourEnd === schedule.scheduleHourEnd)
      );
      this.currentWeek.set([...weekDays]);
    }
  }

  private hasScheduleConflict(newSchedule: RequestSchedule): boolean {
    const existing = this.currentSchedules();

    return existing.some(schedule => {
      if (schedule.scheduleDate !== newSchedule.scheduleDate) return false;

      const existingStart = this.timeStringToMinutes(schedule.scheduleHourStart);
      const existingEnd = this.timeStringToMinutes(schedule.scheduleHourEnd);
      const newStart = this.timeStringToMinutes(newSchedule.scheduleHourStart);
      const newEnd = this.timeStringToMinutes(newSchedule.scheduleHourEnd);

      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  private compareTimeSlots(time1: TimeSlot, time2: TimeSlot): number {
    const minutes1 = time1.hour * 60 + time1.minute;
    const minutes2 = time2.hour * 60 + time2.minute;
    return minutes1 - minutes2;
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatScheduleTime(schedule: RequestSchedule): string {
    const start = schedule.scheduleHourStart.substring(0, 5);
    const end = schedule.scheduleHourEnd.substring(0, 5);
    return `${start} - ${end}`;
  }

  isDateSelected(date: Date): boolean {
    const selected = this.selectedDate();
    return selected ? selected.toDateString() === date.toDateString() : false;
  }

  isTimeSlotSelected(timeSlot: TimeSlot, type: 'start' | 'end'): boolean {
    const selected = type === 'start' ? this.startTime() : this.endTime();
    return selected ? selected.display === timeSlot.display : false;
  }

  canProceed(): boolean {
    return this.currentSchedules().length > 0;
  }

  proceedToNextStep(): void {
    if (!this.canProceed()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Agrega al menos un horario para continuar'
      });
      return;
    }

    this.router.navigate(['/reservations/schedules/create/confirmation']);
  }

  goBack(): void {
    this.router.navigate(['/reservations/schedules/create/select-employee']);
  }
}
