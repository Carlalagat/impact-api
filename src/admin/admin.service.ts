import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from '../dto';
import { AdminRole } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { Cron, CronExpression } from '@nestjs/schedule';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAdminUserDto, creatorRole: AdminRole) {
    // Restrict who can create superadmins
    if (
      data.role === AdminRole.SUPERADMIN &&
      creatorRole !== AdminRole.SUPERADMIN
    ) {
      throw new ForbiddenException(
        'Only Superadmin can create another superadmin',
      );
    }

    // 1. Invite user via Supabase Auth (they’ll get email to set password)
    const { data: supaData, error } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: { role: data.role || AdminRole.STAFF },
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const supabaseId = supaData.user.id;
    const roleToUse = data.role || AdminRole.STAFF;

    // 2. Store in DB
    return this.prisma.adminUser.create({
      data: {
        supabaseId,
        name: data.name,
        email: data.email,
        role: roleToUse,
      },
    });
  }

  findAll() {
    return this.prisma.adminUser.findMany({
      where: { deletedAt: null },
    });
  }

  findOne(id: string) {
    return this.prisma.adminUser.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateAdminUserDto) {
    return this.prisma.adminUser.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role || AdminRole.STAFF,
      },
    });
  }

  async remove(id: string) {
    const staff = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!staff) throw new BadRequestException('Staff not found');

    // Delete from Supabase
    const { error: supaError } = await supabaseAdmin.auth.admin.deleteUser(
      staff.supabaseId,
    );
    if (supaError) {
      throw new BadRequestException(
        `Supabase deletion failed: ${supaError.message}`,
      );
    }

    // Soft delete in DB
    return this.prisma.adminUser.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    const staff = await this.prisma.adminUser.findUnique({
      where: { id },
    });
    if (!staff || !staff.deletedAt) {
      throw new BadRequestException('Staff not found or not deleted');
    }

    // Recreate in Supabase
    const { data: supaData, error } = await supabaseAdmin.auth.admin.createUser(
      {
        email: staff.email,
        password: process.env.DEFAULT_STAFF_PASSWORD || 'TempPass123!',
        email_confirm: true,
      },
    );
    if (error) throw new BadRequestException(error.message);

    // Update with new Supabase ID + clear deletedAt
    return this.prisma.adminUser.update({
      where: { id },
      data: {
        supabaseId: supaData.user.id,
        deletedAt: null,
      },
    });
  }

  async purgeDeleted(olderThanDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Find all users marked deleted before the cutoff
    const oldStaff = await this.prisma.adminUser.findMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
        },
      },
    });

    for (const staff of oldStaff) {
      try {
        // Just in case Supabase account still exists
        await supabaseAdmin.auth.admin.deleteUser(staff.supabaseId);
      } catch (err) {
        console.warn(
          `Supabase deletion failed for ${staff.email}:`,
          err.message,
        );
      }
    }

    // Remove from DB
    const deletedCount = await this.prisma.adminUser.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
        },
      },
    });

    return {
      message: `${deletedCount.count} old deleted staff purged`,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoPurgeDeleted() {
    const result = await this.purgeDeleted(90);
    console.log('Auto purge result:', result);
  }
}
