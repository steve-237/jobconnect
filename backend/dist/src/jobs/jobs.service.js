"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let JobsService = class JobsService {
    async create(createJobDto, employerId) {
        return prisma.job.create({
            data: {
                title: createJobDto.title,
                description: createJobDto.description,
                price: createJobDto.price,
                location: createJobDto.location,
                categoryId: createJobDto.categoryId,
                employerId: employerId,
            },
        });
    }
    async findAll() {
        return prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                employer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                category: true,
                employer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${id} not found`);
        }
        return job;
    }
    async update(id, updateJobDto, userId) {
        const job = await this.findOne(id);
        if (job.employerId !== userId) {
            throw new Error('Unauthorized to update this job');
        }
        return prisma.job.update({
            where: { id },
            data: updateJobDto,
        });
    }
    async remove(id, userId) {
        const job = await this.findOne(id);
        if (job.employerId !== userId) {
            throw new Error('Unauthorized to delete this job');
        }
        return prisma.job.delete({
            where: { id },
        });
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)()
], JobsService);
//# sourceMappingURL=jobs.service.js.map