import type { User } from '@atom/shared';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(userInput: { email: string }): Promise<User>;
}

