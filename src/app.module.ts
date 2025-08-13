import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { PrismaService } from './prisma/prisma.service';

// Importing modules
import { AuthModule } from './auth/auth.module';
import { AppMailerModule } from './mailer.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { PartnerModule } from './partner/partner.module';
import { EventModule } from './event/event.module';
import { ProductModule } from './product/product.module';
import { ImageModule } from './image/image.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppMailerModule,
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
    TestModule,
    AdminModule,
    PartnerModule,
    EventModule,
    ProductModule,
    ImageModule,
    CartModule,
    OrdersModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
