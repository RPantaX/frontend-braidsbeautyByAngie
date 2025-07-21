import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { ScheduleStateService } from '../../../../../core/services/reservations/schedule-state.service';

@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.scss'],
  providers: [MessageService]
})
export class CreateScheduleComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly scheduleState = inject(ScheduleStateService);
  private readonly messageService = inject(MessageService);

  readonly items = signal<MenuItem[]>([]);
  readonly activeIndex = signal(0);

  ngOnInit(): void {
    this.initializeSteps();
    this.updateActiveStep();

    // Listen to route changes to update active step
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveStep();
    });
  }

  private initializeSteps(): void {
    this.items.set([
      {
        label: 'Seleccionar Trabajador',
        routerLink: '/reservations/schedules/create/select-employee',
        command: () => this.scheduleState.setCurrentStep(0)
      },
      {
        label: 'Seleccionar Horarios',
        routerLink: '/reservations/schedules/create/select-datetime',
        command: () => this.scheduleState.setCurrentStep(1)
      },
      {
        label: 'Confirmación',
        routerLink: '/reservations/schedules/create/confirmation',
        command: () => this.scheduleState.setCurrentStep(2)
      }
    ]);
  }

  private updateActiveStep(): void {
    const url = this.router.url;
    if (url.includes('select-employee')) {
      this.activeIndex.set(0);
      this.scheduleState.setCurrentStep(0);
    } else if (url.includes('select-datetime')) {
      this.activeIndex.set(1);
      this.scheduleState.setCurrentStep(1);
    } else if (url.includes('confirmation')) {
      this.activeIndex.set(2);
      this.scheduleState.setCurrentStep(2);
    }
  }

  onStepChange(event: any): void {
    this.activeIndex.set(event.index);
  }
}
