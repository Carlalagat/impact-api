import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
// Custom JWT strategy extending Passport's built-in Strategy
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      // Tell Passport where to find the JWT in incoming requests
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET,
    });
  }

  /**
   * This method is called automatically after Passport validates the JWT signature.
   * It receives the decoded JWT payload.
   * You can now do any additional validation (e.g., check if user exists in DB).
   */
  async validate(payload: { sub: string; email: string }) {
    if (!payload || !payload.sub) {
      // Basic check: JWT must have a subject
      throw new UnauthorizedException('Invalid token payload');
    }

    // The user ID (UUID from Supabase) is stored in `sub`
    const adminId = payload.sub;

    // Look up the admin in our own database (not just Supabase auth)
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      // Token is real, but user isn't in our local Admin table
      throw new UnauthorizedException('Access Denied. Not an admin.');
    }

    // Success: valid admin user found
    // Nest will attach this object to `req.user` in your protected routes
    const { ...result } = admin;
    return result;
  }
}
