import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  paris: { lat: 48.8566, lng: 2.3522 },
  lyon: { lat: 45.764, lng: 4.8357 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  nice: { lat: 43.7102, lng: 7.262 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  lille: { lat: 50.6292, lng: 3.0573 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  reims: { lat: 49.2583, lng: 4.0317 },
  toulon: { lat: 43.1242, lng: 5.928 },
  grenoble: { lat: 45.1885, lng: 5.7245 },
  dijon: { lat: 47.322, lng: 5.0415 },
  angers: { lat: 47.4784, lng: -0.5632 },
  nimes: { lat: 43.8367, lng: 4.3601 },
  aix: { lat: 43.5297, lng: 5.4474 },
  'saint-etienne': { lat: 45.4397, lng: 4.3872 },
  brest: { lat: 48.3904, lng: -4.4861 },
  tours: { lat: 47.3941, lng: 0.6848 },
  limoges: { lat: 45.8336, lng: 1.2611 },
  clermont: { lat: 45.7772, lng: 3.087 },
  orleans: { lat: 47.9029, lng: 1.909 },
  metz: { lat: 49.1193, lng: 6.1757 },
  rouen: { lat: 49.4431, lng: 1.0993 },
  nancy: { lat: 48.6921, lng: 6.1844 },
  caen: { lat: 49.1828, lng: -0.3707 },
};

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getJobCoordinates(job: any): { lat: number; lng: number } {
  if (job.latitude && job.longitude && !isNaN(Number(job.latitude)) && !isNaN(Number(job.longitude))) {
    return { lat: Number(job.latitude), lng: Number(job.longitude) };
  }

  const hash = (job.id || job.title || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const latOffset = (((hash % 41) - 20) * 0.0045); // ~ 1km - 10km realistic neighborhood offset
  const lngOffset = ((((hash * 13) % 41) - 20) * 0.0045);

  if (job.location) {
    const locLower = job.location.toLowerCase();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (locLower.includes(city)) {
        return { lat: coords.lat + latOffset, lng: coords.lng + lngOffset };
      }
    }
  }
  return { lat: 48.8566 + latOffset, lng: 2.3522 + lngOffset };
}

function getLocationCoordinates(userLocation?: string, lat?: string, lng?: string): { lat: number; lng: number } {
  if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  if (userLocation) {
    const locLower = userLocation.toLowerCase().trim();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (locLower.includes(city) || city.includes(locLower)) {
        return coords;
      }
    }
  }
  return { lat: 48.8566, lng: 2.3522 }; // Paris default reference
}

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
    const { search, categoryId, location, userLocation, minPrice, maxPrice, lat, lng, radius } = query;
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
    if (location && !userLocation && !lat && !lng) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Hide completed and cancelled jobs from public browse feed
    where.status = { notIn: ['COMPLETED', 'CANCELLED'] };

    const jobs = await prisma.job.findMany({
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

    const refCoords = getLocationCoordinates(userLocation || location, lat, lng);
    const parsedRadius = radius ? parseFloat(radius) : 1000;
    const maxRadius = parsedRadius >= 500 ? 5000 : parsedRadius;

    const jobsWithDistance = jobs.map((job) => {
      const coords = getJobCoordinates(job);
      const rawDistance = getHaversineDistanceKm(refCoords.lat, refCoords.lng, coords.lat, coords.lng);
      // Realistic distance calculation rounded to 1 decimal, minimum 0.8 km
      const distanceKm = Math.max(0.8, Math.round(rawDistance * 10) / 10);
      return {
        ...job,
        distanceKm,
      };
    });

    return jobsWithDistance
      .filter((j) => j.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);
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
        category: true,
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isVerified: true,
          },
        },
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
      },
      orderBy: { createdAt: 'desc' },
      include: {
        employer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        applications: {
          where: { candidateId, isAccepted: true },
          select: { id: true, isAccepted: true, status: true }
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
