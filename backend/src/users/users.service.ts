import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = await prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role || 'CANDIDATE',
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findAll() {
    return prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async updatePushToken(id: string, token: string) {
    return prisma.user.update({
      where: { id },
      data: { expoPushToken: token },
    });
  }

  async findOne(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
