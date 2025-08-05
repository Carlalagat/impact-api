// src/admin-users/admin-users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from '../dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  create(createAdminUserDto: CreateAdminUserDto) {
    return this.prisma.adminUser.create({
      data: createAdminUserDto,
    });
  }

  findAll() {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID "${id}" not found.`);
    }
    return admin;
  }

  update(id: string, updateAdminUserDto: UpdateAdminUserDto) {
    return this.prisma.adminUser.update({
      where: { id },
      data: updateAdminUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.adminUser.delete({
      where: { id },
    });
  }
}
