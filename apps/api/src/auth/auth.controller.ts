import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  async verifyResetToken(@Body('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      message: 'Successfully logged out.',
    };
  }

  // =========================================================================
  // Development / Test Role-Protected Endpoints
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.PATIENT, RoleCode.MEDINEXA_ADMIN)
  @Get('test/patient')
  async testPatientEndpoint(@Request() req: any) {
    return {
      message: 'Welcome Patient! Access granted to patient test portal.',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.MEDINEXA_ADMIN)
  @Get('test/doctor')
  async testDoctorEndpoint(@Request() req: any) {
    return {
      message: 'Welcome Doctor! Access granted to clinical provider test portal.',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('test/admin')
  async testAdminEndpoint(@Request() req: any) {
    return {
      message: 'Welcome Administrator! Access granted to facility admin test portal.',
      user: req.user,
    };
  }
}
