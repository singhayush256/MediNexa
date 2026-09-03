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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Resolve effective name
    const effectiveName = (
      dto.name ||
      [dto.firstName, dto.lastName].filter(Boolean).join(' ')
    ).trim();

    if (!effectiveName) {
      throw new BadRequestException('Name is required.');
    }

    // 2. Resolve effective role code with normalization
    let roleStr = (dto.role || dto.roleCode || '').toUpperCase().trim();
    if (!roleStr) {
      throw new BadRequestException('Role is required.');
    }
    const normalizedRole = normalizeRoleCode(roleStr);

    if (process.env.NODE_ENV === 'production' && isPrivilegedRole(normalizedRole)) {
      throw new BadRequestException(`Public self-registration for privileged role '${normalizedRole}' is prohibited.`);
    }

    const cleanEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists.');
    }

    let roleRecord = await this.prisma.role.findUnique({
      where: { code: normalizedRole },
    });
    if (!roleRecord) {
      roleRecord = await this.prisma.role.create({
        data: {
          code: normalizedRole,
          name: normalizedRole.replace(/_/g, ' '),
          description: `Role for ${normalizedRole}`,
        },
      });
    }

    const organizationRecord = await this.prisma.organization.findFirst();
    if (!organizationRecord) {
      throw new BadRequestException('System organization is not initialized.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const nameParts = effectiveName.split(' ');
    const firstName = dto.firstName || nameParts[0] || 'User';
    const lastName = dto.lastName || nameParts.slice(1).join(' ') || 'Member';

    const defaultFacility = await this.prisma.facility.findFirst();

    const user = await this.prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        firstName,
        lastName,
        phone: dto.phone || null,
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

    // Automatically provision specialized profile based on role
    if (normalizedRole === 'PATIENT') {
      try {
        await this.prisma.patientProfile.create({
          data: {
            userId: user.id,
            gender: 'OTHER',
            dateOfBirth: new Date('2000-01-01'),
            bloodGroup: 'UNKNOWN',
            phone: user.phone || '+91 9800000000',
            address: 'India',
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
    return {
      accessToken: token,
      user: this.toUserDto(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        role: true,
        organization: true,
        facility: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}. Authentication rejected.`);
    }

    const token = this.generateJwtToken(user);
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

  private toUserDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || undefined,
      status: user.status as UserStatus,
      roleId: user.roleId,
      organizationId: user.organizationId,
      facilityId: user.facilityId || undefined,
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
