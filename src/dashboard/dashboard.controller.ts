import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** High-level counters and quick KPIs */
  @Get('stats')
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }

  /** Monthly charts (orders, tickets, events) for a specific year */
  @Get('trends')
  async getTrends(@Query('year') year?: string) {
    const y = Number(year) || new Date().getFullYear();
    return this.dashboardService.getTrends(y);
  }

  /** Recent cross-entity activity (events, orders, partners, products) */
  @Get('activity')
  async getActivity(@Query('limit') limit?: string) {
    const l = Math.max(1, Math.min(Number(limit) || 20, 100));
    return this.dashboardService.getRecentActivity(l);
  }
}
