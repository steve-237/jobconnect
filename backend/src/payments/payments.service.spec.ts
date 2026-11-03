import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesGateway } from '../messages/messages.gateway';
import { MailService } from '../mail/mail.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let notificationsService: { sendPushNotification: jest.Mock };
  let messagesGateway: { sendNotificationToUser: jest.Mock };
  let mailService: { sendPaymentReceipt: jest.Mock };

  beforeEach(async () => {
    prisma = {
      application: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      job: {
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((actions) => {
        if (Array.isArray(actions)) {
          return Promise.all(actions);
        }
        if (typeof actions === 'function') {
          return actions(prisma);
        }
        return Promise.resolve();
      }),
    };

    notificationsService = {
      sendPushNotification: jest.fn(),
    };

    messagesGateway = {
      sendNotificationToUser: jest.fn(),
    };

    mailService = {
      sendPaymentReceipt: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: MessagesGateway, useValue: messagesGateway },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should throw NotFoundException if application does not exist', async () => {
      prisma.application.findUnique.mockResolvedValue(null);
      await expect(
        service.createCheckoutSession('app-999', 'emp-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the job employer', async () => {
      prisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        isAccepted: false,
        job: { id: 'j-1', employerId: 'different-employer', price: 100 },
      });

      await expect(
        service.createCheckoutSession('app-1', 'attacker-emp'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should execute atomic transaction on dev mode fallback', async () => {
      prisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'j-1',
        candidateId: 'cand-1',
        isAccepted: false,
        job: { id: 'j-1', employerId: 'emp-1', price: 50, title: 'Mission Test' },
      });
      prisma.user.findUnique.mockResolvedValue({ id: 'cand-1', expoPushToken: null });

      const result = await service.createCheckoutSession('app-1', 'emp-1');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('url');
      expect(messagesGateway.sendNotificationToUser).toHaveBeenCalledWith(
        'cand-1',
        expect.objectContaining({ type: 'APPLICATION_ACCEPTED' }),
      );
    });
  });

  describe('getUserTransactions', () => {
    it('should calculate available and pending balance for candidate correctly', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'cand-1', role: 'CANDIDATE' });
      prisma.transaction.findMany.mockResolvedValue([
        { amount: 100, status: 'COMPLETED', job: { status: 'COMPLETED' } },
        { amount: 50, status: 'PENDING', job: { status: 'IN_PROGRESS' } },
      ]);

      const res = await service.getUserTransactions('cand-1');
      expect(res.availableBalance).toBe(100);
      expect(res.pendingEscrowBalance).toBe(50);
      expect(res.transactions).toHaveLength(2);
    });
  });
});
