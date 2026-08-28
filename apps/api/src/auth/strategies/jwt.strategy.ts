import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserStatus } from '@medinexa/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    if (isProduction && (!jwtSecret || jwtSecret === 'medinexa-dev-jwt-secret-key-change-in-production-day2')) {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be explicitly configured in production mode.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret || 'medinexa-dev-jwt-secret-key-change-in-production-day2',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
        organization: true,
        facility: true,
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is suspended or disabled');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      roleCode: user.role.code,
      role: user.role.code,
      organizationId: user.organizationId,
      facilityId: user.facilityId,
      organization: user.organization,
      facility: user.facility,
      patientProfile: user.patientProfile,
      doctorProfile: user.doctorProfile,
    };
  }
}
