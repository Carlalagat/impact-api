import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from '../dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  findAll() {
    return this.prisma.event.findMany({
      include: {
        Partner: true,
        products: true,
        tickets: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        Partner: true,
        products: true,
        tickets: true,
      },
    });
  }

  async update(id: string, data: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    return this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    return this.prisma.event.delete({ where: { id } });
  }
}
