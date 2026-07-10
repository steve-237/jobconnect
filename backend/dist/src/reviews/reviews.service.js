"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let ReviewsService = class ReviewsService {
    async createReview(jobId, rating, comment, reviewerId) {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { applications: { where: { isAccepted: true } } },
        });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.status !== 'COMPLETED')
            throw new common_1.ForbiddenException('Job must be COMPLETED to leave a review');
        const acceptedApp = job.applications[0];
        if (!acceptedApp)
            throw new common_1.ForbiddenException('No accepted candidate for this job');
        const isEmployer = job.employerId === reviewerId;
        const isCandidate = acceptedApp.candidateId === reviewerId;
        if (!isEmployer && !isCandidate) {
            throw new common_1.ForbiddenException('You were not part of this job');
        }
        const revieweeId = isEmployer ? acceptedApp.candidateId : job.employerId;
        const existing = await prisma.review.findFirst({
            where: { jobId, reviewerId },
        });
        if (existing)
            throw new common_1.ForbiddenException('You have already left a review for this job');
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
    async getReviewsForUser(userId) {
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)()
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map