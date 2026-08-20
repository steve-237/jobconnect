import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AvailabilitiesService {
  async create(userId: string, createAvailabilityDto: CreateAvailabilityDto) {
    return prisma.availability.create({
      data: {
        userId,
        date: new Date(createAvailabilityDto.date),
        startTime: createAvailabilityDto.startTime,
        endTime: createAvailabilityDto.endTime,
      },
    });
  }

  async findAllByUser(userId: string) {
    return prisma.availability.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  async remove(id: string, userId: string) {
    const availability = await prisma.availability.findUnique({
      where: { id },
    });
    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }
    if (availability.userId !== userId) {
      throw new UnauthorizedException('Unauthorized to delete this availability');
    }
    return prisma.availability.delete({
      where: { id },
    });
  }
}
