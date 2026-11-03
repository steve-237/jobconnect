import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesGateway } from '../messages/messages.gateway';
import { MailService } from '../mail/mail.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: any;
  let notificationsService: { sendPushNotification: jest.Mock };
  let messagesGateway: { sendNotificationToUser: jest.Mock };
  let mailService: { sendNewApplicationNotification: jest.Mock; sendApplicationAcceptedNotification: jest.Mock };

  beforeEach(async () => {
    prisma = {
      job: {
        findUnique: jest.fn(),
      },
      application: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((promises) => Promise.all(promises)),
    };

    notificationsService = {
      sendPushNotification: jest.fn(),
    };

    messagesGateway = {
      sendNotificationToUser: jest.fn(),
    };

    mailService = {
      sendNewApplicationNotification: jest.fn().mockResolvedValue({ success: true }),
      sendApplicationAcceptedNotification: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: MessagesGateway, useValue: messagesGateway },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ jobId: 'non-existent', message: 'Hello' }, 'cand-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if job status is not open', async () => {
      prisma.job.findUnique.mockResolvedValue({ id: 'job-1', status: 'COMPLETED' });

      await expect(
        service.create({ jobId: 'job-1', message: 'Hello' }, 'cand-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if already applied', async () => {
      prisma.job.findUnique.mockResolvedValue({ id: 'job-1', status: 'PUBLISHED' });
      prisma.application.findUnique.mockResolvedValue({ id: 'app-old' });

      await expect(
        service.create({ jobId: 'job-1', message: 'Hello' }, 'cand-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create application and send notifications', async () => {
      prisma.job.findUnique.mockResolvedValue({
        id: 'job-1',
        title: 'Ménage',
        employerId: 'emp-1',
        status: 'PUBLISHED',
      });
      prisma.application.findUnique.mockResolvedValue(null);
      prisma.application.create.mockResolvedValue({
        id: 'app-new',
        candidate: { firstName: 'Alice', lastName: 'Dupont' },
      });
      prisma.user.findUnique.mockResolvedValue({ id: 'emp-1', expoPushToken: 'ExponentPushToken[xxx]' });

      const result = await service.create({ jobId: 'job-1', message: 'Motivé !' }, 'cand-1');

      expect(prisma.application.create).toHaveBeenCalled();
      expect(messagesGateway.sendNotificationToUser).toHaveBeenCalledWith(
        'emp-1',
        expect.objectContaining({ type: 'NEW_APPLICATION' }),
      );
      expect(notificationsService.sendPushNotification).toHaveBeenCalled();
      expect(result.id).toBe('app-new');
    });
  });

  describe('acceptApplication', () => {
    it('should throw NotFoundException if application not found', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.acceptApplication('app-unknown', 'emp-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the job employer', async () => {
      prisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        job: { employerId: 'real-employer' },
      });

      await expect(
        service.acceptApplication('app-1', 'fake-employer'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
