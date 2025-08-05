import { ScheduleDTO } from "./schedule.interface";
import { ServiceDTO } from "./services.interface";

export interface ReservationDTO {
  reservationId: number;
  reservationState: string;
  shoppingCartItemId?: number;
  shopOrderId?: number;
  reservationTotalPrice: number;
}

export interface RequestReservation {
  scheduleId: number;
  serviceId: number;
}

export interface ResponseWorkService {
  serviceDTO: ServiceDTO;
  scheduleDTO: ScheduleDTO;
  reservationDTO?: ReservationDTO;
}

export interface ResponseWorkServiceDetail {
  serviceDTO: ServiceDTO;
  scheduleDTO: ScheduleDTO;
}

export interface ResponseReservation {
  reservationDTO: ReservationDTO;
  responseWorkServiceList: ResponseWorkService[];
}

export interface ResponseReservationDetail {
  reservationId: number;
  reservationState: string;
  reservationTotalPrice: number;
  responseWorkServiceDetails: ResponseWorkServiceDetail[];
}

export interface ResponseListPageableReservation {
  responseReservationList: ResponseReservation[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}

export interface ReservationCore {
  reservationId: number;
  totalPrice: number;
}
