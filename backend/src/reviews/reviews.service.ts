import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ReviewsService {
  async createReview(jobId: string, rating: number, comment: string, reviewerId: string) {
    // 1. Verify Job exists and is COMPLETED
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { applications: { where: { isAccepted: true } } },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== 'COMPLETED') throw new ForbiddenException('Job must be COMPLETED to leave a review');

    const acceptedApp = job.applications[0];
    if (!acceptedApp) throw new ForbiddenException('No accepted candidate for this job');

    // 2. Determine Reviewee
    const isEmployer = job.employerId === reviewerId;
    const isCandidate = acceptedApp.candidateId === reviewerId;

    if (!isEmployer && !isCandidate) {
      throw new ForbiddenException('You were not part of this job');
    }

    const revieweeId = isEmployer ? acceptedApp.candidateId : job.employerId;

    // 3. Check if already reviewed
    const existing = await prisma.review.findFirst({
      where: { jobId, reviewerId },
    });
    if (existing) throw new ForbiddenException('You have already left a review for this job');

    return prisma.review.create({
      data: {
        rating,
        comment,
        jobId,
        reviewerId,
        revieweeId,
      },
    });
  }

  async getReviewsForUser(userId: string) {
    return prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        },
        job: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
