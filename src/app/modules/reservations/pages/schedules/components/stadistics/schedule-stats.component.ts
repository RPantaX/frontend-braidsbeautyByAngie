// schedule-stats.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ScheduleService } from '../../../../../../core/services/reservations/schedule.service';
import { ResponseScheduleWithEmployee } from '../../../../../../shared/models/reservations/schedule.interface';

interface ScheduleStats {
  totalSchedules: number;
  freeSchedules: number;
  reservedSchedules: number;
  cancelledSchedules: number;
  employeeCount: number;
  todaySchedules: number;
  thisWeekSchedules: number;
}

@Component({
  selector: 'app-schedule-stats',
  templateUrl: './schedule-stats.component.html',
  styleUrls: ['./schedule-stats.component.scss']
})
export class ScheduleStatsComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);

  readonly loading = signal(false);
  readonly schedules = signal<ResponseScheduleWithEmployee[]>([]);

  readonly stats = computed(() => {
    const scheduleList = this.schedules();
    const uniqueEmployees = new Set(scheduleList.map(s => s.employeeDto?.id)).size;

    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = this.getStartOfWeek(new Date());
    const endOfWeek = this.getEndOfWeek(new Date());

    const todayCount = scheduleList.filter(s => s.scheduleDTO.scheduleDate === today).length;
    const weekCount = scheduleList.filter(s => {
      const scheduleDate = new Date(s.scheduleDTO.scheduleDate);
      return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
    }).length;

    return {
      totalSchedules: scheduleList.length,
      freeSchedules: scheduleList.filter(s => s.scheduleDTO.scheduleState === 'FREE').length,
      reservedSchedules: scheduleList.filter(s => s.scheduleDTO.scheduleState === 'RESERVED').length,
      cancelledSchedules: scheduleList.filter(s => s.scheduleDTO.scheduleState === 'CANCELLED').length,
      employeeCount: uniqueEmployees,
      todaySchedules: todayCount,
      thisWeekSchedules: weekCount
    } as ScheduleStats;
  });

  ngOnInit(): void {
    this.loadStats();

    // Refresh stats when schedules change
    this.scheduleService.refresh$.subscribe(() => {
      this.loadStats();
    });
  }

  private loadStats(): void {
    this.loading.set(true);

    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getEndOfWeek(date: Date): Date {
    const end = new Date(this.getStartOfWeek(date));
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  getUtilizationPercentage(): number {
    const stats = this.stats();
    if (stats.totalSchedules === 0) return 0;
    return Math.round((stats.reservedSchedules / stats.totalSchedules) * 100);
  }
}
