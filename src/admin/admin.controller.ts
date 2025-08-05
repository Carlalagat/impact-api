import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from '../dto';
import { Roles } from '../auth/decorator';
import { RolesGuard } from '../auth/guard';
import { AdminRole } from '@prisma/client';

// Protect the entire controller - user must be logged in.
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminUsersService: AdminService) {}

  // Only a SUPERADMIN can create new admins.
  @Post()
  @Roles(AdminRole.SUPERADMIN)
  create(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.adminUsersService.create(createAdminUserDto);
  }

  // Any logged-in admin (STAFF or SUPERADMIN) can see the list.
  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }

  // Any logged-in admin can view a single profile.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  // Only a SUPERADMIN can change another admin's details (e.g., promote to SUPERADMIN).
  @Patch(':id')
  @Roles(AdminRole.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.update(id, updateAdminUserDto);
  }

  // Only a SUPERADMIN can delete another admin.
  @Delete(':id')
  @Roles(AdminRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.adminUsersService.remove(id);
  }
}
