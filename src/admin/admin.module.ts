import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AdminService],
  controllers: [AdminController, PrismaService],
})
export class AdminModule {}
