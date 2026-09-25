import { prisma } from '../../config/database.config.js';
import { User, Prisma } from '@prisma/client';
import { UserFilterQuery } from './users.types.js';

export class UsersRepository {
  async findAll(filters: UserFilterQuery): Promise<Omit<User, 'passwordHash'>[]> {
    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { name: string; email: string; passwordHash: string; role: any }): Promise<Omit<User, 'passwordHash'>> {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export const usersRepository = new UsersRepository();
export default usersRepository;
