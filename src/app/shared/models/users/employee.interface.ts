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
  description?: string;
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
  documentNumber?: string; // Optional for flexibility
  state: boolean;
  createdAt: string;
  modifiedByUser : string;
  modifiedAt: string;
  // Computed property
  get fullName(): string;
}
export interface ContractDto {
  id: number;
  // Add contract properties as needed
}
export interface EmployeeTypeDto {
  id: number;
  value: string;
}

export interface EmployeeDto {
  id: number;
  employeeImage?: string;

  // Relaciones como IDs para requests
  employeeTypeId?: number;
  userId?: number;
  personId?: number;

  // Objetos anidados para respuestas completas
  employeeType?: EmployeeTypeDto;
  user?: UserDto;
  person?: PersonDto;
  contracts?: ContractDto[];
  // Campos calculados/derivados
  employeeName?: string;
  employeeEmail?: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
}
// ================= REQUEST INTERFACES =================
export interface CreateEmployeeRequest {
  employeeTypeId: number;
  name: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  employeeImage?: File | null;

  // Address data
  street: string;
  city: string;
  state: string;
  postalCode: string;
  addressDescription: string;
  country: string;
  documentNumber: string;
  documentTypeId: number;
  deleteFile: boolean;
}

// ================= RESPONSE INTERFACES =================
export interface ResponseListPageableEmployee {
  employeeDtoList: EmployeeDto[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}

// ================= FILTER INTERFACES =================
export interface EmployeeFilter {
  state?: boolean;
  employeeTypeId?: number;
  employeeTypeIds?: number[];
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface EmployeeTableColumn {
  field: string;
  header: string;
  sortable: boolean;
  filterable: boolean;
  type: 'text' | 'image' | 'tag' | 'date' | 'currency' | 'actions';
  width?: string;
}

// ================= DROPDOWN OPTIONS =================
export interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
}

export interface EmployeeTypeOption extends DropdownOption {
  value: number;
  employeeTypeEnum?: string;
}

export interface DocumentTypeOption extends DropdownOption {
  value: number;
}

// ================= FORM INTERFACES =================
export interface EmployeeFormData {
  // Personal Information
  name: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  documentNumber: string;
  documentTypeId: number | null;
  employeeTypeId: number | null;

  // Address Information
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressDescription: string;

  // File handling
  employeeImage?: File;
  currentImageUrl?: string;
  deleteFile: boolean;
}

export interface EmployeeFormErrors {
  [key: string]: string | null;
}
// ================= ENUM MAPPINGS =================
export interface EmployeeStatusMapping {
  value: boolean;
  label: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
  icon: string;
}

export const EMPLOYEE_STATUS_MAP: Record<string, EmployeeStatusMapping> = {
  'active': {
    value: true,
    label: 'Activo',
    severity: 'success',
    icon: 'pi pi-check-circle'
  },
  'inactive': {
    value: false,
    label: 'Inactivo',
    severity: 'danger',
    icon: 'pi pi-times-circle'
  }
};

// ================= TABLE CONFIGURATION =================
export const EMPLOYEE_TABLE_COLUMNS: EmployeeTableColumn[] = [
  {
    field: 'employeeImage',
    header: 'Avatar',
    sortable: false,
    filterable: false,
    type: 'image',
    width: '80px'
  },
  {
    field: 'person.name',
    header: 'Nombre',
    sortable: true,
    filterable: true,
    type: 'text',
    width: '150px'
  },
  {
    field: 'person.lastName',
    header: 'Apellido',
    sortable: true,
    filterable: true,
    type: 'text',
    width: '150px'
  },
  {
    field: 'person.emailAddress',
    header: 'Email',
    sortable: true,
    filterable: true,
    type: 'text',
    width: '200px'
  },
  {
    field: 'person.phoneNumber',
    header: 'Teléfono',
    sortable: false,
    filterable: true,
    type: 'text',
    width: '120px'
  },
  {
    field: 'employeeType.value',
    header: 'Tipo de Empleado',
    sortable: true,
    filterable: true,
    type: 'tag',
    width: '150px'
  },
  {
    field: 'person.documentType.value',
    header: 'Tipo de Documento',
    sortable: false,
    filterable: true,
    type: 'text',
    width: '150px'
  },
  {
    field: 'actions',
    header: 'Acciones',
    sortable: false,
    filterable: false,
    type: 'actions',
    width: '150px'
  }
];
