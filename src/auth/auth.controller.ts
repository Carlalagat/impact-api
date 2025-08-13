import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from './auth.service';
import { AdminLoginDto } from './dto';

@Controller('admin/auth')
export class AdminAuthController {
  // constructor(private authService: AdminAuthService) {}

  // @Post('login')
  // async login(@Body() dto: AdminLoginDto) {
  //   return this.authService.login(dto.email, dto.password);
  // }
}
