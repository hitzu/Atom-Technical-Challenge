import type { User } from '@atom/shared';

import type { UserRepository } from '../../domain/repositories/UserRepository';

export class UserService {
  public constructor(private readonly userRepository: UserRepository) { }

  public async loginOrCreate(email: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return existing;
    }
    return this.userRepository.create({ email });
  }
}

