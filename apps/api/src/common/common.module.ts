import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RateLimiterGuard } from './guards/rate-limiter.guard';
import { ClinicalEventBusService } from './events/clinical-event-bus.service';

@Global()
@Module({
  providers: [CacheService, RateLimiterGuard, ClinicalEventBusService],
  exports: [CacheService, RateLimiterGuard, ClinicalEventBusService],
})
export class CommonModule {}
