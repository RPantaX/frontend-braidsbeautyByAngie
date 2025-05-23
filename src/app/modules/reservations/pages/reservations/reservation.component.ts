// promotion.component.ts - Main Component (Enhanced)
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ResponseService } from '../../../../shared/models/reservations/services.interface';
import { ServiceService } from '../../../../core/services/reservations/services.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

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

  deleteSelectedServices = signal<ResponseService[]>([]);
  dt!: Table;
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
   * Corregido: Recibe los servicios seleccionados desde el componente hijo
   * @param selectedServices Array de servicios seleccionados
   */
  setDeleteSelectedServices(selectedServices: ResponseService[]): void {
    this.deleteSelectedServices.set(selectedServices);
    console.log('Selected services received:', selectedServices);
  }

  /**
   * Corregido: Confirma la eliminación de servicios seleccionados
   */
  confirmDeleteSelectedServices(): void {
    const selectedServices = this.deleteSelectedServices();

    if (!selectedServices || selectedServices.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay servicios seleccionados para eliminar'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas eliminar ${selectedServices.length} servicio(s) seleccionado(s)?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.onDeleteSelectedServices(),
      reject: () => this.messageService.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Operación cancelada'
      })
    });
  }
  /**
   * Deletes selected services
   */
  private onDeleteSelectedServices(): void {
    const selectedServices = this.deleteSelectedServices();
    if (!selectedServices || selectedServices.length === 0) return;

    this.isLoading = true;
    const selectedServiceIds = selectedServices.map(service => service.serviceDTO.serviceId);
    console.log('Selected service IDs:', selectedServiceIds);
    /*this.serviceService.deleteServices(selectedServiceIds).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicios eliminados correctamente'
        });
        this.refreshServices();
      },
      error: (error) => {
        console.error('Error deleting services:', error);
        let errorMessage = 'Ocurrió un error al eliminar los servicios';

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
    });*/
  }
/**
   * Refreshes the services list
   */
  refreshServices(): void {
    this.serviceService.refreshServices();
  }

  /**
   * Corregido: Recibe la referencia de la tabla desde el componente hijo
   * @param dt Referencia de la tabla
   */
  setDt(dt: Table): void {
    this.dt = dt;
    console.log('Table reference received:', dt);
  }

  /**
   * Corregido: Exporta CSV usando la referencia de la tabla
   */
  exportCSV(): void {
    try {
      if (this.dt && this.dt.value && this.dt.value.length > 0) {
        // Asegurar que la tabla tenga los datos y filtros inicializados
        if (!this.dt.filteredValue) {
          this.dt.filteredValue = this.dt.value;
        }

        this.dt.exportCSV();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'CSV exportado correctamente'
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No hay datos disponibles para exportar'
        });
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error al exportar el CSV'
      });
    }
  }

  /**
   * Getter para verificar si hay servicios seleccionados
   */
  get hasSelectedServices(): boolean {
    return this.deleteSelectedServices().length > 0;
  }
}
