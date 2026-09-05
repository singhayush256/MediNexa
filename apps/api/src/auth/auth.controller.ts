import { Controller, Post, Get, Patch, Param, Query, Body, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  VerifyTotpDto,
  RegisterVerifyTotpDto,
  SetupTotpVerifyDto,
  DisableTotpDto,
  AdminToggle2faDto,
} from './dto/totp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`POST /auth/register - email: ${dto.email}, role: ${dto.role || 'PATIENT'}`);
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    this.logger.log(`POST /auth/login - email: ${dto.email}`);
    return this.authService.login(dto);
  }

  // =========================================================================
  // Google Authenticator (TOTP) 2FA Endpoints
  // =========================================================================

  @Post('register-setup-totp')
  @HttpCode(HttpStatus.OK)
  async registerSetupTotp(@Body() dto: RegisterDto) {
    this.logger.log(`POST /auth/register-setup-totp - email: ${dto.email}`);
    return this.authService.registerInitiateTotp(dto);
  }

  @Post('register-verify-totp')
  @HttpCode(HttpStatus.CREATED)
  async registerVerifyTotp(@Body() dto: RegisterVerifyTotpDto) {
    this.logger.log(`POST /auth/register-verify-totp - validating 6-digit TOTP code`);
    return this.authService.registerVerifyTotp(dto);
  }

  @Post('verify-totp')
  @HttpCode(HttpStatus.OK)
  async verifyTotp(@Body() dto: VerifyTotpDto) {
    this.logger.log(`POST /auth/verify-totp - verifying login 2FA code`);
    return this.authService.verifyLoginTotp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  async setupTotp(@Request() req: any) {
    return this.authService.setupUserTotp(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify-setup')
  @HttpCode(HttpStatus.OK)
  async verifySetupTotp(@Request() req: any, @Body() dto: SetupTotpVerifyDto) {
    return this.authService.verifyAndEnableUserTotp(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disableTotp(@Request() req: any, @Body() dto: DisableTotpDto) {
    return this.authService.disableUserTotp(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/status')
  @HttpCode(HttpStatus.OK)
  async getTotpStatus(@Request() req: any) {
    return this.authService.getUser2faStatus(req.user.id);
  }

  // =========================================================================
  // Admin 2FA Governance Endpoints
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.MEDINEXA_ADMIN, RoleCode.HOSPITAL_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  @Get('admin/users-2fa')
  @HttpCode(HttpStatus.OK)
  async adminGetUsers2fa(@Query('search') search?: string, @Query('role') role?: string) {
    return this.authService.adminGetUsers2fa(search, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.MEDINEXA_ADMIN, RoleCode.HOSPITAL_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  @Post('admin/users/:id/reset-2fa')
  @HttpCode(HttpStatus.OK)
  async adminResetUserTotp(@Param('id') id: string) {
    return this.authService.adminResetUserTotp(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.MEDINEXA_ADMIN, RoleCode.HOSPITAL_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  @Patch('admin/users/:id/toggle-2fa')
  @HttpCode(HttpStatus.OK)
  async adminToggleUser2fa(@Param('id') id: string, @Body() dto: AdminToggle2faDto) {
    return this.authService.adminToggleUser2fa(id, dto.enabled);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.MEDINEXA_ADMIN, RoleCode.HOSPITAL_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  @Post('admin/users/:id/unlock')
  @HttpCode(HttpStatus.OK)
  async adminUnlockUser(@Param('id') id: string) {
    return this.authService.adminUnlockUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Post('register-initiate')
  @HttpCode(HttpStatus.OK)
  async registerInitiate(@Body() dto: RegisterDto) {
    return this.authService.registerInitiate(dto);
  }

  @Post('verify-registration-otp')
  @HttpCode(HttpStatus.CREATED)
  async verifyRegistrationOtp(@Body() body: { email?: string; code: string; registrationToken?: string }) {
    return this.authService.verifyRegistrationOtp(body);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() body: { email: string; purpose?: any }) {
    return this.authService.resendOtp(body);
  }

  @Post('forgot-password-otp')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordOtp(@Body() body: { email: string }) {
    return this.authService.forgotPasswordOtp(body);
  }

  @Post('reset-password-otp')
  @HttpCode(HttpStatus.OK)
  async resetPasswordOtp(
    @Body()
    body: {
      email: string;
      code: string;
      newPassword: string;
      confirmPassword?: string;
      resetSessionToken?: string;
    },
  ) {
    return this.authService.resetPasswordOtp(body);
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
