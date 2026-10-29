import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createAvailabilityDto: CreateAvailabilityDto) {
    return this.prisma.availability.create({
      data: {
        userId,
        date: new Date(createAvailabilityDto.date),
        startTime: createAvailabilityDto.startTime,
        endTime: createAvailabilityDto.endTime,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.availability.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  async remove(id: string, userId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });
    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }
    if (availability.userId !== userId) {
      throw new UnauthorizedException('Unauthorized to delete this availability');
    }
    return this.prisma.availability.delete({
      where: { id },
    });
  }
}
