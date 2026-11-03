import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Google OAuth authentication / registration:
   * Finds existing user by email or creates a new one securely.
   */
  async loginWithGoogle(dto: GoogleAuthDto) {
    let user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      // Auto-create user with random secure hash
      const randomPassword = `OAuth_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      user = await this.usersService.create({
        email: dto.email,
        password: randomPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || 'CANDIDATE',
      }) as any;

      if (dto.avatarUrl && user?.id) {
        await this.usersService.update(user.id, { avatarUrl: dto.avatarUrl });
      }
    }

    return this.login(user);
  }
}
