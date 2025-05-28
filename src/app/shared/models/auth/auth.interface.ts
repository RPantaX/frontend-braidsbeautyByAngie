export interface Login {
  username: string;
  password: string;
}

export interface User {
  idUser: string;
  username: string;
  email: string;
  roles: UserRoles[];
  enabled: boolean;
}

export interface TokenResponse {
  token: string;
}

export interface UserRoles {
  id: number;
  name: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  username: string;
  roles: UserRoles[];
  userId: string
}
