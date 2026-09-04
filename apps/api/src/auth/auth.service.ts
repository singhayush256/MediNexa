import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RoleCode, UserStatus, AuthResponseDto, UserDto } from '@medinexa/types';
import { isPrivilegedRole, normalizeRoleCode } from '@medinexa/validation';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Resolve effective name
    const firstName = (dto.firstName || (dto.fullName ? dto.fullName.trim().split(' ')[0] : (dto.name ? dto.name.trim().split(' ')[0] : ''))).trim();
    const lastName = (dto.lastName || (dto.fullName ? dto.fullName.trim().split(' ').slice(1).join(' ') : (dto.name ? dto.name.trim().split(' ').slice(1).join(' ') : ''))).trim();
    const effectiveName = `${firstName} ${lastName}`.trim() || dto.fullName || dto.name || 'User';

    const effectivePhone =
      dto.phone ||
      (dto.countryCode && dto.mobileNumber ? `${dto.countryCode} ${dto.mobileNumber}` : dto.mobileNumber) ||
      null;

    if (!firstName && !dto.fullName && !dto.name) {
      throw new BadRequestException('First name is required.');
    }

    // 2. Email format & uniqueness validation
    if (!dto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
      throw new BadRequestException('Invalid email format');
    }
    const cleanEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 3. Password security complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(dto.password)) {
      throw new BadRequestException('Password requirements not met');
    }

    // 4. Password confirmation check
    if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // 5. Role resolution across all 9 allowed roles
    let rawRole = (dto.role || dto.roleCode || 'PATIENT').toUpperCase().trim();
    const roleMapping: Record<string, string> = {
      PATIENT: 'PATIENT',
      DOCTOR: 'DOCTOR',
      NURSE: 'NURSE',
      RECEPTIONIST: 'RECEPTIONIST',
      PHARMACIST: 'PHARMACIST',
      PHARMACY_STAFF: 'PHARMACIST',
      LAB_TECHNICIAN: 'LAB_STAFF',
      LAB_TECH: 'LAB_STAFF',
      LAB_STAFF: 'LAB_STAFF',
      BILLING_STAFF: 'BILLING_STAFF',
      BILLING: 'BILLING_STAFF',
      INSURANCE_STAFF: 'INSURANCE_STAFF',
      INSURANCE: 'INSURANCE_STAFF',
      INSURANCE_COORDINATOR: 'INSURANCE_STAFF',
      ADMIN: 'HOSPITAL_ADMIN',
      HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
      SUPER_ADMIN: 'SUPER_ADMIN',
    };
    const normalizedRole = roleMapping[rawRole] || normalizeRoleCode(rawRole) || 'PATIENT';

    let roleRecord = await this.prisma.role.findUnique({
      where: { code: normalizedRole },
    });
    if (!roleRecord) {
      roleRecord = await this.prisma.role.create({
        data: {
          code: normalizedRole,
          name: normalizedRole.replace(/_/g, ' '),
          description: `Enterprise role for ${normalizedRole}`,
        },
      });
    }

    const organizationRecord = await this.prisma.organization.findFirst();
    if (!organizationRecord) {
      throw new BadRequestException('System organization is not initialized.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const defaultFacility = await this.prisma.facility.findFirst();

    const user = await this.prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        firstName: firstName || 'User',
        lastName: lastName || 'Member',
        phone: effectivePhone,
        status: UserStatus.ACTIVE,
        roleId: roleRecord.id,
        organizationId: organizationRecord.id,
        facilityId: defaultFacility?.id || null,
      },
      include: {
        role: true,
        organization: true,
        facility: true,
      },
    });

    // 6. Generate unique UHID and auto-provision specialized profile
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const uhid = `UHID-${new Date().getFullYear()}-${randomDigits}`;

    if (normalizedRole === 'PATIENT') {
      try {
        await this.prisma.patientProfile.create({
          data: {
            userId: user.id,
            gender: 'OTHER',
            dateOfBirth: new Date('2000-01-01'),
            bloodGroup: 'UNKNOWN',
            phone: user.phone || '+91 9800000000',
            address: `UHID: ${uhid}`,
          },
        });
      } catch (err) {
        console.warn('Notice: PatientProfile provisioning warning:', err);
      }
    } else if (normalizedRole === 'DOCTOR') {
      try {
        const defaultDept =
          (await this.prisma.department.findFirst({ where: { facilityId: user.facilityId || undefined } })) ||
          (await this.prisma.department.findFirst());
        const defaultSpec = await this.prisma.specialty.findFirst();

        if (defaultDept && defaultSpec) {
          await this.prisma.doctorProfile.create({
            data: {
              userId: user.id,
              facilityId: user.facilityId || defaultDept.facilityId,
              departmentId: defaultDept.id,
              specialtyId: defaultSpec.id,
              licenseNumber: `MCI-${Date.now().toString().slice(-6)}`,
              status: 'ACTIVE',
            },
          });
        }
      } catch (err) {
        console.warn('Notice: DoctorProfile provisioning warning:', err);
      }
    }

    const token = this.generateJwtToken(user);
    const userDto: any = this.toUserDto(user);
    userDto.uhid = uhid;

    return {
      accessToken: token,
      user: userDto,
    };
  }

  /**
   * Step 1: Validate registration data and dispatch 6-digit OTP (10 min expiry)
   */
  async registerInitiate(dto: RegisterDto) {
    const firstName = (dto.firstName || (dto.fullName ? dto.fullName.trim().split(' ')[0] : (dto.name ? dto.name.trim().split(' ')[0] : ''))).trim();
    const lastName = (dto.lastName || (dto.fullName ? dto.fullName.trim().split(' ').slice(1).join(' ') : (dto.name ? dto.name.trim().split(' ').slice(1).join(' ') : ''))).trim();

    if (!firstName && !dto.fullName && !dto.name) {
      throw new BadRequestException('First name is required.');
    }

    const cleanEmail = this.otpService.validateEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(dto.password)) {
      throw new BadRequestException('Password requirements not met');
    }
    if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const pendingPayload = {
      ...dto,
      firstName,
      lastName,
      email: cleanEmail,
    };

    return this.otpService.generateAndSendOtp(cleanEmail, 'REGISTRATION', pendingPayload);
  }

  /**
   * Step 2: Verify 6-digit OTP and commit verified account creation
   */
  async verifyRegistrationOtp(body: { email: string; code?: string; otp?: string }): Promise<AuthResponseDto> {
    const cleanEmail = this.otpService.validateEmail(body.email);
    const code = (body.code || (body as any).otp || '').toString().trim();
    if (!code) {
      throw new BadRequestException('Verification code is required.');
    }
    const verification = await this.otpService.verifyOtp(cleanEmail, code, 'REGISTRATION');
    if (!verification.success || !verification.data) {
      throw new BadRequestException('Registration session expired. Please submit registration again.');
    }

    // Now commit to database using the saved validated registration payload
    return this.register(verification.data as RegisterDto);
  }

  /**
   * Resend active OTP respecting rate limit / cooldown
   */
  async resendOtp(body: { email: string; purpose?: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN' }) {
    const purpose = body.purpose || 'REGISTRATION';
    return this.otpService.generateAndSendOtp(body.email, purpose);
  }

  /**
   * Initiate forgot password via 6-digit OTP
   */
  async forgotPasswordOtp(body: { email: string }) {
    const cleanEmail = this.otpService.validateEmail(body.email);
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new BadRequestException('Email not registered');
    }
    return this.otpService.generateAndSendOtp(cleanEmail, 'PASSWORD_RESET', { userId: user.id });
  }

  /**
   * Verify OTP and reset password securely
   */
  async resetPasswordOtp(body: { email: string; code: string; newPassword: string; confirmPassword?: string }) {
    const cleanEmail = this.otpService.validateEmail(body.email);
    if (body.confirmPassword && body.newPassword !== body.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(body.newPassword)) {
      throw new BadRequestException('Password requirements not met');
    }

    await this.otpService.verifyOtp(cleanEmail, body.code, 'PASSWORD_RESET');
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new BadRequestException('Email not registered');
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        role: true,
        organization: true,
        facility: true,
        patientProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email not registered');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account disabled');
    }

    const expiresIn = dto.rememberMe ? '30d' : '24h';
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.code as RoleCode,
        status: user.status as UserStatus,
        organizationId: user.organizationId,
        facilityId: user.facilityId || undefined,
      },
      { expiresIn }
    );

    return {
      accessToken: token,
      user: this.toUserDto(user),
    };
  }

  async getMe(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        organization: true,
        facility: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account not found.');
    }

    return this.toUserDto(user);
  }

  // =========================================================================
  // Forgot & Reset Password Flow
  // =========================================================================

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string; resetToken?: string; resetLink?: string }> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Return success response to prevent email enumeration attacks
      return {
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      };
    }

    // Generate signed reset token with 1-hour expiry
    const resetToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        purpose: 'RESET_PASSWORD',
      },
      { expiresIn: '1h' },
    );

    const resetLink = `/auth/reset-password?token=${resetToken}`;

    return {
      success: true,
      message: 'Password reset link has been generated successfully.',
      resetToken,
      resetLink,
    };
  }

  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string; message?: string }> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.purpose !== 'RESET_PASSWORD') {
        throw new BadRequestException('Invalid reset token purpose.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new BadRequestException('User account is inactive or not found.');
      }

      return {
        valid: true,
        email: user.email,
      };
    } catch (err: any) {
      return {
        valid: false,
        message: err.message || 'Reset token has expired or is invalid.',
      };
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.token);
    } catch (err: any) {
      throw new BadRequestException('Reset token has expired or is invalid. Please request a new link.');
    }

    if (payload.purpose !== 'RESET_PASSWORD') {
      throw new BadRequestException('Invalid reset token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('Account associated with reset token was not found.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new credentials.',
    };
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private generateJwtToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.code as RoleCode,
      status: user.status as UserStatus,
      organizationId: user.organizationId,
      facilityId: user.facilityId || undefined,
    };

    return this.jwtService.sign(payload);
  }

  private toUserDto(user: any): any {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || undefined,
      status: user.status as UserStatus,
      roleId: user.roleId,
      roleCode: user.role?.code,
      organizationId: user.organizationId,
      facilityId: user.facilityId || undefined,
      uhid: user.patientProfile
        ? (user.patientProfile.address?.includes('UHID: ')
            ? user.patientProfile.address.replace('UHID: ', '').trim()
            : `UHID-${new Date(user.createdAt).getFullYear()}-${user.patientProfile.id.slice(0, 8).toUpperCase()}`)
        : undefined,
      role: {
        id: user.role.id,
        name: user.role.name,
        code: user.role.code as RoleCode,
        description: user.role.description || undefined,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        code: user.organization.code,
        type: user.organization.type,
        createdAt: user.organization.createdAt.toISOString(),
        updatedAt: user.organization.updatedAt.toISOString(),
      },
      facility: user.facility
        ? {
            id: user.facility.id,
            organizationId: user.facility.organizationId,
            name: user.facility.name,
            code: user.facility.code,
            address: user.facility.address || undefined,
            city: user.facility.city || undefined,
            state: user.facility.state || undefined,
            postalCode: user.facility.postalCode || undefined,
            phone: user.facility.phone || undefined,
            email: user.facility.email || undefined,
            status: user.facility.status,
            createdAt: user.facility.createdAt.toISOString(),
            updatedAt: user.facility.updatedAt.toISOString(),
          }
        : undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
