import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from '../dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Superadmin creates a new admin user
  @Post()
  @UseGuards(RolesGuard)
  @Roles(AdminRole.SUPERADMIN)
  create(@Body() dto: CreateAdminUserDto, @Request() req) {
    return this.adminService.create(dto, req.user.role);
  }

  // Superadmin or Staff can view all admins
  @Get()
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  findAll() {
    return this.adminService.findAll();
  }

  // Superadmin updates an admin
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.adminService.update(id, dto);
  }

  // Superadmin deletes an admin
  @Delete(':id')
  @Roles(AdminRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }
}
