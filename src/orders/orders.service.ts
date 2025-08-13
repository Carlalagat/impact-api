import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from '../dto';
import { OrderStatus, TicketStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import * as QRCode from 'qrcode';
import { AppMailService } from 'src/mailer/mailer.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: AppMailService,
  ) {}

  async createOrder(sessionId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { sessionId, status: 'ACTIVE' },
      include: {
        items: { include: { product: { include: { event: true } } } },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        cartId: cart.id,
        fullName: dto.fullName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        totalAmount,
        paymentMethod: dto.paymentMethod,
        status: dto.status || OrderStatus.PENDING,
      },
    });

    // Move items to orderItems and adjust stock
    for (const item of cart.items) {
      await this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
        },
      });

      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });

      // Generate tickets if event product
      if (item.product.eventId) {
        for (let i = 0; i < item.quantity; i++) {
          await this.prisma.ticket.create({
            data: {
              ticketCode: uuid(),
              orderId: order.id,
              eventId: item.product.eventId,
              status: TicketStatus.VALID,
            },
          });
        }
      }
    }

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'CHECKED_OUT' },
    });

    // Send QR email immediately
    await this.sendTicketEmail(order.id);

    return order;
  }

  async sendTicketEmail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { tickets: { include: { event: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');

    const ticketData = await Promise.all(
      order.tickets.map(async (ticket) => {
        const qrBuffer = await QRCode.toBuffer(ticket.ticketCode, {
          type: 'png',
        });
        return {
          eventName: ticket.event.name,
          code: ticket.ticketCode,
          qrBase64: qrBuffer.toString('base64'), // for inline display
          buffer: qrBuffer, // for attachment
          fileName: `${ticket.event.name.replace(/\s+/g, '_')}-${ticket.ticketCode}.png`,
        };
      }),
    );

    // Attachments for email
    const attachments = ticketData.map((t) => ({
      filename: t.fileName,
      content: t.buffer,
      contentType: 'image/png',
    }));

    // Send email with both inline QR display and attachments
    await this.emailService.sendTicketEmail(
      order.email,
      order.fullName,
      attachments,
      {
        name: order.fullName,
        tickets: ticketData,
        year: new Date().getFullYear(),
      },
    );
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, tickets: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } }, tickets: true },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
