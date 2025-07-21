import { EmployeeDto } from "../users/employee.interface";

export interface ScheduleDTO {
  scheduleId: number;
  scheduleDate: string; // LocalDate se mapea a string en formato ISO (YYYY-MM-DD)
  scheduleHourStart: string; // LocalTime se mapea a string en formato HH:mm:ss
  scheduleHourEnd: string;
  scheduleState: string;
  employeeId: number;
}

export interface RequestSchedule {
  scheduleDate: string; // LocalDate
  scheduleHourStart: string; // LocalTime
  scheduleHourEnd: string; // LocalTime
  employeeId: number;
}

export interface ServiceDTO {
  serviceId: number;
  serviceName: string;
  serviceDescription: string;
  servicePrice: number; // BigDecimal se mapea a number
  serviceImage: string;
  durationTimeAprox: string; // LocalTime
}

export interface ReservationDTO {
  reservationId: number;
  reservationState: string;
  shoppingCartItemId: number;
  shopOrderId: number;
  reservationTotalPrice: number; // BigDecimal
}

export interface ResponseWorkServiceWithoutReservation {
  serviceDTOList: ServiceDTO[];
  reservationDTOList: (ReservationDTO | null)[];
}

export interface ResponseSchedule {
  scheduleDTO: ScheduleDTO;
  responseWorkServiceWithoutReservation: ResponseWorkServiceWithoutReservation;
}

export interface ResponseListPageableSchedule {
  responseScheduleList: ResponseSchedule[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}

export interface ResponseScheduleWithEmployee {
  scheduleDTO: ScheduleDTO;
  employeeDto: EmployeeDto;
}
