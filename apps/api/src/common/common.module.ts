import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import { RateLimiterGuard } from './guards/rate-limiter.guard';
import { HospitalTenantGuard } from './guards/hospital-tenant.guard';
import { ClinicalEventBusService } from './events/clinical-event-bus.service';
import { FieldEncryptionService } from './crypto/field-encryption.service';
import { SecurityAuditInterceptor } from './interceptors/security-audit.interceptor';
import { InputSanitizerMiddleware } from './middleware/input-sanitizer.middleware';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    CacheService,
    RateLimiterGuard,
    HospitalTenantGuard,
    ClinicalEventBusService,
    FieldEncryptionService,
    SecurityAuditInterceptor,
    InputSanitizerMiddleware,
  ],
  exports: [
    CacheService,
    RateLimiterGuard,
    HospitalTenantGuard,
    ClinicalEventBusService,
    FieldEncryptionService,
    SecurityAuditInterceptor,
    InputSanitizerMiddleware,
  ],
})
export class CommonModule {}
