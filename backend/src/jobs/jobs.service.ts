import { Injectable, NotFoundException } from '@nestjs/common';
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
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
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

  async remove(id: string, userId: string) {
    const job = await this.findOne(id);
    if (job.employerId !== userId) {
      throw new Error('Unauthorized to delete this job');
    }
    return prisma.job.delete({
      where: { id },
    });
  }
}
