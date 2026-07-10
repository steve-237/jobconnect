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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const prisma = new client_1.PrismaClient();
let MessagesService = class MessagesService {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async verifyAccess(applicationId, userId) {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (!application.isAccepted) {
            throw new common_1.ForbiddenException('You cannot chat until the application is accepted.');
        }
        const isCandidate = application.candidateId === userId;
        const isEmployer = application.job.employerId === userId;
        if (!isCandidate && !isEmployer) {
            throw new common_1.ForbiddenException('You do not have access to this chat.');
        }
        return application;
    }
    async saveMessage(applicationId, senderId, content) {
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
        const receiverId = isEmployer ? application.candidateId : application.job.employerId;
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (receiver?.expoPushToken) {
            await this.notificationsService.sendPushNotification(receiver.expoPushToken, `New message from ${savedMessage.sender.firstName}`, content, { type: 'chat', applicationId });
        }
        return savedMessage;
    }
    async getHistory(applicationId, userId) {
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
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.