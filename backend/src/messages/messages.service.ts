import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class MessagesService {
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
    await this.verifyAccess(applicationId, senderId);

    return prisma.message.create({
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
