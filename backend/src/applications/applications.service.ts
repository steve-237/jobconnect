import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';
import { NotificationsService } from '../notifications/notifications.service';

const prisma = new PrismaClient();

@Injectable()
export class ApplicationsService {
  constructor(private readonly notificationsService: NotificationsService) {}
  async create(createApplicationDto: CreateApplicationDto, candidateId: string) {
    const job = await prisma.job.findUnique({
      where: { id: createApplicationDto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'PENDING' && job.status !== 'PUBLISHED') {
      throw new ForbiddenException('This job is no longer accepting applications');
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: createApplicationDto.jobId,
          candidateId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already applied for this job');
    }

    return prisma.application.create({
      data: {
        jobId: createApplicationDto.jobId,
        candidateId,
        message: createApplicationDto.message,
      },
    });
  }

  async findAllForCandidate(candidateId: string) {
    return prisma.application.findMany({
      where: { candidateId },
      include: {
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForJob(jobId: string, employerId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.employerId !== employerId) {
      throw new ForbiddenException('You do not own this job');
    }

    return prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptApplication(id: string, employerId: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.employerId !== employerId) {
      throw new ForbiddenException('You do not own this job');
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { isAccepted: true },
    });

    // Automatically set job to IN_PROGRESS when candidate is accepted
    await prisma.job.update({
      where: { id: application.jobId },
      data: { status: 'IN_PROGRESS' },
    });

    // Notify the candidate
    const candidate = await prisma.user.findUnique({ where: { id: application.candidateId } });
    if (candidate?.expoPushToken) {
      await this.notificationsService.sendPushNotification(
        candidate.expoPushToken,
        'Candidature Acceptée ! 🎉',
        `Votre candidature pour "${application.job.title}" a été acceptée. Vous pouvez maintenant discuter avec l'employeur !`,
        { type: 'application_accepted', applicationId: id }
      );
    }

    return updated;
  }
}
