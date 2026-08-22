import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MessagesGateway } from '../messages/messages.gateway';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  constructor(private readonly messagesGateway: MessagesGateway) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = await prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role || 'CANDIDATE',
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        appliedJobs: true,
        postedJobs: true,
        reviewsReceived: { select: { rating: true } },
      },
    });

    if (user) {
      const { passwordHash, appliedJobs, postedJobs, reviewsReceived, ...result } = user;
      const totalReviews = reviewsReceived.length;
      const avgRating = totalReviews > 0
        ? reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;

      return {
        ...result,
        jobsApplied: appliedJobs.length,
        jobsPosted: postedJobs.length,
        rating: Math.round(avgRating * 10) / 10,
        totalReviews,
      };
    }
    return null;
  }

  async updatePushToken(id: string, token: string) {
    return prisma.user.update({
      where: { id },
      data: { expoPushToken: token },
    });
  }

  async requestKyc(id: string, docType?: string, docUrl?: string, selfieUrl?: string) {
    return prisma.user.update({
      where: { id },
      data: {
        kycStatus: 'PENDING',
        kycDocType: docType || 'CNI',
        kycDocUrl: docUrl || null,
        kycSelfieUrl: selfieUrl || null,
        kycSubmittedAt: new Date(),
      },
    });
  }

  async simulateApproveKyc(id: string) {
    return prisma.user.update({
      where: { id },
      data: { kycStatus: 'APPROVED', isVerified: true },
    });
  }

  async findOne(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        kycStatus: true,
        kycDocType: true,
        kycDocUrl: true,
        kycSelfieUrl: true,
        kycSubmittedAt: true,
        isVerified: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async findPendingKyc() {
    return prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        kycStatus: true,
        kycDocType: true,
        kycDocUrl: true,
        kycSelfieUrl: true,
        kycSubmittedAt: true,
        isVerified: true,
        createdAt: true,
        bio: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveKyc(id: string) {
    const updated = await prisma.user.update({
      where: { id },
      data: { kycStatus: 'APPROVED', isVerified: true },
    });

    this.messagesGateway.sendNotificationToUser(id, {
      id: `notif-${Date.now()}`,
      type: 'KYC_APPROVED',
      title: 'Identité Vérifiée ! 🔵',
      message: 'Félicitations, votre dossier d\'identité KYC a été validé. Vous bénéficiez maintenant du badge de confiance !',
    });

    return updated;
  }

  async rejectKyc(id: string) {
    const updated = await prisma.user.update({
      where: { id },
      data: { kycStatus: 'REJECTED', isVerified: false },
    });

    this.messagesGateway.sendNotificationToUser(id, {
      id: `notif-${Date.now()}`,
      type: 'KYC_REJECTED',
      title: 'Dossier KYC Rejeté ❌',
      message: 'Votre demande de vérification d\'identité a été refusée. Veuillez soumettre à nouveau vos documents.',
    });

    return updated;
  }

  async getAdminStats() {
    const totalUsers = await prisma.user.count();
    const candidatesCount = await prisma.user.count({ where: { role: 'CANDIDATE' } });
    const employersCount = await prisma.user.count({ where: { role: 'EMPLOYER' } });
    const totalJobs = await prisma.job.count();
    const completedJobs = await prisma.job.count({ where: { status: 'COMPLETED' } });
    const pendingKycCount = await prisma.user.count({ where: { kycStatus: 'PENDING' } });
    
    const transactions = await prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    return {
      totalUsers,
      candidatesCount,
      employersCount,
      totalJobs,
      completedJobs,
      pendingKycCount,
      totalVolume: transactions._sum.amount || 0,
    };
  }

  async remove(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
