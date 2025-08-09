// checkout-reservation.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ReservationService } from '../reservations/reservation.service';
import { RequestReservation } from '../../../shared/models/reservations/reservation.interface';

export interface ServiceReservationData {
  serviceId: number;
  serviceName: string;
  scheduleId: number;
  employeeId: number;
  employeeName: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  price: number;
  duration: string;
  notes?: string;
}

export interface PendingReservation {
  id: string; // Unique identifier for the reservation
  services: ServiceReservationData[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutReservationService {

  // Signal para manejar las reservas pendientes
  private pendingReservations = signal<PendingReservation[]>([]);

  // BehaviorSubject para la reserva actual del checkout
  private currentCheckoutReservation = new BehaviorSubject<PendingReservation | null>(null);
  public currentCheckoutReservation$ = this.currentCheckoutReservation.asObservable();

  constructor(private reservationService: ReservationService) {}

  /**
   * Crear una nueva reserva pendiente para el checkout
   */
  createPendingReservation(services: ServiceReservationData[]): PendingReservation {
    const reservationId = this.generateReservationId();
    const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

    const pendingReservation: PendingReservation = {
      id: reservationId,
      services: services,
      totalPrice: totalPrice,
      status: 'pending'
    };

    // Guardar en el estado local
    const current = this.pendingReservations();
    this.pendingReservations.set([...current, pendingReservation]);

    // Establecer como reserva actual del checkout
    this.currentCheckoutReservation.next(pendingReservation);

    // Guardar en localStorage para persistencia
    this.savePendingReservationToStorage(pendingReservation);

    return pendingReservation;
  }

  /**
   * Confirmar una reserva pendiente (llamar al backend)
   */
  confirmReservation(reservationId: string): Observable<{ reservationId: number }> {
    const pendingReservation = this.getPendingReservation(reservationId);

    if (!pendingReservation) {
      throw new Error('Reserva pendiente no encontrada');
    }

    // Crear las requests para el backend
    const reservationRequests: RequestReservation[] = pendingReservation.services.map(service => ({
      scheduleId: service.scheduleId,
      serviceId: service.serviceId
    }));

    // Llamar al servicio de reservas
    return new Observable(observer => {
      this.reservationService.createReservation(reservationRequests).subscribe({
        next: (response) => {
          // Actualizar estado de la reserva
          this.updateReservationStatus(reservationId, 'confirmed');

          // Limpiar del localStorage
          this.removePendingReservationFromStorage(reservationId);

          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          // Actualizar estado como fallida
          this.updateReservationStatus(reservationId, 'failed');
          observer.error(error);
        }
      });
    });
  }

  /**
   * Obtener reserva pendiente por ID
   */
  getPendingReservation(reservationId: string): PendingReservation | null {
    return this.pendingReservations().find(r => r.id === reservationId) || null;
  }

  /**
   * Obtener la reserva actual del checkout
   */
  getCurrentCheckoutReservation(): PendingReservation | null {
    return this.currentCheckoutReservation.value;
  }

  /**
   * Limpiar reserva actual del checkout
   */
  clearCurrentCheckoutReservation(): void {
    this.currentCheckoutReservation.next(null);
  }

  /**
   * Actualizar estado de una reserva
   */
  private updateReservationStatus(reservationId: string, status: 'pending' | 'confirmed' | 'failed'): void {
    const current = this.pendingReservations();
    const updated = current.map(r =>
      r.id === reservationId ? { ...r, status } : r
    );
    this.pendingReservations.set(updated);
  }

  /**
   * Generar ID único para reserva temporal
   */
  private generateReservationId(): string {
    return `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Guardar reserva pendiente en localStorage
   */
  private savePendingReservationToStorage(reservation: PendingReservation): void {
    try {
      const existing = JSON.parse(localStorage.getItem('checkout_pending_reservations') || '[]');
      const updated = [...existing.filter((r: any) => r.id !== reservation.id), reservation];
      localStorage.setItem('checkout_pending_reservations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving pending reservation to storage:', error);
    }
  }

  /**
   * Remover reserva pendiente del localStorage
   */
  private removePendingReservationFromStorage(reservationId: string): void {
    try {
      const existing = JSON.parse(localStorage.getItem('checkout_pending_reservations') || '[]');
      const updated = existing.filter((r: any) => r.id !== reservationId);
      localStorage.setItem('checkout_pending_reservations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing pending reservation from storage:', error);
    }
  }

  /**
   * Cargar reservas pendientes desde localStorage (al inicializar la app)
   */
  loadPendingReservationsFromStorage(): void {
    try {
      const stored = JSON.parse(localStorage.getItem('checkout_pending_reservations') || '[]');
      this.pendingReservations.set(stored);
    } catch (error) {
      console.error('Error loading pending reservations from storage:', error);
    }
  }

  /**
   * Validar si una reserva pendiente aún es válida (horarios no ocupados)
   */
  validatePendingReservation(reservationId: string): Observable<boolean> {
    // Aquí puedes implementar una validación con el backend
    // para verificar que los horarios seleccionados aún estén disponibles
    return new Observable(observer => {
      // Por ahora retornamos true, pero deberías implementar la validación real
      observer.next(true);
      observer.complete();
    });
  }

  /**
   * Limpiar todas las reservas pendientes expiradas
   */
  cleanExpiredReservations(): void {
    const current = this.pendingReservations();
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hora

    const valid = current.filter(r => {
      const timestamp = parseInt(r.id.split('_')[1]);
      return timestamp > oneHourAgo;
    });

    this.pendingReservations.set(valid);

    // Actualizar localStorage
    try {
      localStorage.setItem('checkout_pending_reservations', JSON.stringify(valid));
    } catch (error) {
      console.error('Error cleaning expired reservations:', error);
    }
  }
}
