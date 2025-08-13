import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from '../dto';

@Injectable()
export class PartnerService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePartnerDto) {
    return this.prisma.partner.create({ data });
  }

  findAll() {
    return this.prisma.partner.findMany({
      include: { events: true }, // Include related events
    });
  }

  findOne(id: string) {
    return this.prisma.partner.findUnique({
      where: { id },
      include: { events: true },
    });
  }

  async update(id: string, data: UpdatePartnerDto) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');

    return this.prisma.partner.update({ where: { id }, data });
  }

  async remove(id: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');

    return this.prisma.partner.delete({ where: { id } });
  }
}
