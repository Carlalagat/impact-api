/** Service aggregates data using Prisma */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns high-level dashboard stats */
  async getDashboardStats() {
    /** Parallelize counts for speed */
    const [
      eventsCount,
      partnersCount,
      productsCount,
      ticketsCount,
      ordersCount,
      revenueAgg,
      upcomingEventsCount,
      lowStockCount,
      distinctCustomers,
      last7dRevenueAgg,
    ] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.partner.count(),
      this.prisma.product.count(),
      this.prisma.ticket.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.event.count({
        where: { date: { gte: startOfDay(new Date()) } },
      }),
      this.prisma.product.count({ where: { stockQuantity: { lt: 10 } } }),
      /** distinct customer emails based on orders */
      this.prisma.order.findMany({
        select: { email: true },
        distinct: ['email'],
      }),
      /** last 7 days revenue */
      this.prisma.order.aggregate({
        where: { createdAt: { gte: daysAgo(7) } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      /** cards */
      events: eventsCount,
      partners: partnersCount,
      products: productsCount,
      tickets: ticketsCount,
      orders: ordersCount,
      revenue: Number(revenueAgg._sum.totalAmount ?? 0),

      /** quick KPIs */
      upcomingEvents: upcomingEventsCount,
      lowStockProducts: lowStockCount,
      customers: distinctCustomers.length,
      last7dRevenue: Number(last7dRevenueAgg._sum.totalAmount ?? 0),
    };
  }

  /** Returns monthly series for charts (orders, tickets, events) */
  async getTrends(year: number) {
    /** date range for given year */
    const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const to = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

    /** groupBy month via raw query (Prisma groupBy lacks date_trunc helpers) */
    const [ordersMonthly, ticketsMonthly, eventsMonthly] = await Promise.all([
      this.prisma.$queryRawUnsafe<
        Array<{ month: number; count: number; total: number }>
      >(
        `
        select extract(month from "createdAt")::int as month,
               count(*)::int as count,
               coalesce(sum("totalAmount"),0)::float as total
        from "Order"
        where "createdAt" >= $1 and "createdAt" < $2
        group by 1
        order by 1
        `,
        from,
        to,
      ),
      this.prisma.$queryRawUnsafe<Array<{ month: number; count: number }>>(
        `
        select extract(month from "issuedAt")::int as month,
               count(*)::int as count
        from "Ticket"
        where "issuedAt" >= $1 and "issuedAt" < $2
        group by 1
        order by 1
        `,
        from,
        to,
      ),
      this.prisma.$queryRawUnsafe<Array<{ month: number; count: number }>>(
        `
        select extract(month from "date")::int as month,
               count(*)::int as count
        from "Event"
        where "date" >= $1 and "date" < $2
        group by 1
        order by 1
        `,
        from,
        to,
      ),
    ]);

    /** normalize to 12-month arrays */
    const byIndex = <T>(arr: T[], defaultVal: T) =>
      Array.from({ length: 12 }, (_, i) => arr[i] ?? defaultVal);

    const ordersCount = Array(12).fill(0);
    const ordersTotal = Array(12).fill(0);
    for (const r of ordersMonthly) {
      const idx = r.month - 1;
      ordersCount[idx] = r.count;
      ordersTotal[idx] = r.total;
    }

    const tickets = Array(12).fill(0);
    for (const r of ticketsMonthly) tickets[r.month - 1] = r.count;

    const events = Array(12).fill(0);
    for (const r of eventsMonthly) events[r.month - 1] = r.count;

    return {
      year,
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      orders: { count: ordersCount, revenue: ordersTotal },
      tickets,
      events,
    };
  }

  /** Returns a merged feed of recent activity across entities */
  async getRecentActivity(limit: number) {
    /** Fetch latest per-entity then merge in-memory by createdAt */
    const [events, orders, partners, products] = await Promise.all([
      this.prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          createdAt: true,
          location: true,
          type: true,
        },
      }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          totalAmount: true,
          createdAt: true,
          status: true,
        },
      }),
      this.prisma.partner.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, website: true, createdAt: true },
      }),
      this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
          stockQuantity: true,
        },
      }),
    ]);

    /** Map to a common shape */
    const mapped = [
      ...events.map((e) => ({
        type: 'EVENT' as const,
        id: e.id,
        title: e.name,
        details: `${e.type} • ${e.location}`,
        createdAt: e.createdAt,
      })),
      ...orders.map((o) => ({
        type: 'ORDER' as const,
        id: o.id,
        title: `${o.fullName} • $${o.totalAmount.toFixed(2)}`,
        details: `${o.email} • ${o.status}`,
        createdAt: o.createdAt,
      })),
      ...partners.map((p) => ({
        type: 'PARTNER' as const,
        id: p.id,
        title: p.name,
        details: p.website ?? '',
        createdAt: p.createdAt,
      })),
      ...products.map((p) => ({
        type: 'PRODUCT' as const,
        id: p.id,
        title: p.name,
        details: `Price $${p.price.toFixed(2)} • Stock ${p.stockQuantity}`,
        createdAt: p.createdAt,
      })),
    ];

    /** Sort & clip */
    mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return mapped.slice(0, limit);
  }
}

/** --- helpers --- */
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
