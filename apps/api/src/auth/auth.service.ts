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
import * as crypto from 'crypto';
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
import { isPrivilegedRole, normalizeRoleCode, generateStaffLoginId, generatePersonId } from '@medinexa/validation';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { OtpService } from './otp.service';
import { EmployeeStatus } from '@prisma/client';
import { TotpService } from './totp.service';
import { TotpCryptoService } from './totp-crypto.service';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterVerifyTotpDto, SetupTotpVerifyDto, DisableTotpDto } from './dto/totp.dto';

export function generateSecurePatientId(): string {
  const patientRandomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  const patientTimePart = Date.now().toString(36).slice(-4).toUpperCase();
  return `MNX-P-${patientTimePart}${patientRandomHex}`;
}

export function generateSecureUhid(): string {
  const year = new Date().getFullYear();
  const randomDigits = crypto.randomInt(10000000, 99999999);
  return `UHID-${year}-${randomDigits}`;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly totpService: TotpService,
    private readonly totpCryptoService: TotpCryptoService,
    private readonly refreshTokenService: RefreshTokenService,
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
    let existingUser: { id: string; email: string } | null = null;
    try {
      existingUser = await this.prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true, email: true },
      });
    } catch (err: any) {
      this.logger.error(
        `[MediNexa DB] User lookup failed (${err?.code || 'UNKNOWN'}): ${err?.message}`,
        err?.stack,
      );
      throw err;
    }
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

    // 5. Strict RBAC: Prevent privilege escalation via public self-registration.
    // Privileged and operational staff roles must only be created by authenticated administrators.
    const PUBLIC_REGISTRATION_ROLES = ['PATIENT', 'GUARDIAN'];
    const requestedRole = (dto.role || dto.roleCode || '').toUpperCase().trim();
    if (requestedRole) {
      const normalizedRequested = normalizeRoleCode(requestedRole);
      if (normalizedRequested && !PUBLIC_REGISTRATION_ROLES.includes(normalizedRequested)) {
        this.logger.warn(
          `[PRIVILEGE ESCALATION ATTEMPT] Public registration rejected for requested role '${requestedRole}' from email: ${cleanEmail}`,
        );
        throw new ForbiddenException(
          `Privilege escalation detected: Public self-registration is strictly restricted to Patients and Guardians. Administrative and hospital staff accounts must be provisioned by an authorized hospital administrator.`,
        );
      }
    }
    const normalizedRole = 'PATIENT';

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

    // Collision-resistant cryptographic patient identifier and UHID
    const patientId = generateSecurePatientId();
    const uhid = generateSecureUhid();

    // Atomic multi-table user creation and patient profile provisioning
    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
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
          patientId,
          medinexaPersonId: generatePersonId(firstName || 'User'),
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

      await tx.patientProfile.create({
        data: {
          userId: createdUser.id,
          gender: 'OTHER',
          dateOfBirth: new Date('2000-01-01'),
          bloodGroup: 'UNKNOWN',
          phone: createdUser.phone || '+91 9800000000',
          address: `UHID: ${uhid}`,
        },
      });

      return createdUser;
    });

    const token = this.generateJwtToken(user);
    const { refreshToken } = await this.refreshTokenService.createRefreshToken(user.id);
    const userDto: any = this.toUserDto(user);
    userDto.uhid = uhid;

    this.logger.log(`[REGISTRATION] User successfully registered with 2FA enabled: ${cleanEmail} (${normalizedRole})`);

    return {
      accessToken: token,
      refreshToken,
      token,
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
    let existingUser: { id: string; email: string } | null = null;
    try {
      existingUser = await this.prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true, email: true },
      });
    } catch (err: any) {
      this.logger.error(
        `[MediNexa DB] Registration 2FA user lookup failed (${err?.code || 'UNKNOWN'}): ${err?.message}`,
        err?.stack,
      );
      throw err;
    }
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

    // Strict RBAC: Prevent privilege escalation via public self-registration
    const PUBLIC_REGISTRATION_ROLES = ['PATIENT', 'GUARDIAN'];
    const requestedRole = (dto.role || dto.roleCode || '').toUpperCase().trim();
    if (requestedRole) {
      const normalizedRequested = normalizeRoleCode(requestedRole);
      if (normalizedRequested && !PUBLIC_REGISTRATION_ROLES.includes(normalizedRequested)) {
        this.logger.warn(
          `[PRIVILEGE ESCALATION ATTEMPT] Public registration rejected for requested role '${requestedRole}' from email: ${cleanEmail}`,
        );
        throw new ForbiddenException(
          `Privilege escalation detected: Public self-registration is strictly restricted to Patients and Guardians. Administrative and hospital staff accounts must be provisioned by an authorized hospital administrator.`,
        );
      }
    }
    const normalizedRole = 'PATIENT';

    // Verify required role schema and record in database
    try {
      const roleRecord = await this.prisma.role.findUnique({
        where: { code: normalizedRole },
        select: { id: true, code: true },
      });
      if (!roleRecord) {
        await this.prisma.role.create({
          data: {
            code: normalizedRole,
            name: normalizedRole.replace(/_/g, ' '),
            description: `Enterprise role for ${normalizedRole}`,
          },
        });
      }
    } catch (err: any) {
      this.logger.error(
        `[MediNexa DB] Registration 2FA role verification failed (${err?.code || 'UNKNOWN'}) for role '${normalizedRole}': ${err?.message}`,
        err?.stack,
      );
      throw err;
    }

    // Verify required organization schema and record in database
    try {
      const organizationRecord = await this.prisma.organization.findFirst({
        select: { id: true },
      });
      if (!organizationRecord) {
        await this.prisma.organization.create({
          data: {
            name: 'MediNexa Healthcare System',
            code: 'MEDINEXA-CORE',
            type: 'HOSPITAL',
            isActive: true,
          },
        });
      }
    } catch (err: any) {
      this.logger.error(
        `[MediNexa DB] Registration 2FA organization verification failed (${err?.code || 'UNKNOWN'}): ${err?.message}`,
        err?.stack,
      );
      throw err;
    }

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
    let existing: { id: string; email: string } | null = null;
    try {
      existing = await this.prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true, email: true },
      });
    } catch (err: any) {
      this.logger.error(
        `[MediNexa DB] Registration 2FA pre-commit user check failed (${err?.code || 'UNKNOWN'}): ${err?.message}`,
        err?.stack,
      );
      throw err;
    }
    if (existing) {
      this.logger.warn(`[REGISTRATION 2FA] Account already completed for email: ${payload.email}`);
      throw new ConflictException(`An account with email '${payload.email}' has already been completed.`);
    }

    // Resolve Role & Organization
    let roleRecord: any;
    try {
      roleRecord = await this.prisma.role.findUnique({
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
    } catch (err: any) {
      this.logger.error(
        `[MediNexa DB] Registration 2FA role resolution failed (${err?.code || 'UNKNOWN'}) for role '${payload.role}': ${err?.message}`,
        err?.stack,
      );
      throw err;
    }

    let organizationRecord: any;
    try {
      organizationRecord = await this.prisma.organization.findFirst();
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
    } catch (err: any) {
      this.logger.error(
        `[MediNexa DB] Registration 2FA organization resolution failed (${err?.code || 'UNKNOWN'}): ${err?.message}`,
        err?.stack,
      );
      throw err;
    }
    const defaultFacility = await this.prisma.facility.findFirst();
    const patientRandom = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const patientId = payload.role === 'PATIENT' ? `MNX-P-${patientRandom}` : undefined;

    let staffId: string | undefined = undefined;
    if (payload.role !== 'PATIENT') {
      const fullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Staff';
      const baseStaffId = generateStaffLoginId(payload.role, fullName, payload.phone);
      const existing = await this.prisma.user.findFirst({
        where: { staffId: { equals: baseStaffId, mode: 'insensitive' } },
      });
      staffId = existing ? `${baseStaffId}-${Math.floor(10 + Math.random() * 90)}` : baseStaffId;
    }

    // Commit User with 2FA activated
    let user: any;
    try {
      user = await this.prisma.user.create({
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
          patientId,
          staffId,
          medinexaPersonId: generatePersonId(payload.firstName || 'User'),
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
    } catch (createErr: any) {
      this.logger.error(
        `[MediNexa DB] User creation failed in database (${createErr?.code || 'UNKNOWN'}): ${createErr?.message}`,
        createErr?.stack,
      );
      if (createErr?.code === 'P2022' || createErr?.code === 'P2021') {
        this.logger.warn(`[REGISTRATION 2FA] Schema drift during user creation (${createErr.code}). Running self-heal...`);
        await this.prisma.ensureDatabaseSchema().catch(() => {});
        user = await this.prisma.user.create({
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
            patientId,
            staffId,
            medinexaPersonId: generatePersonId(payload.firstName || 'User'),
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
      } else {
        throw createErr;
      }
    }

    this.logger.log(`[REGISTRATION 2FA] Account activated successfully with 2FA for: ${user.email} (ID: ${user.id})`);

    // Auto-provision profile with collision-resistant UHID
    const uhid = generateSecureUhid();

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
        this.logger.warn(`Notice: PatientProfile provisioning warning: ${err}`);
      }
    }

    const token = this.generateJwtToken(user);
    const { refreshToken } = await this.refreshTokenService.createRefreshToken(user.id);
    const userDto: any = this.toUserDto(user);
    userDto.uhid = uhid;

    return {
      accessToken: token,
      refreshToken,
      token,
      user: userDto,
      message: 'Account successfully registered and secured with Google Authenticator!',
    };
  }

  /**
   * Login: Verifies email & password. If 2FA is active, returns a 2FA challenge.
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const startTime = Date.now();
    const rawIdentifier = (dto.email || '').trim();
    const isEmail = rawIdentifier.includes('@');
    const cleanEmail = rawIdentifier.toLowerCase();

    let user: any = null;

    try {
      if (isEmail) {
        user = await this.prisma.user.findUnique({
          where: { email: cleanEmail },
          include: {
            role: true,
            organization: true,
            facility: true,
            patientProfile: true,
            staffProfile: true,
          },
        });
      } else {
        // Staff ID or Patient ID lookup
        user = await this.prisma.user.findFirst({
          where: {
            OR: [
              { staffId: { equals: rawIdentifier, mode: 'insensitive' } },
              { patientId: { equals: rawIdentifier, mode: 'insensitive' } },
            ],
          },
          include: {
            role: true,
            organization: true,
            facility: true,
            patientProfile: true,
            staffProfile: true,
          },
        });

        // Fallback: check EmployeeProfile.employeeCode
        if (!user) {
          const emp = await this.prisma.employeeProfile.findFirst({
            where: { employeeCode: { equals: rawIdentifier, mode: 'insensitive' } },
            include: {
              user: {
                include: {
                  role: true,
                  organization: true,
                  facility: true,
                  patientProfile: true,
                  staffProfile: true,
                },
              },
            },
          });
          if (emp?.user) {
            user = emp.user;
          }
        }

        // Fallback: check known demo Staff IDs / UHIDs (Non-production development or explicit DEMO_MODE only)
        const isDemoAllowed = process.env.DEMO_MODE === 'true' || (process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE !== 'false');
        if (!user && isDemoAllowed) {
          const DEMO_STAFF_MAP: Record<string, string> = {
            'DR.RAJESH-0263': 'dr.rajesh.singh@medinexa.com',
            'DR.ANANYA-0264': 'dr.ananya.b@medinexa.com',
            'ADM.SUNITA-0101': 'admin.hospitalA@medinexa.com',
            'ADM.VIKRAM-0102': 'admin.hospitalB@medinexa.com',
            'NUR.PRIYA-0301': 'nurse.priya@medinexa.com',
            'NUR.KAVITA-0302': 'nurse.kavita.b@medinexa.com',
            'REC.POOJA-0401': 'reception@medinexa.com',
            'REC.RAHUL-0402': 'reception.b@medinexa.com',
            'LAB.ANIL-0501': 'lab.anil@medinexa.com',
            'LAB.RAMESH-0502': 'lab.ramesh.b@medinexa.com',
            'PHAR.RAHUL-0601': 'pharmacist.rahul@medinexa.com',
            'PHAR.NEHA-0602': 'pharmacy.b@medinexa.com',
            'BIL.KAVITA-0701': 'billing.kavita@medinexa.com',
            'BIL.GAURAV-0702': 'billing.gaurav.b@medinexa.com',
            'ADM.AYUSH-0001': 'admin@medinexa.com',
            'ADM.DEV-0002': 'director@medinexa.com',
            'AYU-4826-KM': 'ayush.singh@patient.medinexa.health',
            'PRI-2841-XD': 'priya.sharma@patient.medinexa.health',
            'UHID-2026-104921': 'ayush.singh@patient.medinexa.health',
            'UHID-2026-209418': 'priya.sharma@patient.medinexa.health',
          };
          const mappedEmail = DEMO_STAFF_MAP[rawIdentifier.toUpperCase()];
          if (mappedEmail) {
            user = await this.prisma.user.findFirst({
              where: { email: { equals: mappedEmail, mode: 'insensitive' } },
              include: {
                role: true,
                organization: true,
                facility: true,
                patientProfile: true,
                staffProfile: true,
              },
            });
          }
        }
      }
    } catch (err: any) {
      // Catch schema drift (e.g. missing column like totp_secret if a migration is still applying)
      if (err?.code === 'P2022' || err?.code === 'P2021') {
        this.logger.warn(`[AUTH LOGIN] Database column/schema drift detected (${err.code}). Executing resilient fallback query: ${err.message}`);
        try {
          let rawUsers: any[] = [];
          try {
            rawUsers = await this.prisma.$queryRawUnsafe(
              `SELECT u.id, u.email, u.staff_id as "staffId", u.password_hash as "passwordHash", u.first_name as "firstName", u.last_name as "lastName", u.phone, u.status, u.role_id as "roleId", u.organization_id as "organizationId", u.facility_id as "facilityId" FROM users u WHERE lower(u.email) = $1 OR lower(COALESCE(u.staff_id, '')) = $1 LIMIT 1`,
              cleanEmail,
            );
          } catch {
            rawUsers = await this.prisma.$queryRawUnsafe(
              `SELECT u.id, u.email, u.password_hash as "passwordHash", u.first_name as "firstName", u.last_name as "lastName", u.phone, u.status, u.role_id as "roleId", u.organization_id as "organizationId", u.facility_id as "facilityId" FROM users u WHERE lower(u.email) = $1 LIMIT 1`,
              cleanEmail,
            );
          }
          if (rawUsers && rawUsers.length > 0) {
            const rawUser = rawUsers[0];
            const role = rawUser.roleId ? await this.prisma.role.findUnique({ where: { id: rawUser.roleId } }).catch(() => null) : null;
            const organization = rawUser.organizationId ? await this.prisma.organization.findUnique({ where: { id: rawUser.organizationId } }).catch(() => null) : null;
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
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account status and lifecycle
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended. Please contact your hospital administrator.');
    }
    if (user.status !== UserStatus.ACTIVE || !user.isActive) {
      throw new UnauthorizedException('Your hospital account is inactive. Please contact your hospital administrator.');
    }
    if (user.staffProfile && (user.staffProfile.employeeStatus === 'SUSPENDED' || user.staffProfile.employeeStatus === 'INACTIVE' || user.staffProfile.employeeStatus === 'TERMINATED')) {
      if (user.staffProfile.employeeStatus === 'SUSPENDED') {
        throw new UnauthorizedException('Your account has been suspended. Please contact your hospital administrator.');
      }
      throw new UnauthorizedException('Your hospital account is inactive. Please contact your hospital administrator.');
    }

    // Check account lockout
    this.totpService.checkUserLockout(user);

    // Secure authentication: strictly verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      try {
        await this.prisma.auditEvent.create({
          data: {
            userId: user.id,
            role: user.role?.code || 'PATIENT',
            facilityId: user.facilityId || null,
            action: 'LOGIN_FAILED',
            resource: 'AUTH',
            details: `Failed password authentication attempt for ${rawIdentifier}`,
          },
        });
      } catch (auditErr) {
        this.logger.warn(`Failed to persist LOGIN_FAILED audit event: ${auditErr}`);
      }

      await this.totpService.handleFailedAttempt(user.id, user.failedTotpAttempts || 0, 'password');
      throw new UnauthorizedException('Invalid credentials');
    }

    // On valid password, reset failed attempts counter if previously incremented
    if (user.failedTotpAttempts && user.failedTotpAttempts > 0) {
      await this.totpService.handleSuccessfulVerification(user.id);
    }

    try {
      await this.prisma.auditEvent.create({
        data: {
          userId: user.id,
          role: user.role?.code || 'PATIENT',
          facilityId: user.facilityId || null,
          action: 'LOGIN_SUCCESS',
          resource: 'AUTH',
          details: `User ${rawIdentifier} authenticated successfully via password credentials`,
        },
      });
    } catch (auditErr) {
      this.logger.warn(`Failed to persist LOGIN_SUCCESS audit event: ${auditErr}`);
    }

    const elapsedMs = Date.now() - startTime;
    this.logger.log(`[AUTH LOGIN] Successfully authenticated ${cleanEmail} in ${elapsedMs}ms`);

    // If 2FA is enabled for this user, issue a 2FA challenge
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

    // If user has not enabled 2FA yet, issue direct JWT access token and rotated refresh token
    const token = this.generateJwtToken(user);
    const { refreshToken } = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      requires2fa: false,
      accessToken: token,
      refreshToken,
      token,
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
    const token = this.generateJwtToken(user);
    const { refreshToken } = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      accessToken: token,
      refreshToken,
      token,
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
   * Generates a Google Authenticator QR Code so the user can scan it and reset password securely without email OTP
   */
  async forgotPasswordOtp(body: { email: string }) {
    const cleanEmail = this.otpService.validateEmail(body.email);
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new BadRequestException('Email address is not registered.');
    }

    // Check account lockout
    this.totpService.checkUserLockout(user);

    // Generate Google Authenticator setup credentials (QR code, manual key, backup codes)
    const setupResult = await this.totpService.generateSetupCredentials(cleanEmail, 'MediNexa');

    // Create signed temporary session token containing setup payload (valid for 20 minutes)
    const resetSessionToken = this.jwtService.sign(
      {
        purpose: 'RESET_PASSWORD_TOTP',
        userId: user.id,
        email: cleanEmail,
        encryptedSecret: setupResult.encryptedSecret,
        hashedBackupCodes: setupResult.hashedBackupCodes,
      },
      { expiresIn: '20m' },
    );

    return {
      success: true,
      email: cleanEmail,
      resetSessionToken,
      qrCodeUrl: setupResult.qrCodeUrl,
      manualSetupKey: setupResult.manualSetupKey,
      otpauthUrl: setupResult.otpauthUrl,
      message: 'Scan the QR code with Google Authenticator and enter the 6-digit verification code.',
    };
  }

  /**
   * Verify Google Authenticator (TOTP) code and reset password securely
   */
  async resetPasswordOtp(body: {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword?: string;
    resetSessionToken?: string;
  }) {
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
    let newEncryptedSecret: string | null = null;
    let newHashedBackupCodes: string[] | null = null;

    // 1. If resetSessionToken is present, decode and test against session secret
    if (body.resetSessionToken) {
      try {
        const payload = this.jwtService.verify(body.resetSessionToken);
        if (payload.purpose === 'RESET_PASSWORD_TOTP' && payload.email === cleanEmail) {
          if (payload.encryptedSecret) {
            const isValid = this.totpService.verifyCode(payload.encryptedSecret, inputCode);
            if (isValid) {
              codeValid = true;
              newEncryptedSecret = payload.encryptedSecret;
              newHashedBackupCodes = payload.hashedBackupCodes;
            }
          }
        }
      } catch (err: any) {
        this.logger.warn(`[RESET PASSWORD] Token validation failed: ${err.message}`);
      }
    }

    // 2. If not yet valid, check against user's existing Google Authenticator secret
    if (!codeValid && user.totpSecret) {
      codeValid = this.totpService.verifyCode(user.totpSecret, inputCode);
      if (codeValid) {
        newEncryptedSecret = user.totpSecret;
        newHashedBackupCodes = user.backupCodes;
      }

      // Check backup codes
      if (!codeValid && user.backupCodes && user.backupCodes.length > 0) {
        usedBackupIndex = this.totpCryptoService.verifyBackupCode(inputCode, user.backupCodes);
        if (usedBackupIndex >= 0) {
          codeValid = true;
          newEncryptedSecret = user.totpSecret;
          newHashedBackupCodes = user.backupCodes.filter((_, i) => i !== usedBackupIndex);
        }
      }
    }

    if (!codeValid) {
      await this.totpService.handleFailedAttempt(user.id, user.failedTotpAttempts || 0);
      throw new BadRequestException('Invalid 6-digit Google Authenticator code. Please check your authenticator app.');
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        totpSecret: newEncryptedSecret || user.totpSecret,
        twoFactorEnabled: true,
        backupCodes: newHashedBackupCodes || user.backupCodes,
        failedTotpAttempts: 0,
        totpLockedUntil: null,
      },
    });

    this.logger.log(`[PASSWORD RESET] Successfully reset password via Google Authenticator for ${cleanEmail}`);
    return { success: true, message: 'Password reset successfully with Google Authenticator. You can now log in with your new password.' };
  }

  async getMe(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        organization: true,
        facility: true,
        patientProfile: true,
        staffProfile: true,
        doctorProfile: { include: { specialty: true, department: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account not found.');
    }

    return this.toUserDto(user);
  }

  async refreshToken(
    tokenInput?: string,
    userIdFallback?: string,
  ): Promise<{ accessToken: string; refreshToken: string; token: string; user: any; message: string }> {
    let targetUserId = userIdFallback;
    let newRefreshToken: string | null = null;

    if (tokenInput && tokenInput.trim().length > 10) {
      const rotation = await this.refreshTokenService.rotateRefreshToken(tokenInput);
      targetUserId = rotation.userId;
      newRefreshToken = rotation.newRefreshToken;
    }

    if (!targetUserId) {
      throw new UnauthorizedException('Refresh token is required to refresh authentication.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        role: true,
        organization: true,
        facility: true,
        patientProfile: true,
        staffProfile: true,
        doctorProfile: { include: { specialty: true, department: true } },
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or not found.');
    }

    if (!newRefreshToken) {
      const created = await this.refreshTokenService.createRefreshToken(user.id);
      newRefreshToken = created.refreshToken;
    }

    const token = this.generateJwtToken(user);
    this.logger.log(`[AUTH REFRESH] Token successfully rotated and refreshed for user ${user.email} (${user.role.code})`);

    return {
      accessToken: token,
      refreshToken: newRefreshToken,
      token,
      user: this.toUserDto(user),
      message: 'Access token successfully refreshed with rotation.',
    };
  }

  async logout(
    refreshTokenInput?: string,
    userId?: string,
    allSessions?: boolean,
  ): Promise<{ success: boolean; message: string }> {
    if (allSessions && userId) {
      await this.refreshTokenService.revokeAllUserTokens(userId);
      return { success: true, message: 'All active sessions have been successfully terminated.' };
    }
    if (refreshTokenInput) {
      await this.refreshTokenService.revokeToken(refreshTokenInput);
    } else if (userId) {
      await this.refreshTokenService.revokeAllUserTokens(userId);
    }
    return { success: true, message: 'Successfully logged out.' };
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

  getRolePermissions(roleCode?: string): string[] {
    const norm = (roleCode || '').toUpperCase().trim();
    switch (norm) {
      case 'SUPER_ADMIN':
      case 'MEDINEXA_ADMIN':
        return ['ALL', 'SYSTEM_ADMIN', 'MANAGE_HOSPITALS', 'MANAGE_STAFF', 'VIEW_ANALYTICS', 'MANAGE_BEDS', 'MANAGE_APPOINTMENTS', 'MANAGE_PHARMACY', 'MANAGE_LAB', 'AUDIT_LOGS'];
      case 'HOSPITAL_ADMIN':
      case 'ADMIN':
        return ['MANAGE_FACILITY', 'MANAGE_STAFF', 'VIEW_ANALYTICS', 'MANAGE_BEDS', 'MANAGE_DEPARTMENTS', 'MANAGE_APPOINTMENTS', 'AUDIT_LOGS'];
      case 'MANAGER':
      case 'HR_MANAGER':
        return ['VIEW_FACILITY', 'MANAGE_STAFF', 'VIEW_STAFF_ANALYTICS', 'OPERATIONS_MONITORING', 'VIEW_BEDS', 'VIEW_APPOINTMENTS', 'MANAGE_SHIFTS', 'VIEW_PAYROLL'];
      case 'DOCTOR':
        return ['VIEW_PATIENTS', 'WRITE_EMR', 'WRITE_PRESCRIPTIONS', 'VIEW_APPOINTMENTS', 'ORDER_LAB_TESTS', 'MANAGE_CONSULTATIONS'];
      case 'NURSE':
        return ['VIEW_PATIENTS', 'UPDATE_VITALS', 'MANAGE_BED_ALLOCATION', 'VIEW_PRESCRIPTIONS', 'RECORD_TRIAGE'];
      case 'RECEPTIONIST':
        return ['REGISTER_PATIENT', 'BOOK_APPOINTMENT', 'VIEW_BED_AVAILABILITY', 'CHECKIN_PATIENT', 'VIEW_QUEUES'];
      case 'PHARMACIST':
      case 'PHARMACY_STAFF':
        return ['VIEW_PRESCRIPTIONS', 'DISPENSE_MEDICATION', 'INVENTORY_MANAGEMENT', 'GENERATE_PHARMACY_BILLS'];
      case 'LAB_STAFF':
      case 'LAB_TECH':
      case 'LAB_TECHNICIAN':
        return ['VIEW_LAB_ORDERS', 'ENTER_TEST_RESULTS', 'UPLOAD_LAB_REPORTS'];
      case 'BILLING_STAFF':
        return ['CREATE_INVOICE', 'PROCESS_PAYMENTS', 'VIEW_FINANCIAL_REPORTS'];
      case 'INSURANCE_STAFF':
      case 'INSURANCE_COORDINATOR':
        return ['VERIFY_CLAIMS', 'PROCESS_PREAUTH', 'SUBMIT_REIMBURSEMENT'];
      case 'AMBULANCE_DRIVER':
        return ['VIEW_EMERGENCY_DISPATCH', 'UPDATE_LOCATION', 'CONFIRM_PICKUP'];
      case 'PATIENT':
        return ['VIEW_OWN_RECORDS', 'BOOK_OWN_APPOINTMENT', 'VIEW_OWN_PRESCRIPTIONS', 'REQUEST_BED'];
      default:
        return ['VIEW_FACILITY', 'BASIC_ACCESS'];
    }
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
      medinexaPersonId: user.medinexaPersonId || (user.firstName ? generatePersonId(user.firstName) : 'AYU-4826-KM'),
      uhid: user.patientProfile
        ? (user.patientProfile.address?.includes('UHID: ')
            ? user.patientProfile.address.replace('UHID: ', '').trim()
            : `UHID-${new Date(user.createdAt).getFullYear()}-${user.patientProfile.id.slice(0, 8).toUpperCase()}`)
        : undefined,
      staffId: user.staffId || user.staffProfile?.employeeCode || undefined,
      patientId: user.patientId || (user.patientProfile ? (user.patientProfile.address?.includes('UHID: ') ? user.patientProfile.address.replace('UHID: ', '').trim() : undefined) : undefined),
      hospitalIdentity: user.facility ? (user.facility.code?.startsWith('MNX-HOSP-') ? user.facility.code : `MNX-HOSP-${(user.facility.code || user.facility.id.slice(0, 5)).toUpperCase()}`) : undefined,
      hospitalId: user.facilityId || (user.facility ? user.facility.id : undefined),
      department: user.staffProfile?.department || user.doctorProfile?.department?.name || undefined,
      permissions: this.getRolePermissions(user.role?.code),
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

  /**
   * 1-Click Demo Persona Switcher (Provides authentic instant JWT token for testing any of the 16 roles)
   */
  async demoSwitch(roleCode?: string, email?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Demo persona switching is strictly disabled in production environments.');
    }
    let whereClause: any = {};
    if (email) {
      whereClause.email = email.trim().toLowerCase();
    } else if (roleCode) {
      const normalized = normalizeRoleCode(roleCode);
      whereClause.OR = [
        { role: { code: normalized } },
        { role: { name: normalized } },
      ];
    } else {
      whereClause.email = 'admin@medinexa.com';
    }

    let user: any = await this.prisma.user.findFirst({
      where: whereClause,
      include: {
        role: true,
        organization: true,
        facility: true,
        doctorProfile: { include: { specialty: true, department: true } },
        patientProfile: true,
      },
    });

    // Fallback 1: If email search was attempted first and yielded null, try matching by roleCode
    if (!user && roleCode) {
      const normalized = normalizeRoleCode(roleCode);
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { role: { code: normalized } },
            { role: { name: normalized } },
          ],
        },
        include: {
          role: true,
          organization: true,
          facility: true,
          doctorProfile: { include: { specialty: true, department: true } },
          patientProfile: true,
        },
      });
    }

    // Fallback 2: If still not found, find any active user in DB and map the target role
    if (!user) {
      const anyUser = await this.prisma.user.findFirst({
        where: { status: UserStatus.ACTIVE },
        include: {
          role: true,
          organization: true,
          facility: true,
        },
      });

      if (anyUser) {
        const targetCode = roleCode ? normalizeRoleCode(roleCode) : 'HOSPITAL_ADMIN';
        let targetRole = await this.prisma.role.findUnique({ where: { code: targetCode } });
        if (!targetRole) {
          try {
            targetRole = await this.prisma.role.create({
              data: {
                code: targetCode,
                name: targetCode.replace(/_/g, ' '),
                description: `Demo Role for ${targetCode}`,
              },
            });
          } catch {
            targetRole = anyUser.role;
          }
        }
        user = {
          ...anyUser,
          email: email || anyUser.email,
          role: targetRole || anyUser.role,
        };
      }
    }

    if (!user) {
      throw new NotFoundException(`Demo user not found for role/email: ${roleCode || email}`);
    }

    // Determine target facility scope (Hospital A vs Hospital B vs Cross-Enterprise)
    const cleanEmail = (email || user.email || '').toLowerCase().trim();
    let effectiveFacilityId = user.facilityId || undefined;
    let effectiveFacility = user.facility;

    if (
      cleanEmail === 'admin.hospitalb@medinexa.com' ||
      cleanEmail.includes('.b@medinexa.com') ||
      cleanEmail.includes('hospitalb')
    ) {
      effectiveFacilityId = 'HOSPITAL_B';
      effectiveFacility = {
        id: 'HOSPITAL_B',
        organizationId: user.organizationId || 'org-medinexa',
        name: 'MediNexa Super-Specialty Medical Institute (Hospital B)',
        code: 'HOSPITAL_B',
        city: 'Sector 62 Healthcare Campus, Noida',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      user.firstName = user.firstName || 'Vikram';
      user.lastName = user.lastName || 'Malhotra';
    } else if (
      cleanEmail === 'admin.hospitala@medinexa.com' ||
      cleanEmail === 'hospitaladmin@medinexa.com' ||
      cleanEmail.includes('.a@medinexa.com') ||
      cleanEmail.includes('hospitala')
    ) {
      effectiveFacilityId = 'HOSPITAL_A';
      effectiveFacility = {
        id: 'HOSPITAL_A',
        organizationId: user.organizationId || 'org-medinexa',
        name: 'MediNexa General Hospital (Hospital A)',
        code: 'HOSPITAL_A',
        city: 'Knowledge Park II Facility, Greater Noida',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      user.firstName = user.firstName || 'Sunita';
      user.lastName = user.lastName || 'Singh';
    } else if (user.role?.code === 'SUPER_ADMIN' || user.role?.code === 'MEDINEXA_ADMIN' || user.role?.code === 'PATIENT') {
      // Global master oversight or universal patient access
      effectiveFacilityId = undefined;
    } else if (!effectiveFacilityId) {
      // Default standard working staff to Hospital A
      effectiveFacilityId = 'HOSPITAL_A';
      effectiveFacility = {
        id: 'HOSPITAL_A',
        organizationId: user.organizationId || 'org-medinexa',
        name: 'MediNexa General Hospital (Hospital A)',
        code: 'HOSPITAL_A',
        city: 'Knowledge Park II Facility, Greater Noida',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    user.facilityId = effectiveFacilityId;
    user.facility = effectiveFacility;

    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.code as RoleCode,
        status: user.status as UserStatus,
        organizationId: user.organizationId,
        facilityId: effectiveFacilityId,
      },
      { expiresIn: '24h' },
    );

    this.logger.log(`[AUTH DEMO-SWITCH] Switched successfully to ${user.email} (${user.role.code}) [Facility: ${effectiveFacilityId || 'CROSS-ENTERPRISE'}]`);

    return {
      accessToken: token,
      token,
      user: this.toUserDto(user),
    };
  }

  /**
   * =========================================================================
   * Staff Onboarding & Single-Use Invitation Verification / Acceptance
   * =========================================================================
   */

  async verifyStaffInvitation(code?: string, token?: string) {
    const cleanCode = code?.trim();
    const cleanToken = token?.trim();

    if (!cleanCode && !cleanToken) {
      throw new BadRequestException('Invitation code or verification token is required.');
    }

    const tokenHash = cleanToken ? crypto.createHash('sha256').update(cleanToken).digest('hex') : null;

    const invitation = await this.prisma.staffInvitation.findFirst({
      where: {
        OR: [
          ...(cleanCode ? [{ staffId: { equals: cleanCode, mode: 'insensitive' as any } }] : []),
          ...(cleanToken
            ? [
                { token: tokenHash! },
                { token: cleanToken }, // backward compatibility for legacy unhashed tokens
              ]
            : []),
        ],
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or invalid. Please check your invitation link or code.');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new ConflictException('This invitation has already been accepted and activated. Please log in directly.');
    }

    if (invitation.status === 'CANCELLED' || invitation.status === 'REVOKED') {
      throw new BadRequestException('This invitation has been cancelled or revoked by the administrator.');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('This invitation has expired. Please contact your hospital administrator for a new invitation.');
    }

    const facility = await this.prisma.facility.findUnique({
      where: { id: invitation.facilityId },
      select: { id: true, name: true, code: true, city: true },
    });

    return {
      id: invitation.id,
      valid: true,
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      roleCode: invitation.roleCode,
      department: invitation.department,
      facilityId: invitation.facilityId,
      facilityName: facility?.name || 'MediNexa Facility',
      facilityCode: facility?.code || 'FACILITY',
      facilityCity: facility?.city || 'Delhi',
      invitationCode: invitation.staffId,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptStaffInvitation(dto: {
    code?: string;
    token?: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }) {
    const verification = await this.verifyStaffInvitation(dto.code, dto.token);

    if (!dto.password || typeof dto.password !== 'string') {
      throw new BadRequestException('Password is required.');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-~`+=])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-~`+=]{8,}$/;
    if (!passwordRegex.test(dto.password)) {
      throw new BadRequestException(
        'Password requirements not met: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.',
      );
    }

    if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const cleanEmail = verification.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Resolve or provision Role
    let role = await this.prisma.role.findUnique({
      where: { code: verification.roleCode },
    });
    if (!role) {
      role = await this.prisma.role.create({
        data: {
          code: verification.roleCode,
          name: verification.roleCode.replace(/_/g, ' '),
          description: `Enterprise role for ${verification.roleCode}`,
        },
      });
    }

    // Resolve Facility & Organization
    const facility = await this.prisma.facility.findUnique({
      where: { id: verification.facilityId },
    });

    let organizationId = facility?.organizationId;
    if (!organizationId) {
      const defaultOrg = await this.prisma.organization.findFirst();
      organizationId = defaultOrg?.id || 'org-medinexa';
    }

    const activatedUser = await this.prisma.$transaction(async (tx) => {
      // Find or create User
      let user = await tx.user.findUnique({
        where: { email: cleanEmail },
      });

      if (user) {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            passwordHash,
            status: UserStatus.ACTIVE,
            isActive: true,
            roleId: role.id,
            facilityId: verification.facilityId,
            staffId: verification.invitationCode,
            phone: dto.phone?.trim() || user.phone,
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            email: cleanEmail,
            passwordHash,
            firstName: verification.firstName,
            lastName: verification.lastName,
            phone: dto.phone?.trim() || null,
            status: UserStatus.ACTIVE,
            isActive: true,
            roleId: role.id,
            organizationId,
            facilityId: verification.facilityId,
            staffId: verification.invitationCode,
            medinexaPersonId: generatePersonId(verification.firstName),
          },
        });
      }

      // Upsert Employee Profile
      await tx.employeeProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          facilityId: verification.facilityId,
          employeeCode: verification.invitationCode,
          fullName: `${verification.firstName} ${verification.lastName}`,
          email: cleanEmail,
          phone: dto.phone?.trim() || user.phone || 'N/A',
          designation: verification.roleCode,
          department: verification.department || 'Operations',
          employeeStatus: EmployeeStatus.ACTIVE,
          joiningDate: new Date(),
        },
        update: {
          employeeStatus: EmployeeStatus.ACTIVE,
          department: verification.department || 'Operations',
          designation: verification.roleCode,
          facilityId: verification.facilityId,
        },
      }).catch(() => null);

      // Provision Doctor Profile if DOCTOR
      if (verification.roleCode === 'DOCTOR') {
        const defaultDept = await tx.department.findFirst({
          where: { facilityId: verification.facilityId },
        });
        const defaultSpec = await tx.specialty.findFirst();

        if (defaultDept && defaultSpec) {
          const licNum = `LIC-${verification.invitationCode.replace(/[^A-Za-z0-9]/g, '')}`;
          await tx.doctorProfile.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              facilityId: verification.facilityId,
              departmentId: defaultDept.id,
              specialtyId: defaultSpec.id,
              licenseNumber: licNum,
              status: 'ACTIVE',
            },
            update: {
              facilityId: verification.facilityId,
              status: 'ACTIVE',
            },
          }).catch(() => null);
        }
      }

      // Mark single-use invitation as ACCEPTED atomically preventing concurrent race conditions
      const updateResult = await tx.staffInvitation.updateMany({
        where: {
          id: verification.id,
          status: 'INVITED',
        },
        data: {
          status: 'ACCEPTED',
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException('This invitation has already been accepted concurrently or is no longer active.');
      }

      // Audit event
      await tx.auditEvent.create({
        data: {
          userId: user.id,
          role: verification.roleCode,
          facilityId: verification.facilityId,
          action: 'STAFF_INVITATION_ACCEPTED',
          resource: 'USER',
          details: JSON.stringify({
            userId: user.id,
            email: cleanEmail,
            roleCode: verification.roleCode,
            facilityId: verification.facilityId,
            invitationCode: verification.invitationCode,
          }),
        },
      }).catch(() => null);

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          role: true,
          organization: true,
          facility: true,
          staffProfile: true,
          patientProfile: true,
        },
      });
    });

    if (!activatedUser) {
      throw new BadRequestException('User activation failed. Please try again.');
    }

    const token = this.jwtService.sign(
      {
        sub: activatedUser.id,
        email: activatedUser.email,
        role: activatedUser.role.code as RoleCode,
        status: activatedUser.status as UserStatus,
        organizationId: activatedUser.organizationId,
        facilityId: activatedUser.facilityId || undefined,
      },
      { expiresIn: '24h' },
    );

    this.logger.log(
      `🎉 [STAFF ONBOARDING] Invitation accepted & account activated: ${activatedUser.email} (${activatedUser.role.code}) at ${verification.facilityName}`,
    );

    return {
      accessToken: token,
      token,
      user: this.toUserDto(activatedUser),
      message: 'Invitation accepted and account activated successfully! Welcome to MediNexa.',
    };
  }
}
