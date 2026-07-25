import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { NotFoundException } from '@nestjs/common';

// Mock PrismaClient to avoid real database calls during tests
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService],
    }).compile();

    service = module.get<JobsService>(JobsService);

    // Clear all mocks before each test
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if job does not exist', async () => {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.job.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the job if it exists', async () => {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const mockJob = { id: '123', title: 'Test Job', employerId: 'emp-1' };
      prisma.job.findUnique.mockResolvedValue(mockJob);

      const result = await service.findOne('123');
      expect(result).toEqual(mockJob);
      expect(prisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should throw error if user is not the employer', async () => {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const mockJob = { id: '123', title: 'Test Job', employerId: 'emp-1' };
      prisma.job.findUnique.mockResolvedValue(mockJob);

      await expect(
        service.update('123', { title: 'New Title' }, 'hacker-user'),
      ).rejects.toThrow('Unauthorized to update this job');
    });
  });
});
