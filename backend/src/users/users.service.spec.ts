import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesGateway } from '../messages/messages.gateway';
import { MailService } from '../mail/mail.service';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;
  let messagesGateway: { sendNotificationToUser: jest.Mock };
  let mailService: { sendWelcomeEmail: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    messagesGateway = {
      sendNotificationToUser: jest.fn(),
    };

    mailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: MessagesGateway, useValue: messagesGateway },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'taken@example.com' });

      await expect(
        service.create({
          email: 'taken@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user without returning passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'u-1',
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        }),
      );

      const result = await service.create({
        email: 'new@example.com',
        password: 'securePassword1',
        firstName: 'Alice',
        lastName: 'Smith',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.id).toBe('u-1');
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return user with stats when found', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        email: 'user@example.com',
        passwordHash: 'hash',
        appliedJobs: [{ id: 'app-1' }],
        postedJobs: [{ id: 'job-1' }],
        reviewsReceived: [{ rating: 5 }, { rating: 4 }],
      });
      const user = await service.findById('u-1');
      expect(user).toBeDefined();
      expect(user?.rating).toBe(4.5);
      expect(user?.totalReviews).toBe(2);
      expect(user?.jobsApplied).toBe(1);
      expect(user?.jobsPosted).toBe(1);
    });

    it('should return null when not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const user = await service.findById('u-unknown');
      expect(user).toBeNull();
    });
  });

  describe('simulateApproveKyc', () => {
    it('should update kycStatus to APPROVED and set isVerified to true', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'u-1',
        kycStatus: 'APPROVED',
        isVerified: true,
      });

      const res = await service.simulateApproveKyc('u-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { kycStatus: 'APPROVED', isVerified: true },
      });
      expect(res.kycStatus).toBe('APPROVED');
      expect(res.isVerified).toBe(true);
    });
  });
});
