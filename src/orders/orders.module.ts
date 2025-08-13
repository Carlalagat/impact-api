import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AppMailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [AppMailerModule],
  providers: [OrdersService, PrismaService],
  controllers: [OrdersController]
})
export class OrdersModule {}
