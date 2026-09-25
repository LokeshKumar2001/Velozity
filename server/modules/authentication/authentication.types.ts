import { UserRole } from '@prisma/client';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}
