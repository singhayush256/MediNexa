import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicDoctorQueryDto } from './dto/public-doctor-query.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateGuestBookingDto } from './dto/guest-booking.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('doctors')
  async getPublicDoctors(@Query() query: PublicDoctorQueryDto) {
    return this.publicService.getPublicDoctors(query);
  }

  @Get('doctors/:id')
  async getPublicDoctorById(
    @Param('id') id: string,
    @Query('date') date?: string,
  ) {
    return this.publicService.getPublicDoctorById(id, date);
  }

  @Post('otp/send')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.publicService.sendOtp(dto);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.publicService.verifyOtp(dto);
  }

  @Post('appointments/book')
  async bookGuestAppointment(@Body() dto: CreateGuestBookingDto) {
    return this.publicService.bookGuestAppointment(dto);
  }
}
