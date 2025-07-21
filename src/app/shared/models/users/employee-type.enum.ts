// models/employees/employee-type.enum.ts
export enum EmployeeTypeEnum {
  STYLIST = 'STYLIST',
  RECEPTIONIST = 'RECEPTIONIST',
  MANAGER = 'MANAGER',
  ASSISTANT = 'ASSISTANT',
  CLEANER = 'CLEANER'
}

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeTypeEnum, string> = {
  [EmployeeTypeEnum.STYLIST]: 'Estilista',
  [EmployeeTypeEnum.RECEPTIONIST]: 'Recepcionista',
  [EmployeeTypeEnum.MANAGER]: 'Gerente',
  [EmployeeTypeEnum.ASSISTANT]: 'Asistente',
  [EmployeeTypeEnum.CLEANER]: 'Limpieza'
};
