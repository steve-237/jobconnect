"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let ApplicationsService = class ApplicationsService {
    async create(createApplicationDto, candidateId) {
        const job = await prisma.job.findUnique({
            where: { id: createApplicationDto.jobId },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        if (job.status !== 'PENDING' && job.status !== 'PUBLISHED') {
            throw new common_1.ForbiddenException('This job is no longer accepting applications');
        }
        const existing = await prisma.application.findUnique({
            where: {
                jobId_candidateId: {
                    jobId: createApplicationDto.jobId,
                    candidateId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('You have already applied for this job');
        }
        return prisma.application.create({
            data: {
                jobId: createApplicationDto.jobId,
                candidateId,
                message: createApplicationDto.message,
            },
        });
    }
    async findAllForCandidate(candidateId) {
        return prisma.application.findMany({
            where: { candidateId },
            include: {
                job: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllForJob(jobId, employerId) {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job || job.employerId !== employerId) {
            throw new common_1.ForbiddenException('You do not own this job');
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
    async acceptApplication(id, employerId) {
        const application = await prisma.application.findUnique({
            where: { id },
            include: { job: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.job.employerId !== employerId) {
            throw new common_1.ForbiddenException('You do not own this job');
        }
        const updated = await prisma.application.update({
            where: { id },
            data: { isAccepted: true },
        });
        await prisma.job.update({
            where: { id: application.jobId },
            data: { status: 'IN_PROGRESS' },
        });
        return updated;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)()
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map