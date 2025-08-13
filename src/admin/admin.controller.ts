import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from '../dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminUserService: AdminService) {}

  @Post()
  @Roles(AdminRole.SUPERADMIN)
  create(@Body() dto: CreateAdminUserDto) {
    return this.adminUserService.create(dto);
  }

  @Get()
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  findAll() {
    return this.adminUserService.findAll();
  }

  @Patch(':id')
  @Roles(AdminRole.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.adminUserService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.adminUserService.remove(id);
  }
}
