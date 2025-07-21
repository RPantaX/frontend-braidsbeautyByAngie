// csv-export.service.ts
import { Injectable } from '@angular/core';
import { ResponseScheduleWithEmployee } from '../../../shared/models/reservations/schedule.interface';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  exportSchedulesToCsv(schedules: ResponseScheduleWithEmployee[], filename: string = 'horarios'): void {
    const csvData = this.convertToCsv(schedules);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private convertToCsv(schedules: ResponseScheduleWithEmployee[]): string {
    const headers = [
      'ID',
      'Empleado',
      'Email',
      'Tipo',
      'Fecha',
      'Hora Inicio',
      'Hora Fin',
      'Estado',
      'Teléfono'
    ];

    const csvArray = [headers.join(',')];

    schedules.forEach(schedule => {
      const row = [
        schedule.scheduleDTO.scheduleId,
        `"${schedule.employeeDto?.person?.name || ''} ${schedule.employeeDto?.person?.lastName || ''}"`,
        schedule.employeeDto?.person?.emailAddress || '',
        schedule.employeeDto?.employeeType?.value || '',
        schedule.scheduleDTO.scheduleDate,
        schedule.scheduleDTO.scheduleHourStart,
        schedule.scheduleDTO.scheduleHourEnd,
        schedule.scheduleDTO.scheduleState,
        schedule.employeeDto?.person?.phoneNumber || ''
      ];
      csvArray.push(row.join(','));
    });

    return csvArray.join('\n');
  }
}
