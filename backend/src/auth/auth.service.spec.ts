import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without passwordHash when credentials match', async () => {
      const password = 'secretPassword123';
      const hash = await bcrypt.hash(password, 10);
      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'EMPLOYER',
      });

      const result = await service.validateUser('test@example.com', password);
      expect(result).toBeDefined();
      expect(result.id).toBe('u1');
      expect(result.passwordHash).toBeUndefined();
    });

    it('should return null if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('none@example.com', 'pwd');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: hash,
      });

      const result = await service.validateUser('test@example.com', 'wrongPassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access_token signed with user payload', async () => {
      const user = { id: 'u1', email: 'test@example.com', role: 'CANDIDATE' };
      const res = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'u1',
        role: 'CANDIDATE',
      });
      expect(res).toEqual({ access_token: 'mock_jwt_token' });
    });
  });
});
