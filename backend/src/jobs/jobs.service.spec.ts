import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesGateway } from '../messages/messages.gateway';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      job: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      application: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: NotificationsService,
          useValue: { sendPushNotification: jest.fn() },
        },
        {
          provide: MessagesGateway,
          useValue: {
            sendNotificationToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the job if it exists', async () => {
      const mockJob = { id: '123', title: 'Test Job', employerId: 'emp-1' };
      prisma.job.findUnique.mockResolvedValue(mockJob);

      const result = await service.findOne('123');
      expect(result).toEqual(mockJob);
      expect(prisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user is not the employer', async () => {
      const mockJob = { id: '123', title: 'Test Job', employerId: 'emp-1' };
      prisma.job.findUnique.mockResolvedValue(mockJob);

      await expect(
        service.update('123', { title: 'New Title' }, 'hacker-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
