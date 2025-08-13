import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from '../dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAdminUserDto) {
    return this.prisma.adminUser.create({ data });
  }

  findAll() {
    return this.prisma.adminUser.findMany();
  }

  findOne(id: string) {
    return this.prisma.adminUser.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateAdminUserDto) {
    return this.prisma.adminUser.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.adminUser.delete({ where: { id } });
  }
}
