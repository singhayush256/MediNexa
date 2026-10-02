import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

import { OtpService } from './otp.service';
import { TotpService } from './totp.service';
import { TotpCryptoService } from './totp-crypto.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        if (isProduction && (!secret || secret === 'medinexa-dev-jwt-secret-key-change-in-production-day2')) {
          throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be explicitly configured in production mode.');
        }
        return {
          secret: secret || 'medinexa-dev-jwt-secret-key-change-in-production-day2',
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, TotpService, TotpCryptoService, JwtStrategy, RolesGuard],
  exports: [AuthService, OtpService, TotpService, TotpCryptoService, JwtStrategy, PassportModule],
})
export class AuthModule {}
