import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { PaymentService, CreateOrderDto, VerifyPaymentDto, RefundPaymentDto } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.paymentService.createOrder(dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getPaymentHistory(
    @Query('patientId') patientId?: string,
    @Query('facilityId') facilityId?: string,
  ) {
    return this.paymentService.getPaymentHistory(patientId, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  async processRefund(@Body() dto: RefundPaymentDto) {
    return this.paymentService.processRefund(dto);
  }

  @Get('receipt/:invoiceNumber')
  @HttpCode(HttpStatus.OK)
  async getReceipt(@Param('invoiceNumber') invoiceNumber: string) {
    return this.paymentService.getReceiptData(invoiceNumber);
  }
}
