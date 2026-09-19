import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RateLimiterGuard } from './guards/rate-limiter.guard';

@Global()
@Module({
  providers: [CacheService, RateLimiterGuard],
  exports: [CacheService, RateLimiterGuard],
})
export class CommonModule {}
