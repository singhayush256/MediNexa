import { Controller, Get, Post, Patch, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { StartTrialDto } from './dto/start-trial.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpgradeDowngradePlanDto } from './dto/upgrade-downgrade.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // 1. List Available SaaS Plans (Publicly accessible for pricing page)
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  // 2. Start 14-Day Free Trial
  @UseGuards(JwtAuthGuard)
  @Post('trial')
  async startTrial(@Body() dto: StartTrialDto, @Req() req: any) {
    return this.subscriptionsService.startTrial(dto, req.user);
  }

  // 3. Subscribe to Paid Plan
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeDto, @Req() req: any) {
    return this.subscriptionsService.subscribe(dto, req.user);
  }

  // 4. Current Subscription & Limits
  @UseGuards(JwtAuthGuard)
  @Get('current')
  async getCurrentSubscription(@Req() req: any) {
    return this.subscriptionsService.getCurrentSubscription(req.user);
  }

  // 5. Upgrade Subscription Plan
  @UseGuards(JwtAuthGuard)
  @Patch('upgrade')
  async upgradePlan(@Body() dto: UpgradeDowngradePlanDto, @Req() req: any) {
    return this.subscriptionsService.upgradePlan(dto, req.user);
  }

  // 6. Downgrade Subscription Plan
  @UseGuards(JwtAuthGuard)
  @Patch('downgrade')
  async downgradePlan(@Body() dto: UpgradeDowngradePlanDto, @Req() req: any) {
    return this.subscriptionsService.downgradePlan(dto, req.user);
  }

  // 7. Cancel Auto-Renew Subscription
  @UseGuards(JwtAuthGuard)
  @Patch('cancel')
  async cancelSubscription(@Req() req: any) {
    return this.subscriptionsService.cancelSubscription(req.user);
  }

  // 8. Usage Metering & Quotas
  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsage(@Req() req: any) {
    return this.subscriptionsService.getUsage(req.user);
  }

  // 9. SaaS Invoices
  @UseGuards(JwtAuthGuard)
  @Get('invoices')
  async getInvoices(@Req() req: any) {
    return this.subscriptionsService.getInvoices(req.user);
  }

  // 10. SaaS Revenue Analytics (MRR, ARR, LTV, Churn)
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.subscriptionsService.getAnalytics(req.user);
  }

  // 11. Payment Gateway Webhooks
  @Post('webhooks/stripe')
  async stripeWebhook(@Body() payload: any) {
    return this.subscriptionsService.handleStripeWebhook(payload);
  }

  @Post('webhooks/razorpay')
  async razorpayWebhook(@Body() payload: any) {
    return this.subscriptionsService.handleRazorpayWebhook(payload);
  }
}
