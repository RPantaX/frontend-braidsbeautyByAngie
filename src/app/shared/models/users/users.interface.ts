// models/users/user.interface.ts

// ================= ROLE INTERFACE =================
export interface RoleDto {
  id: number;
  name: string;
}

// ================= USER INTERFACES =================
export interface UserDto {
  id: number;
  keycloakId?: string;
  username: string;
  password?: string; // Only for creation/update
  enabled: boolean;
  email: string;
  roles: RoleDto[];
  state: boolean;
  modifiedByUser: string;
  createdAt: string;
  modifiedAt?: string;
  deletedAt?: string;

  // Computed properties
  admin?: boolean;
  isAdmin?: boolean;
}

// ================= REQUEST INTERFACES =================
export interface UserRequest {
  keycloakId?: string;
  username: string;
  document?: string; // Document number for employee matching
  documentId?: number;
  password: string;
  enabled: boolean;
  email: string;
  admin: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  enabled: boolean;
  admin: boolean;
  document?: string; // For linking to employee
  keycloakId?: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  enabled: boolean;
  admin: boolean;
  roles?: RoleDto[];
}

// ================= EMPLOYEE MATCHING =================
export interface EmployeeMatchDto {
  id: number;
  person: {
    id: number;
    name: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    documentNumber: string;
    documentType: {
      id: number;
      value: string;
    };
  };
  employeeType: {
    id: number;
    value: string;
  };
  employeeImage?: string;
}

// ================= FILTER INTERFACES =================
export interface UserFilter {
  enabled?: boolean;
  roleId?: number;
  searchTerm?: string;
  admin?: boolean;
}

export interface UserTableColumn {
  field: string;
  header: string;
  sortable: boolean;
  filterable: boolean;
  type: 'text' | 'email' | 'tag' | 'boolean' | 'date' | 'actions' | 'avatar';
  width?: string;
}

// ================= DROPDOWN OPTIONS =================
export interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
}

export interface RoleOption extends DropdownOption {
  value: number;
  roleName?: string;
}

// ================= FORM INTERFACES =================
export interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  enabled: boolean;
  admin: boolean;
  document?: string;
  keycloakId?: string;
}

export interface UserFormErrors {
  [key: string]: string | null;
}

// ================= VALIDATION INTERFACES =================
export interface PasswordValidation {
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  hasMinLength: boolean;
  isValid: boolean;
}

// ================= STATUS MAPPINGS =================
export interface UserStatusMapping {
  value: boolean;
  label: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
  icon: string;
}

export const USER_STATUS_MAP: Record<string, UserStatusMapping> = {
  'enabled': {
    value: true,
    label: 'Activo',
    severity: 'success',
    icon: 'pi pi-check-circle'
  },
  'disabled': {
    value: false,
    label: 'Inactivo',
    severity: 'danger',
    icon: 'pi pi-times-circle'
  }
};

export const ADMIN_STATUS_MAP: Record<string, UserStatusMapping> = {
  'admin': {
    value: true,
    label: 'Administrador',
    severity: 'info',
    icon: 'pi pi-crown'
  },
  'user': {
    value: false,
    label: 'Usuario',
    severity: 'warning',
    icon: 'pi pi-user'
  }
};

// ================= TABLE CONFIGURATION =================
export const USER_TABLE_COLUMNS: UserTableColumn[] = [
  {
    field: 'username',
    header: 'Usuario',
    sortable: true,
    filterable: true,
    type: 'text',
    width: '150px'
  },
  {
    field: 'email',
    header: 'Email',
    sortable: true,
    filterable: true,
    type: 'email',
    width: '200px'
  },
  {
    field: 'roles',
    header: 'Roles',
    sortable: false,
    filterable: true,
    type: 'tag',
    width: '150px'
  },
  {
    field: 'enabled',
    header: 'Estado',
    sortable: true,
    filterable: true,
    type: 'tag',
    width: '100px'
  },
  {
    field: 'admin',
    header: 'Tipo',
    sortable: true,
    filterable: true,
    type: 'tag',
    width: '120px'
  },
  {
    field: 'createdAt',
    header: 'Fecha Creación',
    sortable: true,
    filterable: false,
    type: 'date',
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

// ================= ROLE CONSTANTS =================
export const ROLE_CONSTANTS = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER'
} as const;

export const ROLE_LABELS: Record<string, string> = {
  'ROLE_ADMIN': 'Administrador',
  'ROLE_USER': 'Usuario',
  'ROLE_EMPLOYEE': 'Empleado',
  'ROLE_MANAGER': 'Gerente'
};

// ================= UTILITY INTERFACES =================


export interface UserSearchCriteria {
  global?: string;
  username?: string;
  email?: string;
  enabled?: boolean;
  admin?: boolean;
  role?: string;
}

// ================= API RESPONSE INTERFACES =================
export interface UserApiResponse {
  data: UserDto | UserDto[];
  message: string;
  success: boolean;
  timestamp: string;
}

export interface RolesApiResponse {
  data: RoleDto[];
  message: string;
  success: boolean;
  timestamp: string;
}

export interface EmployeeValidationResponse {
  data: EmployeeMatchDto | null;
  message: string;
  success: boolean;
  exists: boolean;
}

// ================= FORM VALIDATION CONSTANTS =================
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 50,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
} as const;

export const USERNAME_REQUIREMENTS = {
  minLength: 3,
  maxLength: 30,
  allowedPattern: /^[a-zA-Z0-9_.-]+$/
} as const;

// ================= ERROR MESSAGES =================
export const USER_ERROR_MESSAGES = {
  USERNAME_REQUIRED: 'El nombre de usuario es requerido',
  USERNAME_MIN_LENGTH: `El nombre de usuario debe tener al menos ${USERNAME_REQUIREMENTS.minLength} caracteres`,
  USERNAME_MAX_LENGTH: `El nombre de usuario no puede exceder ${USERNAME_REQUIREMENTS.maxLength} caracteres`,
  USERNAME_PATTERN: 'El nombre de usuario solo puede contener letras, números, guiones y puntos',
  USERNAME_EXISTS: 'Este nombre de usuario ya está en uso',

  EMAIL_REQUIRED: 'El email es requerido',
  EMAIL_INVALID: 'El formato del email no es válido',
  EMAIL_EXISTS: 'Este email ya está registrado',

  PASSWORD_REQUIRED: 'La contraseña es requerida',
  PASSWORD_MIN_LENGTH: `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`,
  PASSWORD_MAX_LENGTH: `La contraseña no puede exceder ${PASSWORD_REQUIREMENTS.maxLength} caracteres`,
  PASSWORD_UPPERCASE: 'La contraseña debe contener al menos una letra mayúscula',
  PASSWORD_LOWERCASE: 'La contraseña debe contener al menos una letra minúscula',
  PASSWORD_NUMBER: 'La contraseña debe contener al menos un número',
  PASSWORD_SPECIAL: 'La contraseña debe contener al menos un carácter especial',

  CONFIRM_PASSWORD_REQUIRED: 'La confirmación de contraseña es requerida',
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',

  DOCUMENT_INVALID: 'El número de documento no es válido',
  EMPLOYEE_NOT_FOUND: 'No se encontró un empleado con este número de documento'
} as const;
