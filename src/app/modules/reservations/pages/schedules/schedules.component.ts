import { Component } from '@angular/core';

@Component({
  selector: 'app-schedules',
  template: `
    <div class="schedule-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .schedule-layout {
      height: 100%;
      overflow-y: auto;
    }
  `]
})
export class SchedulesComponent { }
