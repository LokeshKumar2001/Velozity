import bcrypt from 'bcrypt';
import { UsersRepository, usersRepository } from './users.repository.js';
import { CreateUserDTO, UserFilterQuery, UserSummary } from './users.types.js';
import { AppError } from '../../errors/app-error.js';
import { presenceManager } from '../../infrastructure/websocket/presence.manager.js';

export class UsersService {
  constructor(private repo: UsersRepository = usersRepository) {}

  async getUsers(filters: UserFilterQuery): Promise<UserSummary[]> {
    const users = await this.repo.findAll(filters);

    return users.map((user) => ({
      ...user,
      isOnline: presenceManager.isUserOnline(user.id),
    }));
  }

  async getUserById(id: string): Promise<UserSummary> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      ...user,
      isOnline: presenceManager.isUserOnline(user.id),
    };
  }

  async createUser(dto: CreateUserDTO) {
    const existing = await this.repo.findByEmail(dto.email.toLowerCase().trim());
    if (existing) {
      throw AppError.conflict('A user with this email address already exists');
    }

    const rawPassword = dto.password || 'Password@123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await this.repo.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      role: dto.role,
    });

    return {
      ...user,
      isOnline: false,
    };
  }
}

export const usersService = new UsersService();
export default usersService;
