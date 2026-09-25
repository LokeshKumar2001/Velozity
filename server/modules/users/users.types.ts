import { UserRole } from '@prisma/client';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface UserFilterQuery {
  role?: UserRole;
  search?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOnline: boolean;
  createdAt: Date;
}
