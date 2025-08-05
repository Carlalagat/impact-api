import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from '../dto';

@Injectable()
export class PartnerService {
  constructor(private prisma: PrismaService) {}

  create(createPartnerDto: CreatePartnerDto) {
    return this.prisma.partner.create({
      data: createPartnerDto,
    });
  }

  findAll() {
    return this.prisma.partner.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID "${id}" not found.`);
    }
    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto) {
    // First, verify the partner exists
    await this.findOne(id);
    return this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
    });
  }

  async remove(id: string) {
    // First, verify the partner exists
    await this.findOne(id);
    // Note: If you have events linked to this partner, you need to decide
    // what happens to them. Our schema has `onDelete: SetNull`, so Prisma
    // will automatically set the `partnerId` on related events to null.
    return this.prisma.partner.delete({
      where: { id },
    });
  }
}
