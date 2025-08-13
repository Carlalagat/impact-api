import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ValidateTicketDto } from '../dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Public: validate before check-in
  @Post('validate')
  validate(@Body() dto: ValidateTicketDto) {
    return this.ticketsService.validateTicket(dto.ticketCode);
  }

  // Admin: mark ticket as used
  @Post('check-in')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  checkIn(@Body() dto: ValidateTicketDto) {
    return this.ticketsService.checkInTicket(dto.ticketCode);
  }

  // Admin: list tickets (optionally filter by event)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  list(@Query('eventId') eventId?: string) {
    return this.ticketsService.listTickets(eventId);
  }
}
