import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class JobsService {
  async create(createJobDto: CreateJobDto, employerId: string) {
    return prisma.job.create({
      data: {
        title: createJobDto.title,
        description: createJobDto.description,
        price: createJobDto.price,
        location: createJobDto.location,
        categoryId: createJobDto.categoryId,
        employerId: employerId,
        scheduledDate: createJobDto.scheduledDate ? new Date(createJobDto.scheduledDate) : null,
        estimatedDuration: createJobDto.estimatedDuration ? Number(createJobDto.estimatedDuration) : null,
      },
    });
  }

  async findAll(query: any = {}) {
    const { search, categoryId, location, minPrice, maxPrice } = query;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Hide completed and cancelled jobs from public browse feed
    where.status = { notIn: ['COMPLETED', 'CANCELLED'] };

    return prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
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
            isVerified: true,
          },
        },
      },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async findMyJobs(employerId: string) {
    return prisma.job.findMany({
      where: { employerId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyCalendar(candidateId: string) {
    return prisma.job.findMany({
      where: {
        applications: {
          some: {
            candidateId,
            isAccepted: true,
          }
        },
        scheduledDate: { not: null },
      },
      orderBy: { scheduledDate: 'asc' },
      include: {
        employer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        }
      }
    });
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string) {
    const job = await this.findOne(id);
    if (job.employerId !== userId) {
      throw new Error('Unauthorized to update this job');
    }
    return prisma.job.update({
      where: { id },
      data: updateJobDto,
    });
  }

  async updateStatus(id: string, status: any, userId: string) {
    const job = await this.findOne(id);
    if (job.employerId !== userId) {
      throw new Error('Unauthorized to update this job');
    }
    return prisma.job.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, userId: string) {
    const job = await this.findOne(id);
    if (job.employerId !== userId) {
      throw new ForbiddenException('Unauthorized to delete this job');
    }
    return prisma.job.delete({
      where: { id },
    });
  }
}
