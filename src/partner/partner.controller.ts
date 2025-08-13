import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { CreatePartnerDto, UpdatePartnerDto } from '../dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  // PUBLIC
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.partnerService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  // PUBLIC
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnerService.findOne(id);
  }

  // PROTECTED: Only SUPERADMIN & STAFF
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  create(@Body() dto: CreatePartnerDto) {
    return this.partnerService.create(dto);
  }

  // PROTECTED
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnerService.update(id, dto);
  }

  // PROTECTED
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  remove(@Param('id') id: string) {
    return this.partnerService.remove(id);
  }
}
