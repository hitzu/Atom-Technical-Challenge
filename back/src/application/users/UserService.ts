import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { UserLoggedInResponse } from '@atom/shared';

import { AppError } from '../../api/errors/AppError';

export class UserService {
  public constructor(private readonly userRepository: UserRepository) { }

  public async createUser(email: string): Promise<UserLoggedInResponse> {
    await this.userRepository.create({ email });
    return this.findByEmail(email);
  }

  public async findByEmail(email: string): Promise<UserLoggedInResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const token = `DEV.v1.id.${user.id}.email.${user.email}.${Date.now()}`;

    return {
      data: user,
      token,
    };
  }
}

