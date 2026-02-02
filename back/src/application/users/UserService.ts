import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { UserLoggedInResponse } from '@atom/shared';
import { getEnvConfig } from '../../config/env';
import jwt from 'jsonwebtoken';
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

    const config = getEnvConfig();
    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

    return {
      data: user,
      token,
    };
  }
}

