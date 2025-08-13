import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(sessionId: string) {
    return this.prisma.cart.findFirst({
      where: { sessionId },
      include: { items: { include: { product: true } } },
    });
  }

  async addToCart(sessionId: string, dto: AddToCartDto) {
    let cart = await this.prisma.cart.findFirst({ where: { sessionId } });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { sessionId, status: 'ACTIVE' },
      });
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
          priceAtTime: product.price,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        priceAtTime: product.price,
      },
    });
  }

  async updateItem(sessionId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findFirst({ where: { sessionId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.cartId !== cart.id)
      throw new NotFoundException('Item not found in your cart');

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
  }

  async removeItem(sessionId: string, itemId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { sessionId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.cartId !== cart.id)
      throw new NotFoundException('Item not found in your cart');

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  // Admin
  getAllCarts() {
    return this.prisma.cart.findMany({
      include: { items: { include: { product: true } } },
    });
  }
}
