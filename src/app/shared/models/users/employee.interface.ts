// employee.interface.ts
export interface DocumentTypeDto {
  id: number;
  value: string;
}

export interface AddressDto {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  description: string;
}

export interface PersonDto {
  id: number;
  name: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  addressId: number;
  documentTypeId: number;
  address: AddressDto;
  documentType: DocumentTypeDto;
}

export interface EmployeeTypeDto {
  id: number;
  value: string;
}

export interface EmployeeDto {
  id: number;
  employeeImage: string;
  employeeTypeId: number;
  userId: number;
  personId: number;
  employeeType: EmployeeTypeDto;
  person: PersonDto;
}

