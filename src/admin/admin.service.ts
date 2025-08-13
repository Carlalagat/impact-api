import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from '../dto';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Create a new admin user
  async create(data: CreateAdminUserDto, creatorRole: AdminRole) {
    if (
      data.role === AdminRole.SUPERADMIN &&
      creatorRole !== AdminRole.SUPERADMIN
    ) {
      throw new ForbiddenException(
        'Only Superadmin can create another superadmin',
      );
    }

    const roleToUse = data.role || AdminRole.STAFF;

    return this.prisma.adminUser.create({
      data: {
        id: undefined,
        supabaseId: data.supabaseId,
        name: data.name,
        email: data.email,
        role: roleToUse,
      },
    });
  }

  // Find all admin users
  findAll() {
    return this.prisma.adminUser.findMany();
  }

  // Find one admin by DB id
  findOne(id: string) {
    return this.prisma.adminUser.findUnique({ where: { id } });
  }

  // Update an admin user
  async update(id: string, data: UpdateAdminUserDto) {
    return this.prisma.adminUser.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role || AdminRole.STAFF,
      },
    });
  }

  // Remove an admin user
  remove(id: string) {
    return this.prisma.adminUser.delete({ where: { id } });
  }
}
