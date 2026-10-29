import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Verifies if a user is part of the application (either the candidate or the employer).
   * Also checks if the application is accepted.
   */
  async verifyAccess(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!application.isAccepted) {
      throw new ForbiddenException(
        'You cannot chat until the application is accepted.',
      );
    }

    const isCandidate = application.candidateId === userId;
    const isEmployer = application.job.employerId === userId;

    if (!isCandidate && !isEmployer) {
      throw new ForbiddenException('You do not have access to this chat.');
    }

    return application;
  }

  /**
   * Saves a message to the database.
   */
  async saveMessage(applicationId: string, senderId: string, content: string) {
    const application = await this.verifyAccess(applicationId, senderId);
    if (application.job.status === 'COMPLETED') {
      throw new ForbiddenException(
        'Cette mission est terminée. La discussion est archivée en lecture seule.',
      );
    }
    const isEmployer = application.job.employerId === senderId;

    const savedMessage = await this.prisma.message.create({
      data: {
        applicationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Send push notification to the other party
    const receiverId = isEmployer
      ? application.candidateId
      : application.job.employerId;
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (receiver?.expoPushToken) {
      await this.notificationsService.sendPushNotification(
        receiver.expoPushToken,
        `New message from ${savedMessage.sender.firstName}`,
        content,
        { type: 'chat', applicationId },
      );
    }

    return {
      ...savedMessage,
      receiverId,
      jobTitle: application.job.title,
    };
  }

  /**
   * Fetches the entire chat history for a specific application.
   */
  async getHistory(applicationId: string, userId: string) {
    const application = await this.verifyAccess(applicationId, userId);

    const messages = await this.prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      messages,
      isCompleted: application.job.status === 'COMPLETED',
      jobStatus: application.job.status,
    };
  }
}
