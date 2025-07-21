export class ScheduleUtils {

  /**
   * Formatea la hora para mostrar (HH:mm)
   */
  static formatDisplayTime(timeString: string): string {
    return timeString.substring(0, 5); // "09:00:00" -> "09:00"
  }

  /**
   * Formatea la fecha para mostrar
   */
  static formatDisplayDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Verifica si un schedule es de hoy
   */
  static isToday(dateString: string): boolean {
    const scheduleDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    return scheduleDate.toDateString() === today.toDateString();
  }

  /**
   * Verifica si un schedule es del futuro
   */
  static isFuture(dateString: string, timeString?: string): boolean {
    const now = new Date();
    const scheduleDate = new Date(dateString + 'T' + (timeString || '00:00:00'));
    return scheduleDate > now;
  }

  /**
   * Obtiene el estado visual del schedule
   */
  static getScheduleStatusClass(scheduleState: string): string {
    switch (scheduleState.toUpperCase()) {
      case 'FREE':
        return 'status-free';
      case 'RESERVED':
        return 'status-reserved';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Obtiene el texto del estado del schedule
   */
  static getScheduleStatusText(scheduleState: string): string {
    switch (scheduleState.toUpperCase()) {
      case 'FREE':
        return 'Libre';
      case 'RESERVED':
        return 'Reservado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }
}
