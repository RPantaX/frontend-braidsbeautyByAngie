// confirmation.component.ts
import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ScheduleStateService } from '../../../../../../core/services/reservations/schedule-state.service';
import { ScheduleService } from '../../../../../../core/services/reservations/schedule.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  private readonly scheduleState = inject(ScheduleStateService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly selectedEmployee = computed(() => this.scheduleState.selectedEmployee());
  readonly schedules = computed(() => this.scheduleState.schedules());
  readonly loading = signal(false);
  readonly success = signal(false);

  readonly confirmationDate = new Date().toLocaleDateString('es-ES');
  ngOnInit(): void {
    // Redirect if no employee or schedules
    if (!this.selectedEmployee() || this.schedules().length === 0) {
      this.router.navigate(['/schedules/create/select-employee']);
      return;
    }

    this.createSchedules();
  }

  private createSchedules(): void {
    this.loading.set(true);
    const schedules = this.schedules();

    // Create all schedules in parallel
    const createRequests = schedules.map(schedule =>
      this.scheduleService.createSchedule(schedule)
    );

    forkJoin(createRequests).subscribe({
      next: (results) => {
        this.loading.set(false);
        this.success.set(true);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${results.length} horario(s) creado(s) correctamente`
        });

        // Trigger refresh in schedule service
        this.scheduleService.refreshServices();
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear los horarios'
        });
      }
    });
  }

  formatTime(timeString: string): string {
    return timeString?.substring(0, 5) || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  returnToEmployeeSelection(): void {
    this.scheduleState.resetState();
    this.router.navigate(['/schedules/create/select-employee']);
  }

  goToSchedulesList(): void {
    this.scheduleState.resetState();
    this.router.navigate(['/schedules']);
  }
}
