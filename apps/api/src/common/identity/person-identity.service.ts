import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generatePersonId,
  isValidPersonId,
  normalizePersonId,
  extractPersonNamePrefix,
} from '@medinexa/validation';
import {
  RoleCode,
  PersonIdentityDto,
  PersonLookupResultDto,
} from '@medinexa/types';

@Injectable()
export class PersonIdentityService implements OnModuleInit {
  private readonly logger = new Logger(PersonIdentityService.name);

  // In-memory canonical demo map to guarantee immediate deterministic resolution
  private readonly canonicalDemoIds: Record<string, string> = {
    'demo-p-01': 'AYU-4826-KM',
    'demo-1': 'AYU-4826-KM',
    'ayush': 'AYU-4826-KM',
    'demo-p-02': 'PRI-2841-XD',
    'demo-p-03': 'RAJ-3910-GU',
    'demo-p-04': 'MEE-4829-NR',
    'demo-p-05': 'VIK-5719-ML',
    'demo-p-06': 'SNE-6184-SN',
    'demo-p-07': 'AMI-7291-PT',
    'demo-p-08': 'SUN-8392-RO',
    'demo-p-09': 'KAB-9041-MH',
    'demo-p-10': 'ANA-9921-VM',
    'doc-demo-1': 'RAJ-7314-QP',
    'dr-khanna': 'RAJ-7314-QP',
    'nr-priya': 'PRI-2841-XD',
    'priya': 'PRI-2841-XD',
    'rc-neha': 'NEH-6193-LK',
    'neha': 'NEH-6193-LK',
    'ph-amit': 'AMI-4527-RT',
    'amit': 'AMI-4527-RT',
    'lt-ravi': 'RAV-8305-MN',
    'ravi': 'RAV-8305-MN',
    'mg-rahul': 'RAH-1974-ZX',
    'rahul': 'RAH-1974-ZX',
    'ha-ankit': 'ANK-5638-PW',
    'ankit': 'ANK-5638-PW',
  };

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.migrateExistingUsers();
    } catch (e: any) {
      this.logger.warn(`Initial Person ID migration notice: ${e?.message || e}`);
    }
  }

  /**
   * Generates a globally unique MediNexa Person ID with collision retry.
   * Format: NAME-0000-AA (e.g. AYU-4826-KM)
   */
  async generateUniquePersonId(
    firstName: string,
    preferredDigits?: string,
    preferredLetters?: string,
  ): Promise<string> {
    const maxRetries = 10;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // First attempt respects preferred digits/letters if provided
      const candidate = attempt === 0 && (preferredDigits || preferredLetters)
        ? generatePersonId(firstName, preferredDigits, preferredLetters)
        : generatePersonId(firstName);

      // Global check across all users
      const existing = await this.prisma.user.findUnique({
        where: { medinexaPersonId: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    }

    // High collision fallback: ensure uniqueness with timestamp entropy
    const prefix = extractPersonNamePrefix(firstName);
    const entropyDigits = String(Date.now() % 10000).padStart(4, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const entropyLetters =
      chars.charAt(Math.floor(Math.random() * chars.length)) +
      chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefix}-${entropyDigits}-${entropyLetters}`;
  }

  /**
   * Assigns and persists a permanent, immutable MediNexa Person ID to a user.
   * If user already has an ID, returns it without modification.
   */
  async assignPersonIdToUser(
    userId: string,
    preferredId?: string,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    // Permanent Immutability: If already assigned, never mutate
    if (user.medinexaPersonId) {
      return user.medinexaPersonId;
    }

    const candidateName = user.firstName || user.email.split('@')[0] || 'User';

    let targetId: string;
    if (preferredId && isValidPersonId(preferredId)) {
      const isTaken = await this.prisma.user.findUnique({
        where: { medinexaPersonId: preferredId },
        select: { id: true },
      });
      targetId = isTaken ? await this.generateUniquePersonId(candidateName) : preferredId;
    } else {
      targetId = await this.generateUniquePersonId(candidateName);
    }

    // Safe database-enforced assignment with conflict catch
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { medinexaPersonId: targetId },
      });

      // Audit event
      await this.prisma.auditEvent.create({
        data: {
          userId,
          action: 'PERSON_ID_GENERATED',
          resource: `user:${userId}`,
          details: JSON.stringify({
            medinexaPersonId: targetId,
            roleCode: user.role?.code || 'USER',
            assignedAt: new Date().toISOString(),
          }),
        },
      }).catch(() => {});

      return targetId;
    } catch (err: any) {
      // If concurrent request won the race, fetch the assigned ID
      if (err?.code === 'P2002') {
        const refreshed = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { medinexaPersonId: true },
        });
        if (refreshed?.medinexaPersonId) return refreshed.medinexaPersonId;
        // Retry with completely fresh code
        const retryId = await this.generateUniquePersonId(candidateName);
        await this.prisma.user.update({
          where: { id: userId },
          data: { medinexaPersonId: retryId },
        });
        return retryId;
      }
      throw err;
    }
  }

  /**
   * Idempotent migration to ensure every existing person in MediNexa has a permanent Person ID.
   */
  async migrateExistingUsers(): Promise<{ migrated: number; totalUsers: number }> {
    const unassignedUsers = await this.prisma.user.findMany({
      where: { medinexaPersonId: null },
      include: { role: true },
    });

    let migrated = 0;
    for (const u of unassignedUsers) {
      const emailLower = (u.email || '').toLowerCase();
      const nameLower = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      let preferredId: string | undefined = undefined;

      // Map canonical demo personas if unassigned
      if (emailLower.includes('ayush') || nameLower.includes('ayush singh')) {
        preferredId = 'AYU-4826-KM';
      } else if (emailLower.includes('khanna') || nameLower.includes('rajesh khanna')) {
        preferredId = 'RAJ-7314-QP';
      } else if (emailLower.includes('priya') || nameLower.includes('priya sharma')) {
        preferredId = 'PRI-2841-XD';
      } else if (emailLower.includes('neha') || nameLower.includes('neha gupta')) {
        preferredId = 'NEH-6193-LK';
      } else if (emailLower.includes('amit') || nameLower.includes('amit patel')) {
        preferredId = 'AMI-4527-RT';
      } else if (emailLower.includes('ravi') || nameLower.includes('ravi kumar')) {
        preferredId = 'RAV-8305-MN';
      } else if (emailLower.includes('rahul') || nameLower.includes('rahul verma')) {
        preferredId = 'RAH-1974-ZX';
      } else if (emailLower.includes('ankit') || nameLower.includes('ankit gupta')) {
        preferredId = 'ANK-5638-PW';
      }

      try {
        await this.assignPersonIdToUser(u.id, preferredId);
        migrated++;
      } catch (err: any) {
        this.logger.warn(`Could not migrate user ${u.id}: ${err.message}`);
      }
    }

    const totalUsers = await this.prisma.user.count();
    return { migrated, totalUsers };
  }

  /**
   * Look up any person by their MediNexa Person ID (NAME-0000-AA).
   * Supports case-insensitive and whitespace-tolerant input.
   */
  async lookupPerson(
    rawPersonId: string,
    requestingUser?: any,
  ): Promise<PersonLookupResultDto> {
    const normalized = normalizePersonId(rawPersonId);
    if (!isValidPersonId(normalized)) {
      return {
        found: false,
        message: `Invalid MediNexa Person ID format: '${rawPersonId}'. Expected format: NAME-0000-AA (e.g. AYU-4826-KM).`,
      };
    }

    // 1. Direct search by unique medinexaPersonId
    let user = await this.prisma.user.findUnique({
      where: { medinexaPersonId: normalized },
      include: {
        role: true,
        facility: true,
        patientProfile: true,
        doctorProfile: true,
        staffProfile: true,
      },
    });

    // 2. Check canonical demo mappings if user not in DB or in mock session
    if (!user) {
      // Find candidate from demo map
      const matchedKey = Object.entries(this.canonicalDemoIds).find(
        ([, id]) => id === normalized,
      )?.[0];

      if (matchedKey) {
        const isAyush = normalized === 'AYU-4826-KM';
        const isRajesh = normalized === 'RAJ-7314-QP';
        const isPriya = normalized === 'PRI-2841-XD';
        const isNeha = normalized === 'NEH-6193-LK';
        const isAmit = normalized === 'AMI-4527-RT';
        const isRavi = normalized === 'RAV-8305-MN';
        const isRahul = normalized === 'RAH-1974-ZX';
        const isAnkit = normalized === 'ANK-5638-PW';

        const roleCode = isAyush
          ? RoleCode.PATIENT
          : isRajesh
          ? RoleCode.DOCTOR
          : isPriya
          ? RoleCode.NURSE
          : isNeha
          ? RoleCode.RECEPTIONIST
          : isAmit
          ? RoleCode.PHARMACY_STAFF
          : isRavi
          ? RoleCode.LAB_STAFF
          : isRahul
          ? RoleCode.MANAGER
          : RoleCode.HOSPITAL_ADMIN;

        const fullName = isAyush
          ? 'Ayush Singh'
          : isRajesh
          ? 'Dr. Rajesh Khanna'
          : isPriya
          ? 'Priya Sharma'
          : isNeha
          ? 'Neha Gupta'
          : isAmit
          ? 'Amit Patel'
          : isRavi
          ? 'Ravi Kumar'
          : isRahul
          ? 'Rahul Verma'
          : 'Ankit Gupta';

        const person: PersonIdentityDto = {
          id: `demo-${normalized.toLowerCase()}`,
          medinexaPersonId: normalized,
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' ') || '',
          fullName,
          email: `${fullName.toLowerCase().replace(/[^a-z]/g, '')}@medinexa.health`,
          phone: '+91 98765 43210',
          roleCode,
          roleName: roleCode.replace('_', ' '),
          facilityId: 'HOSPITAL_A',
          facilityName: 'MediNexa General Hospital (Hospital A)',
          organizationId: 'org-medinexa',
          status: 'ACTIVE',
          staffLoginId: !isAyush ? `${roleCode.slice(0, 2)}.${fullName.split(' ')[0].toUpperCase()}-4921` : undefined,
          patientId: isAyush ? 'demo-p-01' : undefined,
          uhid: isAyush ? normalized : undefined,
          createdAt: new Date().toISOString(),
        };

        return { found: true, person };
      }
    }

    if (!user) {
      return {
        found: false,
        message: `No MediNexa Person found with ID '${normalized}'.`,
      };
    }

    // Role-based Access Control and Tenant Isolation
    if (requestingUser) {
      const requesterRole =
        requestingUser.roleCode || requestingUser.role?.code || requestingUser.role;
      const requesterFacilityId =
        requestingUser.facilityId || requestingUser.facility?.id;
      const isSuperAdmin =
        requesterRole === RoleCode.MEDINEXA_ADMIN || requesterRole === RoleCode.SUPER_ADMIN;

      // Patients can only lookup their own person record
      if (requesterRole === RoleCode.PATIENT && user.id !== requestingUser.id) {
        throw new ForbiddenException('Access denied. Patients may only look up their own profile.');
      }

      // Facility staff can look up any patient (for cross-hospital intake), but can only see staff of their own facility
      if (
        !isSuperAdmin &&
        requesterRole !== RoleCode.PATIENT &&
        user.role?.code !== RoleCode.PATIENT
      ) {
        if (user.facilityId && requesterFacilityId && user.facilityId !== requesterFacilityId) {
          throw new ForbiddenException(
            `Access denied. Staff record belongs to facility '${user.facilityId}' and cannot be accessed from '${requesterFacilityId}'.`,
          );
        }
      }
    }

    const person: PersonIdentityDto = {
      id: user.id,
      medinexaPersonId: user.medinexaPersonId || normalized,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone,
      roleCode: user.role?.code || 'USER',
      roleName: user.role?.name || user.role?.code || 'User',
      facilityId: user.facilityId,
      facilityName: user.facility?.name || null,
      organizationId: user.organizationId,
      status: user.status,
      staffLoginId: user.staffId,
      employeeCode: user.staffProfile?.employeeCode || null,
      patientId: user.patientId,
      uhid: user.role?.code === RoleCode.PATIENT ? (user.medinexaPersonId || normalized) : null,
      createdAt: user.createdAt.toISOString(),
    };

    return { found: true, person };
  }
}
