import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async validateTicket(ticketCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode },
      include: { event: true, order: true },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status !== TicketStatus.VALID) {
      throw new BadRequestException(`Ticket is ${ticket.status}`);
    }

    return {
      valid: true,
      event: ticket.event.name,
      issuedTo: ticket.order.fullName,
      issuedAt: ticket.issuedAt,
    };
  }

  async checkInTicket(ticketCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status !== TicketStatus.VALID) {
      throw new BadRequestException(`Ticket is ${ticket.status}`);
    }

    return this.prisma.ticket.update({
      where: { ticketCode },
      data: {
        status: TicketStatus.USED,
        usedAt: new Date(),
      },
    });
  }

  async listTickets(eventId?: string) {
    return this.prisma.ticket.findMany({
      where: eventId ? { eventId } : {},
      include: { event: true, order: true },
    });
  }
}
