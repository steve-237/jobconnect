import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

const prisma = new PrismaClient();

@Injectable()
export class MessagesService {
  constructor(private readonly notificationsService: NotificationsService) {}
  /**
   * Verifies if a user is part of the application (either the candidate or the employer).
   * Also checks if the application is accepted.
   */
  async verifyAccess(applicationId: string, userId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!application.isAccepted) {
      throw new ForbiddenException('You cannot chat until the application is accepted.');
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
    // We already verified access in the gateway before calling this, but keeping it robust
    const application = await this.verifyAccess(applicationId, senderId);
    const isEmployer = application.job.employerId === senderId;

    const savedMessage = await prisma.message.create({
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
          }
        }
      }
    });

    // Send push notification to the other party
    const receiverId = isEmployer ? application.candidateId : application.job.employerId;
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (receiver?.expoPushToken) {
      await this.notificationsService.sendPushNotification(
        receiver.expoPushToken,
        `New message from ${savedMessage.sender.firstName}`,
        content,
        { type: 'chat', applicationId }
      );
    }

    return savedMessage;
  }

  /**
   * Fetches the entire chat history for a specific application.
   */
  async getHistory(applicationId: string, userId: string) {
    await this.verifyAccess(applicationId, userId);

    return prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      }
    });
  }
}
