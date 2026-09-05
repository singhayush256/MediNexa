import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  RoleCode,
  UserStatus,
  AuthResponseDto,
  UserDto,
  LoginResponseDto,
  TotpSetupResponseDto,
  VerifyTotpDto,
  Admin2faUserDto,
} from '@medinexa/types';
import { isPrivilegedRole, normalizeRoleCode } from '@medinexa/validation';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { OtpService } from './otp.service';
import { TotpService } from './totp.service';
import { TotpCryptoService } from './totp-crypto.service';
import { RegisterVerifyTotpDto, SetupTotpVerifyDto, DisableTotpDto } from './dto/totp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly totpService: TotpService,
    private readonly totpCryptoService: TotpCryptoService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`[REGISTRATION] Direct registration request received for email: ${dto.email}`);

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
      this.logger.warn(`[REGISTRATION] Attempt to register existing email: ${cleanEmail}`);
      throw new ConflictException(`Email address '${cleanEmail}' is already registered. Please sign in instead.`);
    }

    // 3. Password security complexity validation
    if (!dto.password || typeof dto.password !== 'string') {
      throw new BadRequestException('Password is required');
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(dto.password)) {
      throw new BadRequestException(
        'Password requirements not met: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.',
      );
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

    let organizationRecord = await this.prisma.organization.findFirst();
    if (!organizationRecord) {
      organizationRecord = await this.prisma.organization.create({
        data: {
          name: 'MediNexa Healthcare System',
          code: 'MEDINEXA-CORE',
          type: 'HOSPITAL',
          isActive: true,
        },
      });
    }

    // Generate Google Authenticator secret and QR code via speakeasy & qrcode
    const setupResult = await this.totpService.generateSetupCredentials(cleanEmail, 'MediNexa');
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
        totpSecret: setupResult.encryptedSecret,
        twoFactorEnabled: true,
        backupCodes: setupResult.hashedBackupCodes,
        lastVerificationTime: new Date(),
        failedTotpAttempts: 0,
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
        this.logger.warn(`Notice: PatientProfile provisioning warning: ${err}`);
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
        this.logger.warn(`Notice: DoctorProfile provisioning warning: ${err}`);
      }
    }

    const token = this.generateJwtToken(user);
    const userDto: any = this.toUserDto(user);
    userDto.uhid = uhid;

    this.logger.log(`[REGISTRATION] User successfully registered with 2FA enabled: ${cleanEmail} (${normalizedRole})`);

    return {
      accessToken: token,
      user: userDto,
      qrCodeUrl: setupResult.qrCodeUrl,
      qrImage: setupResult.qrCodeUrl,
      otpauthUrl: setupResult.otpauthUrl,
      manualSetupKey: setupResult.manualSetupKey,
      backupCodes: setupResult.plainBackupCodes,
      message: 'Account successfully registered and secured with Google Authenticator!',
    };
  }

  // =========================================================================
  // Google Authenticator (TOTP) 2FA Registration & Login
  // =========================================================================

  /**
   * Step 1 (Registration): Validate account details, generate TOTP secret, QR Code,
   * manual setup key, backup codes, and return signed registration challenge.
   */
  async registerInitiateTotp(dto: RegisterDto): Promise<TotpSetupResponseDto> {
    this.logger.log(`[REGISTRATION 2FA] Initiate TOTP setup requested for email: ${dto.email}`);

    const firstName = (dto.firstName || (dto.fullName ? dto.fullName.trim().split(' ')[0] : (dto.name ? dto.name.trim().split(' ')[0] : ''))).trim();
    const lastName = (dto.lastName || (dto.fullName ? dto.fullName.trim().split(' ').slice(1).join(' ') : (dto.name ? dto.name.trim().split(' ').slice(1).join(' ') : ''))).trim();

    if (!firstName && !dto.fullName && !dto.name) {
      throw new BadRequestException('First name is required.');
    }

    if (!dto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
      throw new BadRequestException('Invalid email format');
    }
    const cleanEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      this.logger.warn(`[REGISTRATION 2FA] Email already exists: ${cleanEmail}`);
      throw new ConflictException(`Email address '${cleanEmail}' is already registered. Please sign in instead.`);
    }

    if (!dto.password || typeof dto.password !== 'string') {
      throw new BadRequestException('Password is required');
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(dto.password)) {
      throw new BadRequestException(
        'Password requirements not met: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.',
      );
    }
    if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const effectivePhone =
      dto.phone ||
      (dto.countryCode && dto.mobileNumber ? `${dto.countryCode} ${dto.mobileNumber}` : dto.mobileNumber) ||
      null;

    const rawRole = (dto.role || dto.roleCode || 'PATIENT').toUpperCase().trim();
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

    // Generate TOTP credentials (secret, QR code, manual setup key, backup codes)
    const setupResult = await this.totpService.generateSetupCredentials(cleanEmail, 'MediNexa');
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create signed temporary registration token containing encrypted secret and registration payload
    const registrationToken = this.jwtService.sign(
      {
        type: 'REGISTRATION_TOTP',
        email: cleanEmail,
        firstName: firstName || 'User',
        lastName: lastName || 'Member',
        phone: effectivePhone,
        passwordHash,
        role: normalizedRole,
        encryptedSecret: setupResult.encryptedSecret,
        hashedBackupCodes: setupResult.hashedBackupCodes,
      },
      { expiresIn: '15m' },
    );

    this.logger.log(`[REGISTRATION 2FA] Generated credentials & QR code successfully for ${cleanEmail} (${normalizedRole})`);

    return {
      registrationToken,
      qrCodeUrl: setupResult.qrCodeUrl,
      qrImage: setupResult.qrCodeUrl,
      otpauthUrl: setupResult.otpauthUrl,
      manualSetupKey: setupResult.manualSetupKey,
      backupCodes: setupResult.plainBackupCodes,
      email: cleanEmail,
    };
  }

  /**
   * Step 3 & 4 (Registration): Verify the user's scanned 6-digit TOTP code and activate the account.
   */
  async registerVerifyTotp(dto: RegisterVerifyTotpDto): Promise<AuthResponseDto> {
    this.logger.log('[REGISTRATION 2FA] Verification requested for new account setup');

    let payload: any;
    try {
      payload = this.jwtService.verify(dto.registrationToken);
    } catch (err: any) {
      this.logger.warn(`[REGISTRATION 2FA] Session token verification failed: ${err.message}`);
      throw new BadRequestException('Registration setup session has expired or is invalid. Please initiate setup again.');
    }

    if (payload.type !== 'REGISTRATION_TOTP' || !payload.encryptedSecret || !payload.email) {
      throw new BadRequestException('Invalid registration session token.');
    }

    // Verify 6-digit TOTP code
    const isCodeValid = this.totpService.verifyCodeAgainstEncryptedSecret(
      payload.encryptedSecret,
      dto.code,
    );

    if (!isCodeValid) {
      this.logger.warn(`[REGISTRATION 2FA] Invalid TOTP code verification attempted for: ${payload.email}`);
      throw new BadRequestException('Invalid 6-digit authenticator code. Please ensure your authenticator app time is synchronized and try again.');
    }

    // Double check email uniqueness before final commit
    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      this.logger.warn(`[REGISTRATION 2FA] Account already completed for email: ${payload.email}`);
      throw new ConflictException(`An account with email '${payload.email}' has already been completed.`);
    }

    // Resolve Role & Organization
    let roleRecord = await this.prisma.role.findUnique({
      where: { code: payload.role },
    });
    if (!roleRecord) {
      roleRecord = await this.prisma.role.create({
        data: {
          code: payload.role,
          name: payload.role.replace(/_/g, ' '),
          description: `Enterprise role for ${payload.role}`,
        },
      });
    }

    let organizationRecord = await this.prisma.organization.findFirst();
    if (!organizationRecord) {
      organizationRecord = await this.prisma.organization.create({
        data: {
          name: 'MediNexa Healthcare System',
          code: 'MEDINEXA-CORE',
          type: 'HOSPITAL',
          isActive: true,
        },
      });
    }
    const defaultFacility = await this.prisma.facility.findFirst();

    // Commit User with 2FA activated
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        passwordHash: payload.passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        status: UserStatus.ACTIVE,
        roleId: roleRecord.id,
        organizationId: organizationRecord.id,
        facilityId: defaultFacility?.id || null,
        totpSecret: payload.encryptedSecret,
        twoFactorEnabled: true,
        backupCodes: payload.hashedBackupCodes,
        lastVerificationTime: new Date(),
        failedTotpAttempts: 0,
      },
      include: {
        role: true,
        organization: true,
        facility: true,
      },
    });

    this.logger.log(`[REGISTRATION 2FA] Account activated successfully with 2FA for: ${user.email} (ID: ${user.id})`);

    // Auto-provision profile
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const uhid = `UHID-${new Date().getFullYear()}-${randomDigits}`;

    if (payload.role === 'PATIENT') {
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
        console.warn('PatientProfile provisioning notice:', err);
      }
    } else if (payload.role === 'DOCTOR') {
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
        console.warn('DoctorProfile provisioning notice:', err);
      }
    }

    const token = this.generateJwtToken(user);
    const userDto: any = this.toUserDto(user);
    userDto.uhid = uhid;

    return {
      accessToken: token,
      user: userDto,
      message: 'Account successfully registered and secured with Google Authenticator!',
    };
  }

  /**
   * Login: Verifies email & password. If 2FA is active, returns a 2FA challenge.
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const startTime = Date.now();
    const cleanEmail = dto.email.toLowerCase().trim();

    let user: any = null;

    try {
      user = await this.prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          role: true,
          organization: true,
          facility: true,
          patientProfile: true,
        },
      });
    } catch (err: any) {
      // Catch schema drift (e.g. missing column like totp_secret if a migration is still applying)
      if (err?.code === 'P2022' || err?.code === 'P2021') {
        this.logger.warn(`[AUTH LOGIN] Database column/schema drift detected (${err.code}). Executing resilient fallback query: ${err.message}`);
        try {
          const rawUsers: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT u.id, u.email, u.password_hash as "passwordHash", u.first_name as "firstName", u.last_name as "lastName", u.phone, u.status, u.role_id as "roleId", u.organization_id as "organizationId", u.facility_id as "facilityId" FROM users u WHERE lower(u.email) = $1 LIMIT 1`,
            cleanEmail,
          );
          if (rawUsers && rawUsers.length > 0) {
            const rawUser = rawUsers[0];
            const role = rawUser.roleId ? await this.prisma.role.findUnique({ where: { id: rawUser.roleId } }) : null;
            const organization = rawUser.organizationId ? await this.prisma.organization.findUnique({ where: { id: rawUser.organizationId } }) : null;
            user = {
              ...rawUser,
              twoFactorEnabled: false,
              totpSecret: null,
              failedTotpAttempts: 0,
              totpLockedUntil: null,
              role: role || { code: 'PATIENT', name: 'Patient' },
              organization: organization || { name: 'MediNexa Healthcare System' },
              facility: null,
              patientProfile: null,
            };
          }
        } catch (rawErr: any) {
          this.logger.error(`[AUTH LOGIN] Fallback query failed: ${rawErr.message}`);
          throw err;
        }
      } else {
        throw err;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Email not registered');
    }

    // Check account lockout
    this.totpService.checkUserLockout(user);

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account disabled');
    }

    const elapsedMs = Date.now() - startTime;
    this.logger.log(`[AUTH LOGIN] Successfully authenticated ${cleanEmail} in ${elapsedMs}ms`);

    // If 2FA is enabled for this user, issue a 2FA challenge (NO password or email/SMS OTP sent)
    if (user.twoFactorEnabled && user.totpSecret) {
      const challengeToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          type: '2FA_CHALLENGE',
          rememberMe: !!dto.rememberMe,
        },
        { expiresIn: '5m' },
      );

      return {
        requires2fa: true,
        challengeToken,
        email: user.email,
        message: 'Two-Factor Authentication required. Please enter code from your authenticator app.',
      };
    }

    // If user has not enabled 2FA yet, issue direct JWT access token
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
      { expiresIn },
    );

    return {
      requires2fa: false,
      accessToken: token,
      user: this.toUserDto(user),
    };
  }

  /**
   * Complete Login 2FA challenge using 6-digit TOTP code or 8-character backup recovery code
   */
  async verifyLoginTotp(dto: VerifyTotpDto): Promise<AuthResponseDto> {
    if (!dto.challengeToken) {
      throw new BadRequestException('Challenge token is required.');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(dto.challengeToken);
    } catch {
      throw new UnauthorizedException('2FA verification session expired. Please sign in again.');
    }

    if (payload.type !== '2FA_CHALLENGE' || !payload.sub) {
      throw new UnauthorizedException('Invalid 2FA challenge token.');
    }

    const userId = payload.sub;
    const verificationResult = await this.totpService.verifyUserLoginTotp(userId, dto.code);

    if (!verificationResult.success) {
      throw new UnauthorizedException('Verification failed.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        organization: true,
        facility: true,
        patientProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const rememberMe = dto.rememberMe !== undefined ? dto.rememberMe : payload.rememberMe;
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.code as RoleCode,
        status: user.status as UserStatus,
        organizationId: user.organizationId,
        facilityId: user.facilityId || undefined,
      },
      { expiresIn },
    );

    return {
      accessToken: token,
      user: this.toUserDto(user),
      message: verificationResult.usedBackupCode
        ? 'Signed in using backup recovery code. Please note that this code has been consumed.'
        : 'Two-factor authentication successful.',
    };
  }

  /**
   * User 2FA: Initiate authenticator setup for an already logged-in user
   */
  async setupUserTotp(userId: string): Promise<TotpSetupResponseDto & { setupToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const setupResult = await this.totpService.generateSetupCredentials(user.email, 'MediNexa');
    const setupToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'USER_2FA_SETUP',
        encryptedSecret: setupResult.encryptedSecret,
        hashedBackupCodes: setupResult.hashedBackupCodes,
      },
      { expiresIn: '15m' },
    );

    return {
      setupToken,
      qrCodeUrl: setupResult.qrCodeUrl,
      manualSetupKey: setupResult.manualSetupKey,
      backupCodes: setupResult.plainBackupCodes,
      email: user.email,
    };
  }

  /**
   * User 2FA: Verify 6-digit code and activate 2FA for logged-in user
   */
  async verifyAndEnableUserTotp(userId: string, dto: SetupTotpVerifyDto): Promise<{ message: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.setupToken);
    } catch {
      throw new BadRequestException('Setup session expired. Please start authenticator setup again.');
    }

    if (payload.type !== 'USER_2FA_SETUP' || payload.sub !== userId) {
      throw new UnauthorizedException('Invalid setup token.');
    }

    const isCodeValid = this.totpService.verifyCodeAgainstEncryptedSecret(
      payload.encryptedSecret,
      dto.code,
    );

    if (!isCodeValid) {
      throw new BadRequestException('Invalid 6-digit code from authenticator app.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: payload.encryptedSecret,
        twoFactorEnabled: true,
        backupCodes: payload.hashedBackupCodes,
        lastVerificationTime: new Date(),
        failedTotpAttempts: 0,
        totpLockedUntil: null,
      },
    });

    return { message: 'Google Authenticator Two-Factor Authentication is now enabled!' };
  }

  /**
   * User 2FA: Disable 2FA for logged-in user with password confirmation or TOTP code
   */
  async disableUserTotp(userId: string, dto: DisableTotpDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isMatch) throw new UnauthorizedException('Incorrect password');
    } else if (dto.code && user.totpSecret) {
      const isCodeValid = this.totpService.verifyCodeAgainstEncryptedSecret(user.totpSecret, dto.code);
      if (!isCodeValid) throw new UnauthorizedException('Invalid verification code');
    } else {
      throw new BadRequestException('Password or verification code is required to disable 2FA');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: null,
        twoFactorEnabled: false,
        backupCodes: [],
        failedTotpAttempts: 0,
        totpLockedUntil: null,
      },
    });

    return { message: 'Two-factor authentication has been disabled.' };
  }

  /**
   * User 2FA: Check status for logged-in user
   */
  async getUser2faStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        lastVerificationTime: true,
        failedTotpAttempts: true,
        totpLockedUntil: true,
        backupCodes: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      twoFactorEnabled: !!user.twoFactorEnabled,
      lastVerificationTime: user.lastVerificationTime,
      remainingBackupCodes: user.backupCodes.length,
      isLocked: !!(user.totpLockedUntil && user.totpLockedUntil > new Date()),
    };
  }

  // =========================================================================
  // Admin 2FA Governance Methods
  // =========================================================================

  /**
   * Admin: List users with 2FA status, last verified timestamp, and lock status
   */
  async adminGetUsers2fa(search?: string, roleFilter?: string): Promise<Admin2faUserDto[]> {
    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (roleFilter && roleFilter !== 'ALL') {
      where.role = { code: roleFilter };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roleCode: u.role.code,
      roleName: u.role.name,
      twoFactorEnabled: !!u.twoFactorEnabled,
      lastVerificationTime: u.lastVerificationTime ? u.lastVerificationTime.toISOString() : undefined,
      failedTotpAttempts: u.failedTotpAttempts || 0,
      isLocked: !!(u.totpLockedUntil && u.totpLockedUntil > new Date()),
      totpLockedUntil: u.totpLockedUntil ? u.totpLockedUntil.toISOString() : undefined,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  /**
   * Admin: Reset a user's authenticator (clears secret, backup codes, lock state)
   */
  async adminResetUserTotp(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: null,
        twoFactorEnabled: false,
        backupCodes: [],
        failedTotpAttempts: 0,
        totpLockedUntil: null,
      },
    });

    return { message: `2FA Authenticator reset for user ${user.email}. User can re-enroll at next login.` };
  }

  /**
   * Admin: Enable or disable 2FA for a user
   */
  async adminToggleUser2fa(userId: string, enabled: boolean): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (enabled && !user.totpSecret) {
      throw new BadRequestException('User has not yet enrolled an authenticator. Please have user complete 2FA setup.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: enabled,
        failedTotpAttempts: 0,
        totpLockedUntil: null,
      },
    });

    return { message: `2FA ${enabled ? 'enabled' : 'disabled'} for user ${user.email}.` };
  }

  /**
   * Admin: Unlock a locked user account
   */
  async adminUnlockUser(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedTotpAttempts: 0,
        totpLockedUntil: null,
      },
    });

    return { message: 'User account unlocked successfully.' };
  }

  // =========================================================================
  // Legacy / Fallback OTP Wrappers
  // =========================================================================

  /**
   * Step 1: Validate registration data and dispatch 6-digit OTP (10 min expiry)
   */
  async registerInitiate(dto: RegisterDto) {
    return this.registerInitiateTotp(dto);
  }

  /**
   * Step 2: Verify 6-digit OTP and commit verified account creation
   */
  async verifyRegistrationOtp(body: { email?: string; code?: string; otp?: string; registrationToken?: string }): Promise<AuthResponseDto> {
    if (body.registrationToken && body.code) {
      return this.registerVerifyTotp({ registrationToken: body.registrationToken, code: body.code });
    }
    const cleanEmail = this.otpService.validateEmail(body.email || '');
    const code = (body.code || (body as any).otp || '').toString().trim();
    if (!code) {
      throw new BadRequestException('Verification code is required.');
    }
    const verification = await this.otpService.verifyOtp(cleanEmail, code, 'REGISTRATION');
    if (!verification.success || !verification.data) {
      throw new BadRequestException('Registration session expired. Please submit registration again.');
    }
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
   * Initiate forgot password verification via Google Authenticator (TOTP)
   */
  async forgotPasswordOtp(body: { email: string }) {
    const cleanEmail = this.otpService.validateEmail(body.email);
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new BadRequestException('Email not registered');
    }

    // Check account lockout
    this.totpService.checkUserLockout(user);

    const hasTotp = Boolean(user.totpSecret);
    let previewOtp: string | undefined = undefined;
    // Fallback email OTP only if user does not have Google Authenticator enabled
    if (!hasTotp) {
      const otpRes = await this.otpService.generateAndSendOtp(cleanEmail, 'PASSWORD_RESET', { userId: user.id });
      previewOtp = otpRes.previewOtp;
    }

    return {
      success: true,
      email: cleanEmail,
      hasTotp,
      previewOtp,
      message: 'Please enter the 6-digit verification code from your Google Authenticator app.',
    };
  }

  /**
   * Verify Google Authenticator (TOTP) code and reset password securely
   */
  async resetPasswordOtp(body: { email: string; code: string; newPassword: string; confirmPassword?: string }) {
    const cleanEmail = this.otpService.validateEmail(body.email);
    if (body.confirmPassword && body.newPassword !== body.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(body.newPassword)) {
      throw new BadRequestException('Password requirements not met: minimum 8 characters, one uppercase, one lowercase, one number, and one special character.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new BadRequestException('Email not registered');
    }

    // Check lockout
    this.totpService.checkUserLockout(user);

    const inputCode = (body.code || '').trim();
    let codeValid = false;
    let usedBackupIndex = -1;

    // 1. Verify via Google Authenticator TOTP if secret exists
    if (user.totpSecret) {
      codeValid = this.totpService.verifyCode(user.totpSecret, inputCode);

      // 2. Or verify as backup code
      if (!codeValid && user.backupCodes && user.backupCodes.length > 0) {
        usedBackupIndex = this.totpCryptoService.verifyBackupCode(inputCode, user.backupCodes);
        if (usedBackupIndex >= 0) {
          codeValid = true;
        }
      }
    }

    // 3. Fallback: verify via email OTP if active
    if (!codeValid) {
      try {
        const otpCheck = await this.otpService.verifyOtp(cleanEmail, inputCode, 'PASSWORD_RESET');
        if (otpCheck && otpCheck.success) {
          codeValid = true;
        }
      } catch {
        // Fall through to throw below
      }
    }

    if (!codeValid) {
      await this.totpService.handleFailedAttempt(user.id, user.failedTotpAttempts || 0);
      throw new BadRequestException('Invalid 6-digit Google Authenticator code. Please check your authenticator app or backup codes.');
    }

    const updatedBackupCodes = usedBackupIndex >= 0 && user.backupCodes
      ? user.backupCodes.filter((_, idx) => idx !== usedBackupIndex)
      : undefined;

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedTotpAttempts: 0,
        totpLockedUntil: null,
        ...(updatedBackupCodes !== undefined ? { backupCodes: updatedBackupCodes } : {}),
      },
    });

    this.logger.log(`[PASSWORD RESET] Successfully reset password via Authenticator for ${cleanEmail}`);
    return { success: true, message: 'Password reset successfully. You can now log in with your new password.' };
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
      twoFactorEnabled: !!user.twoFactorEnabled,
      lastVerificationTime: user.lastVerificationTime ? user.lastVerificationTime.toISOString() : undefined,
      failedTotpAttempts: user.failedTotpAttempts || 0,
      totpLockedUntil: user.totpLockedUntil ? user.totpLockedUntil.toISOString() : undefined,
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
