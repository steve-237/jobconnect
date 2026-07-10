"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const prisma = new client_1.PrismaClient();
let ApplicationsService = class ApplicationsService {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
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
        const candidate = await prisma.user.findUnique({ where: { id: application.candidateId } });
        if (candidate?.expoPushToken) {
            await this.notificationsService.sendPushNotification(candidate.expoPushToken, 'Candidature Acceptée ! 🎉', `Votre candidature pour "${application.job.title}" a été acceptée. Vous pouvez maintenant discuter avec l'employeur !`, { type: 'application_accepted', applicationId: id });
        }
        return updated;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map