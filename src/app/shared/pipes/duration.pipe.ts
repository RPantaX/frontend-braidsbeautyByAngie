import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: string | number, format: 'short' | 'long' = 'short'): string {
    if (!value) return '';

    let totalMinutes: number;

    if (typeof value === 'string') {
      // Handle time format "HH:mm:ss" or "HH:mm"
      if (value.includes(':')) {
        const timeParts = value.split(':');
        const hours = parseInt(timeParts[0]) || 0;
        const minutes = parseInt(timeParts[1]) || 0;
        totalMinutes = hours * 60 + minutes;
      } else {
        // Handle string number
        totalMinutes = parseInt(value) || 0;
      }
    } else {
      // Handle numeric value (assuming minutes)
      totalMinutes = value;
    }

    if (totalMinutes === 0) return '';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (format === 'long') {
      if (hours > 0) {
        if (minutes > 0) {
          return `${hours} hora${hours !== 1 ? 's' : ''} y ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        } else {
          return `${hours} hora${hours !== 1 ? 's' : ''}`;
        }
      } else {
        return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      }
    } else {
      // Short format
      if (hours > 0) {
        if (minutes > 0) {
          return `${hours}h ${minutes}min`;
        } else {
          return `${hours}h`;
        }
      } else {
        return `${minutes}min`;
      }
    }
  }
}
