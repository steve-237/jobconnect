import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDisputeDto,
  RespondDisputeDto,
  ArbitrateDisputeDto,
} from './dto/dispute.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesGateway } from '../messages/messages.gateway';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async create(createDto: CreateDisputeDto, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: createDto.jobId },
      include: {
        applications: {
          where: { isAccepted: true },
          include: { candidate: true },
        },
        employer: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Mission introuvable');
    }

    const acceptedApp = job.applications[0];
    const isEmployer = job.employerId === userId;
    const isCandidate = acceptedApp && acceptedApp.candidateId === userId;

    if (!isEmployer && !isCandidate) {
      throw new ForbiddenException(
        "Vous n'êtes ni l'employeur ni le prestataire assigné à cette mission",
      );
    }

    // Check if a dispute is already open
    const existingDispute = await this.prisma.dispute.findFirst({
      where: {
        jobId: job.id,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    });

    if (existingDispute) {
      throw new BadRequestException('Un litige est déjà en cours pour cette mission');
    }

    const defendantId = isEmployer
      ? acceptedApp
        ? acceptedApp.candidateId
        : job.employerId
      : job.employerId;

    const dispute = await this.prisma.dispute.create({
      data: {
        jobId: job.id,
        initiatorId: userId,
        defendantId: defendantId,
        reason: createDto.reason,
        description: createDto.description,
        evidenceUrls: createDto.evidenceUrls || [],
        status: 'OPEN',
      },
      include: {
        job: true,
        initiator: true,
        defendant: true,
      },
    });

    // Notify the defendant
    this.messagesGateway.sendNotificationToUser(defendantId, {
      id: `dispute-${Date.now()}`,
      type: 'DISPUTE_OPENED',
      title: '⚠️ Litige Ouvert sur la Mission',
      message: `Un litige a été ouvert pour la mission "${job.title}". Le séquestre est temporairement gelé.`,
      jobId: job.id,
      disputeId: dispute.id,
    });

    return dispute;
  }

  async findAllForUser(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.dispute.findMany({
        include: {
          job: true,
          initiator: true,
          defendant: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.dispute.findMany({
      where: {
        OR: [{ initiatorId: userId }, { defendantId: userId }],
      },
      include: {
        job: true,
        initiator: true,
        defendant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            employer: true,
            applications: {
              where: { isAccepted: true },
              include: { candidate: true },
            },
          },
        },
        initiator: true,
        defendant: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dossier de litige introuvable');
    }

    if (
      role !== 'ADMIN' &&
      dispute.initiatorId !== userId &&
      dispute.defendantId !== userId
    ) {
      throw new ForbiddenException("Accès non autorisé à ce litige");
    }

    return dispute;
  }

  async respond(id: string, respondDto: RespondDisputeDto, userId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dossier de litige introuvable');
    }

    if (dispute.defendantId !== userId) {
      throw new ForbiddenException(
        'Seule la partie adverse peut formuler une réponse à ce litige',
      );
    }

    if (dispute.status !== 'OPEN' && dispute.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Ce litige est déjà clôturé ou résolu');
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        defendantReply: respondDto.reply,
        defendantProof: respondDto.evidenceUrls || [],
        status: 'UNDER_REVIEW',
      },
      include: {
        job: true,
        initiator: true,
        defendant: true,
      },
    });

    this.messagesGateway.sendNotificationToUser(dispute.initiatorId, {
      id: `dispute-reply-${Date.now()}`,
      type: 'DISPUTE_RESPONDED',
      title: '📝 Réponse au Litige Reçue',
      message: `La partie adverse a répondu au dossier de litige pour "${dispute.job.title}".`,
      jobId: dispute.jobId,
      disputeId: dispute.id,
    });

    return updated;
  }

  async arbitrate(id: string, arbitrateDto: ArbitrateDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            employer: true,
            applications: {
              where: { isAccepted: true },
              include: { candidate: true },
            },
          },
        },
        initiator: true,
        defendant: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dossier de litige introuvable');
    }

    let nextStatus: string;
    let explanation: string;
    let jobStatusUpdate: string | null = null;

    switch (arbitrateDto.decision) {
      case 'REFUND_EMPLOYER':
        nextStatus = 'RESOLVED_REFUND_EMPLOYER';
        explanation = "L'employeur a été intégralement remboursé des fonds sous séquestre.";
        jobStatusUpdate = 'CANCELLED';
        break;

      case 'PAY_CANDIDATE':
        nextStatus = 'RESOLVED_PAY_CANDIDATE';
        explanation = "Les fonds sous séquestre ont été libérés en faveur du prestataire.";
        jobStatusUpdate = 'COMPLETED';
        break;

      case 'SPLIT':
        nextStatus = 'RESOLVED_SPLIT';
        explanation = "Médiation équitable : Les fonds ont été partagés à 50% entre les deux parties.";
        jobStatusUpdate = 'COMPLETED';
        break;

      case 'DISMISS':
      default:
        nextStatus = 'DISMISSED';
        explanation = "Litige classé sans suite après analyse des preuves.";
        break;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (jobStatusUpdate) {
        await tx.job.update({
          where: { id: dispute.jobId },
          data: { status: jobStatusUpdate as any },
        });
      }

      return tx.dispute.update({
        where: { id },
        data: {
          status: nextStatus,
          resolutionNotes: arbitrateDto.resolutionNotes,
        },
        include: {
          job: true,
          initiator: true,
          defendant: true,
        },
      });
    });

    // Notify both parties
    const notifyPayload = {
      id: `dispute-arbitrated-${Date.now()}`,
      type: 'DISPUTE_ARBITRATED',
      title: '⚖️ Décision Rendue par le Support',
      message: `${explanation} (Dossier : ${dispute.job.title})`,
      jobId: dispute.jobId,
      disputeId: dispute.id,
    };

    this.messagesGateway.sendNotificationToUser(dispute.initiatorId, notifyPayload);
    this.messagesGateway.sendNotificationToUser(dispute.defendantId, notifyPayload);

    return updated;
  }
}
