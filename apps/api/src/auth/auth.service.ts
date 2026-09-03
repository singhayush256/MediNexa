import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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
      throw new BadRequestException('Name is required');
    }

    // 2. Resolve effective role code with normalization
    let roleStr = (dto.role || dto.roleCode || '').toUpperCase().trim();
    if (!roleStr) {
      throw new BadRequestException('Role is required');
    }
    const normalizedRole = normalizeRoleCode(roleStr);

    if (process.env.NODE_ENV === 'production' && isPrivilegedRole(normalizedRole)) {
      throw new BadRequestException(`Public self-registration for privileged role '${normalizedRole}' is prohibited.`);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
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
        email: dto.email.toLowerCase(),
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

    const token = this.generateJwtToken(user);
    return {
      accessToken: token,
      user: this.toUserDto(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
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
