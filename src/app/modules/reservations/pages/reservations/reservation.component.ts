// promotion.component.ts - Main Component (Enhanced)
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ResponseService } from '../../../../shared/models/reservations/services.interface';
import { ServiceService } from '../../../../core/services/reservations/services.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  services: ResponseService[] = [];
  serviceDialog: boolean = false;
  deleteDialog: boolean = false;
  selectedService: ResponseService | null = null;
  isLoading: boolean = false;

  serviceService = inject(ServiceService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  _changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit(): void {
    // Initialization logic if needed
  }

  /**
   * Opens dialog for creating a new service
   */
  openNewServiceDialog(): void {
    this.selectedService = null;
    this.serviceDialog = true;
  }

  /**
   * Opens dialog for editing an existing service
   * @param service The service to edit
   */
  openEditServiceDialog(service: ResponseService): void {
    this.selectedService = { ...service };
    this.serviceDialog = true;
  }

  /**
   * Closes the service dialog
   */
  hideServiceDialog(): void {
    this.serviceDialog = false;
    this.selectedService = null;
  }

  /**
   * Handles the delete service action
   * @param service The service to delete
   */
  confirmDeleteService(service: ResponseService): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar el servicio "${service.serviceDTO.serviceName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteService(service.serviceDTO.serviceId),
      reject: () => this.messageService.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Operación cancelada'
      })
    });
  }

  /**
   * Deletes a service
   * @param serviceId The ID of the service to delete
   */
  private deleteService(serviceId: number): void {
    this.isLoading = true;
    this.serviceService.deleteService(serviceId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicio eliminado correctamente'
        });
        this.refreshServices();
      },
      error: (error) => {
        console.error('Error deleting service:', error);
        let errorMessage = 'Ocurrió un error al eliminar el servicio';

        if (error.status === 406 && error.error?.message) {
          errorMessage = error.error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      },
      complete: () => this.isLoading = false
    });
  }

  /**
   * Refreshes the services list
   */
  refreshServices(): void {
    this.serviceService.refreshServices();
  }
}
