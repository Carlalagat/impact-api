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
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Public — needs sessionId
  @Get()
  getCart(@Query('sessionId') sessionId: string) {
    return this.cartService.getCart(sessionId);
  }

  @Post('add')
  addToCart(@Query('sessionId') sessionId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(sessionId, dto);
  }

  @Patch('item/:itemId')
  updateItem(
    @Query('sessionId') sessionId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(sessionId, itemId, dto);
  }

  @Delete('item/:itemId')
  removeItem(
    @Query('sessionId') sessionId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(sessionId, itemId);
  }

  // Admin — view all carts
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
  getAllCarts() {
    return this.cartService.getAllCarts();
  }
}
