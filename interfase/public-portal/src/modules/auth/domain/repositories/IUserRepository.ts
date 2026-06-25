import { User } from '../entities/User';
import { CreateUserCommand } from '../entities/User';

export interface IUserRepository {
  create(command: CreateUserCommand): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  markEmailVerified(userId: string): Promise<boolean>;
  clearEmailBlock(userId: string): Promise<void>;
}
