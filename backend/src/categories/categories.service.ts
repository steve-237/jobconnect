import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CategoriesService {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }
}
