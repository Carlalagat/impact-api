import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import { AdminUser } from '@prisma/client';

@Injectable()
export class AdminAuthService {
  // constructor(
  //   private adminService: AdminService,
  //   private jwtService: JwtService,
  // ) {}

  // async login(email: string, password: string) {
  //   const user = await this.adminService.validateUser(email, password);
  //   if (!user) throw new UnauthorizedException('Invalid credentials');

  //   const payload = { sub: user.id, role: user.role };
  //   return { access_token: this.jwtService.sign(payload) };
  // }
}
