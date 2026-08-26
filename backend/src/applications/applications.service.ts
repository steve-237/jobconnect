import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesGateway } from '../messages/messages.gateway';

const prisma = new PrismaClient();

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    candidateId: string,
  ) {
    const job = await prisma.job.findUnique({
      where: { id: createApplicationDto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'PENDING' && job.status !== 'PUBLISHED') {
      throw new ForbiddenException(
        'This job is no longer accepting applications',
      );
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

    const application = await prisma.application.create({
      data: {
        jobId: createApplicationDto.jobId,
        candidateId,
        message: createApplicationDto.message,
      },
      include: {
        candidate: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Real-time socket notification to employer
    this.messagesGateway.sendNotificationToUser(job.employerId, {
      id: `notif-${Date.now()}`,
      type: 'NEW_APPLICATION',
      title: 'Nouvelle Candidature 📩',
      message: `${application.candidate.firstName} ${application.candidate.lastName} a postulé à votre annonce "${job.title}".`,
      jobId: job.id,
      jobTitle: job.title,
      senderName: `${application.candidate.firstName} ${application.candidate.lastName}`,
    });

    return application;
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
          },
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
      data: { isAccepted: true, status: 'ACCEPTED' },
    });

    // Automatically set job to IN_PROGRESS when candidate is accepted
    await prisma.job.update({
      where: { id: application.jobId },
      data: { status: 'IN_PROGRESS' },
    });

    // Real-time socket notification to candidate
    this.messagesGateway.sendNotificationToUser(application.candidateId, {
      id: `notif-${Date.now()}`,
      type: 'APPLICATION_ACCEPTED',
      title: 'Candidature Acceptée 🎉',
      message: `Votre candidature pour "${application.job.title}" a été acceptée !`,
      jobId: application.jobId,
      jobTitle: application.job.title,
    });

    // Push notification if token available
    const candidate = await prisma.user.findUnique({
      where: { id: application.candidateId },
    });
    if (candidate?.expoPushToken) {
      await this.notificationsService.sendPushNotification(
        candidate.expoPushToken,
        'Candidature Acceptée ! 🎉',
        `Votre candidature pour "${application.job.title}" a été acceptée. Vous pouvez maintenant discuter avec l'employeur !`,
        { type: 'application_accepted', applicationId: id },
      );
    }

    return updated;
  }

  async rejectApplication(id: string, employerId: string) {
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
      data: { isAccepted: false, status: 'REJECTED' },
    });

    // Real-time socket notification to candidate
    this.messagesGateway.sendNotificationToUser(application.candidateId, {
      id: `notif-${Date.now()}`,
      type: 'APPLICATION_REJECTED',
      title: 'Candidature Refusée ❌',
      message: `Votre candidature pour "${application.job.title}" a été refusée.`,
      jobId: application.jobId,
      jobTitle: application.job.title,
    });

    // Push notification if token available
    const candidate = await prisma.user.findUnique({
      where: { id: application.candidateId },
    });
    if (candidate?.expoPushToken) {
      await this.notificationsService.sendPushNotification(
        candidate.expoPushToken,
        'Mise à jour candidature',
        `Votre candidature pour "${application.job.title}" a été refusée.`,
        { type: 'application_rejected', applicationId: id },
      );
    }

    return updated;
  }

  async inviteCandidate(
    employerId: string,
    candidateId: string,
    jobId: string,
    message?: string,
  ) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.employerId !== employerId) throw new ForbiddenException('You do not own this job');

    const candidate = await prisma.user.findUnique({ where: { id: candidateId } });
    if (!candidate || candidate.role !== 'CANDIDATE') throw new NotFoundException('Candidate not found');

    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
    });

    let app = existing;
    if (!app) {
      app = await prisma.application.create({
        data: {
          jobId,
          candidateId,
          message: message || `Invitation directe de l'employeur à postuler sur la mission "${job.title}".`,
          status: 'PENDING',
        },
      });
    }

    const employer = await prisma.user.findUnique({ where: { id: employerId } });
    const employerName = employer ? `${employer.firstName} ${employer.lastName}` : 'Un employeur';

    // WebSocket Notification to Candidate
    this.messagesGateway.sendNotificationToUser(candidateId, {
      id: `invite-${Date.now()}`,
      type: 'JOB_INVITATION',
      title: 'Invitation à une Mission 🌟',
      message: `${employerName} vous invite à postuler à la mission "${job.title}" !`,
      jobId: job.id,
      jobTitle: job.title,
      senderName: employerName,
    });

    return { success: true, applicationId: app.id };
  }
}
