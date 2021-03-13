import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPayload } from '../common/interfaces/auth.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  getAccessToken(user: IPayload): string {
    const payload = { id: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async getUserByPayload(payload: IPayload): Promise<User> {
    return await this.userRepository.findOne(payload.id, {
      select: ['email', 'id'],
    });
  }
}
