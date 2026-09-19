import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RateLimiterGuard } from './guards/rate-limiter.guard';
import { HospitalTenantGuard } from './guards/hospital-tenant.guard';
import { ClinicalEventBusService } from './events/clinical-event-bus.service';

@Global()
@Module({
  providers: [CacheService, RateLimiterGuard, HospitalTenantGuard, ClinicalEventBusService],
  exports: [CacheService, RateLimiterGuard, HospitalTenantGuard, ClinicalEventBusService],
})
export class CommonModule {}
