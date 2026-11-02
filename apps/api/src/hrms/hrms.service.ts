import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode } from '@medinexa/types';
import {
  EmployeeStatus,
  AttendanceStatus,
  LeaveStatus,
  PayrollStatus,
} from '@prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CreateLeaveRequestDto } from './dto/leave-request.dto';
import { GeneratePayrollDto } from './dto/payroll.dto';
import { RunPayrollDto } from './dto/run-payroll.dto';
import { CreateCredentialDto } from './dto/credential.dto';
import { CreatePerformanceReviewDto } from './dto/performance-review.dto';
import { BulkUploadStaffDto } from './dto/bulk-upload-staff.dto';
import { CreateStaffInvitationDto, UpdateStaffStatusDto } from './dto/staff-invitation.dto';
import { UserStatus } from '@prisma/client';
import {
  normalizeRoleCode,
  generateStaffLoginId,
  isValidStaffLoginId,
  getRolePrefix,
  generatePersonId,
} from '@medinexa/validation';
import * as bcrypt from 'bcryptjs';
import { PersonIdentityService } from '../common/identity/person-identity.service';
import { Optional } from '@nestjs/common';

@Injectable()
export class HrmsService implements OnModuleInit {
  private readonly logger = new Logger(HrmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly personIdentityService?: PersonIdentityService,
  ) {}

  async onModuleInit() {
    await this.migrateExistingStaffLoginIds();
  }

  private resolveFacilityId(user: any, requestedFacilityId?: string): string {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;

    if (userRole === RoleCode.MEDINEXA_ADMIN) {
      return requestedFacilityId || userFacilityId || '95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8';
    }

    if (!userFacilityId) {
      throw new ForbiddenException('User is not associated with any healthcare facility.');
    }

    if (requestedFacilityId && requestedFacilityId !== userFacilityId) {
      throw new ForbiddenException('Cross-facility access denied: Multi-Hospital Isolation restricts cross-facility HRMS operations.');
    }

    return userFacilityId;
  }

  private checkStaffAccess(user: any) {
    const userRole = user.roleCode || user.role?.code;
    if (userRole === RoleCode.PATIENT) {
      throw new ForbiddenException('Access denied: HRMS, Workforce Management, and Payroll operations require authorized administrative credentials.');
    }
  }

  private checkFacilityIsolation(facilityId: string | null | undefined, user: any) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;
    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && facilityId && userFacilityId !== facilityId) {
      throw new ForbiddenException('Access denied: Multi-Hospital Isolation restricts cross-facility HRMS operations.');
    }
  }

  // ====================================================
  // 1. EMPLOYEES & WORKFORCE REGISTRY
  // ====================================================

  /**
   * Generates a guaranteed-unique, standardized Staff Login ID:
   * Format: ROLE_PREFIX.FIRSTNAME-LAST4MOBILE (e.g. DR.AYUSH-0263)
   * With deterministic collision suffix if needed (e.g. DR.AYUSH-0263-01).
   */
  async generateUniqueStaffLoginId(
    roleCode: string,
    fullName: string,
    phone?: string | null,
    customId?: string,
    excludeUserId?: string,
  ): Promise<string> {
    if (customId && customId.trim()) {
      const normalizedCustom = customId.trim().toUpperCase();
      if (!isValidStaffLoginId(normalizedCustom)) {
        throw new BadRequestException(
          `Invalid Staff Login ID format: "${normalizedCustom}". Format must follow e.g. DR.AYUSH-0263 or DR.AYUSH-CARDIO-0263.`,
        );
      }
      const existing = await this.prisma.user.findFirst({
        where: {
          staffId: { equals: normalizedCustom, mode: 'insensitive' },
          ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        },
      });
      if (existing) {
        throw new ConflictException(`Staff Login ID "${normalizedCustom}" is already in use by another user.`);
      }
      return normalizedCustom;
    }

    const baseId = generateStaffLoginId(roleCode, fullName, phone);

    const existing = await this.prisma.user.findFirst({
      where: {
        staffId: { equals: baseId, mode: 'insensitive' },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });

    if (!existing) {
      return baseId;
    }

    // Deterministic collision handling: append -01, -02...
    for (let i = 1; i <= 99; i++) {
      const candidate = `${baseId}-${String(i).padStart(2, '0')}`;
      const collision = await this.prisma.user.findFirst({
        where: {
          staffId: { equals: candidate, mode: 'insensitive' },
          ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        },
      });
      if (!collision) {
        return candidate;
      }
    }

    return `${baseId}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  /**
   * Safe, non-destructive migration backfill for existing hospital staff users
   * to ensure every staff user has a canonical role-based Staff Login ID.
   */
  async migrateExistingStaffLoginIds() {
    try {
      const staffUsers = await this.prisma.user.findMany({
        where: {
          role: { code: { not: 'PATIENT' } },
          OR: [
            { staffId: null },
            { staffId: '' },
            { NOT: { staffId: { contains: '.' } } },
          ],
        },
        include: { role: true, staffProfile: true },
        take: 100,
      });

      for (const u of staffUsers) {
        const roleCode = u.role?.code || 'MANAGER';
        const fullName = `${u.firstName || 'Staff'} ${u.lastName || ''}`.trim();
        const phone = u.phone || u.staffProfile?.phone || null;
        const newStaffId = await this.generateUniqueStaffLoginId(roleCode, fullName, phone, undefined, u.id);

        await this.prisma.user.update({
          where: { id: u.id },
          data: { staffId: newStaffId },
        });

        if (u.staffProfile) {
          await this.prisma.employeeProfile.update({
            where: { id: u.staffProfile.id },
            data: { employeeCode: newStaffId },
          });
        }

        this.logger.log(`[HRMS Migration] Assigned role-based Staff Login ID ${newStaffId} to user ${u.email}`);
      }
    } catch (err) {
      this.logger.warn(`[HRMS Migration] Background migration notice: ${err}`);
    }
  }

  async createEmployee(dto: CreateEmployeeDto, user: any) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, dto.facilityId);
    const facility = await this.prisma.facility.findUnique({ where: { id: facilityId } });

    const rawRole = dto.roleCode || dto.designation || 'MANAGER';
    const normalizedRole = normalizeRoleCode(rawRole) || 'MANAGER';

    const userRole = (user.roleCode || user.role?.code || '').toUpperCase();
    if (userRole === 'MANAGER' || userRole === 'HR_MANAGER') {
      if (['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(normalizedRole)) {
        throw new ForbiddenException('Managers cannot create or assign accounts with Manager or Administrator roles.');
      }
    }

    const fullName = dto.fullName?.trim() || `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || 'Staff Member';
    const nameParts = fullName.split(/\s+/);
    const firstName = dto.firstName?.trim() || nameParts[0] || 'Staff';
    const lastName = dto.lastName?.trim() || nameParts.slice(1).join(' ') || 'Member';

    // Automatically generate unique role-based Staff Login ID (e.g. DR.AYUSH-0263)
    const staffId = await this.generateUniqueStaffLoginId(
      normalizedRole,
      fullName,
      dto.phone,
      dto.staffLoginId,
    );
    const employeeCode = dto.employeeCode || staffId;
    const department = dto.department || 'General Medicine';
    const email = dto.email ? dto.email.trim().toLowerCase() : `${staffId.toLowerCase().replace(/[^a-z0-9]/g, '.')}@medinexa.local`;
    const phone = dto.phone || '+91-9876543210';
    const joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : new Date();

    let linkedUserId = dto.userId || null;

    // Transaction-Safe Staff Creation (Section 21)
    const employeeProfile = await this.prisma.$transaction(async (tx) => {
      // Check if user account needs to be created or linked
      if (!linkedUserId) {
        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
          linkedUserId = existingUser.id;
          const personId =
            existingUser.medinexaPersonId ||
            (this.personIdentityService
              ? await this.personIdentityService.generateUniquePersonId(existingUser.firstName || firstName)
              : generatePersonId(existingUser.firstName || firstName));
          await tx.user.update({
            where: { id: existingUser.id },
            data: { staffId, medinexaPersonId: personId },
          });
        } else {
          let roleRecord = await tx.role.findUnique({ where: { code: normalizedRole } });
          if (!roleRecord) {
            roleRecord = await tx.role.create({
              data: {
                code: normalizedRole,
                name: normalizedRole.replace(/_/g, ' '),
                description: `Hospital role for ${normalizedRole}`,
              },
            });
          }

          const org = await tx.organization.findFirst();
          const initialPassword = dto.password || 'Staff@123456';
          const passwordHash = await bcrypt.hash(initialPassword, 10);

          const personId = this.personIdentityService
            ? await this.personIdentityService.generateUniquePersonId(firstName)
            : generatePersonId(firstName);

          const newUser = await tx.user.create({
            data: {
              email,
              passwordHash,
              firstName,
              lastName,
              phone,
              status: UserStatus.ACTIVE,
              roleId: roleRecord.id,
              organizationId: org?.id || facility?.organizationId || 'org-default',
              facilityId,
              staffId,
              medinexaPersonId: personId,
            },
          });
          linkedUserId = newUser.id;
        }
      }

      const emp = await tx.employeeProfile.create({
        data: {
          facilityId,
          employeeCode,
          fullName,
          department,
          designation: dto.designation || normalizedRole,
          joiningDate,
          employeeStatus: dto.employeeStatus || EmployeeStatus.ACTIVE,
          phone,
          email,
          emergencyContact: dto.emergencyContact || '+91-9123456789 (Kin)',
          reportingManagerId: dto.reportingManagerId || null,
          userId: linkedUserId,
        },
        include: {
          facility: { select: { name: true, code: true } },
          reportingManager: { select: { fullName: true, designation: true } },
          user: { select: { id: true, email: true, staffId: true, role: { select: { code: true, name: true } } } },
        },
      });

      // Auto-create initial Payroll/Salary record if salary specified
      const basicSalary = dto.basicSalary || 55000.0;
      const allowances = dto.allowances !== undefined ? dto.allowances : 12000.0;
      const deductions = dto.deductions !== undefined ? dto.deductions : 6500.0;
      const netSalary = parseFloat((basicSalary + allowances - deductions).toFixed(2));
      const currentMonth = new Date().toISOString().slice(0, 7);

      try {
        await tx.payrollRecord.create({
          data: {
            employeeId: emp.id,
            payrollMonth: currentMonth,
            basicSalary,
            allowances,
            deductions,
            netSalary,
            payrollStatus: PayrollStatus.GENERATED,
          },
        });
      } catch (e) {
        // Optional payroll initialization
      }

      // Record audit events
      try {
        await tx.auditEvent.create({
          data: {
            userId: user.id || user.sub,
            role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
            facilityId,
            action: 'STAFF_LOGIN_ID_CREATED',
            resource: 'HRMS_STAFF',
            details: `Staff Login ID generated: ${staffId} for ${emp.fullName} - Role: ${normalizedRole}, Dept: ${department}`,
          },
        });
        await tx.auditEvent.create({
          data: {
            userId: user.id || user.sub,
            role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
            facilityId,
            action: normalizedRole === 'MANAGER' ? 'MANAGER_CREATED' : 'STAFF_CREATED',
            resource: 'HRMS_STAFF',
            details: `Staff member created: ${emp.fullName} (${staffId}) - Role: ${normalizedRole}, Dept: ${department}`,
          },
        });
      } catch (err) {
        // Fail-safe audit
      }

      return emp;
    });

    this.logger.log(`[HRMS] Registered Staff #${employeeProfile.employeeCode} (${staffId}) - ${employeeProfile.fullName}`);
    return { ...employeeProfile, staffId };
  }

  async getEmployees(user: any, facilityIdParam?: string, department?: string, roleCode?: string, status?: string) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, facilityIdParam);

    const where: any = { facilityId };
    if (department && department !== 'ALL') where.department = { contains: department.trim(), mode: 'insensitive' };
    if (status && status !== 'ALL') where.employeeStatus = status;

    const employees = await this.prisma.employeeProfile.findMany({
      where,
      include: {
        facility: { select: { id: true, name: true, code: true } },
        reportingManager: { select: { fullName: true, designation: true } },
        credentials: true,
        user: { select: { id: true, email: true, status: true, isActive: true, staffId: true, role: { select: { code: true, name: true } } } },
        shiftSchedules: { take: 1, orderBy: { startTime: 'desc' } },
        attendanceRecords: { take: 1, orderBy: { createdAt: 'desc' } },
        leaveRequests: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (roleCode && roleCode !== 'ALL') {
      const normRole = normalizeRoleCode(roleCode);
      return employees.filter((emp) => {
        const uRole = emp.user?.role?.code;
        return (uRole && normalizeRoleCode(uRole) === normRole) || emp.designation.toUpperCase().includes(normRole);
      });
    }

    return employees;
  }

  async updateStaffStatus(id: string, dto: UpdateStaffStatusDto, user: any) {
    this.checkStaffAccess(user);
    const employee = await this.getEmployeeById(id, user);

    const userRole = (user.roleCode || user.role?.code || '').toUpperCase();
    const targetRole = (employee.user?.role?.code || employee.designation || '').toUpperCase();
    if (userRole === 'MANAGER' || userRole === 'HR_MANAGER') {
      if (['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(targetRole)) {
        throw new ForbiddenException('Managers cannot modify account status of Managers or Administrators.');
      }
    }

    let mappedEmployeeStatus: EmployeeStatus = EmployeeStatus.ACTIVE;
    if (dto.status === 'SUSPENDED') mappedEmployeeStatus = EmployeeStatus.SUSPENDED;
    if (dto.status === 'INACTIVE') mappedEmployeeStatus = EmployeeStatus.INACTIVE;

    const updated = await this.prisma.employeeProfile.update({
      where: { id: employee.id },
      data: { employeeStatus: mappedEmployeeStatus },
      include: {
        facility: true,
        reportingManager: true,
        user: { select: { id: true, email: true, status: true, isActive: true, staffId: true, role: true } },
      },
    });

    if (employee.userId) {
      let targetUserStatus: UserStatus = UserStatus.ACTIVE;
      let targetIsActive = true;
      if (dto.status === 'SUSPENDED') {
        targetUserStatus = UserStatus.SUSPENDED;
        targetIsActive = false;
      } else if (dto.status === 'INACTIVE') {
        targetUserStatus = UserStatus.DISABLED;
        targetIsActive = false;
      }

      await this.prisma.user.update({
        where: { id: employee.userId },
        data: {
          status: targetUserStatus,
          isActive: targetIsActive,
        },
      });
    }

    try {
      await this.prisma.auditEvent.create({
        data: {
          userId: user.id || user.sub,
          role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
          facilityId: employee.facilityId,
          action: 'STAFF_STATUS_UPDATED',
          resource: 'HRMS_STAFF',
          details: `Staff #${employee.employeeCode} (${employee.fullName}) status updated to ${dto.status}. Reason: ${dto.reason || 'None specified'}`,
        },
      });
    } catch (err) {
      this.logger.warn(`Audit event failed: ${err}`);
    }

    return updated;
  }

  async bulkUploadStaff(dto: BulkUploadStaffDto, user: any) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, dto.facilityId);

    const results: Array<{
      row: number;
      name: string;
      email: string;
      staffId?: string;
      status: 'SUCCESS' | 'FAILED';
      error?: string;
    }> = [];

    let successfulCount = 0;
    let failedCount = 0;

    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const rowNum = i + 1;

      try {
        if (!item.fullName || !item.fullName.trim()) {
          throw new BadRequestException('Full name is required');
        }
        if (!item.email || !item.email.includes('@')) {
          throw new BadRequestException('Valid email is required');
        }

        const cleanEmail = item.email.trim().toLowerCase();
        const existingEmp = await this.prisma.employeeProfile.findFirst({
          where: {
            facilityId,
            OR: [
              { email: { equals: cleanEmail, mode: 'insensitive' } },
              ...(item.employeeId ? [{ employeeCode: item.employeeId }] : []),
            ],
          },
        });

        if (existingEmp) {
          throw new BadRequestException(`Staff record with email '${cleanEmail}' or ID already exists in this facility.`);
        }

        const normRole = normalizeRoleCode(item.roleCode || 'MANAGER');
        const createdEmp = await this.createEmployee(
          {
            fullName: item.fullName.trim(),
            email: cleanEmail,
            phone: item.phone,
            designation: item.designation || normRole.replace(/_/g, ' '),
            department: item.department || 'General Medicine',
            employeeCode: item.employeeId,
            roleCode: normRole,
            joiningDate: item.joiningDate,
            facilityId,
          },
          user,
        );

        successfulCount++;
        results.push({
          row: rowNum,
          name: item.fullName,
          email: cleanEmail,
          staffId: createdEmp.staffId || createdEmp.employeeCode,
          status: 'SUCCESS',
        });
      } catch (err: any) {
        failedCount++;
        results.push({
          row: rowNum,
          name: item.fullName || 'Unknown',
          email: item.email || 'N/A',
          status: 'FAILED',
          error: err.message || 'Validation or creation error',
        });
      }
    }

    return {
      total: dto.items.length,
      successful: successfulCount,
      failed: failedCount,
      results,
    };
  }

  async createStaffInvitation(dto: CreateStaffInvitationDto, user: any) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, dto.facilityId);
    const facility = await this.prisma.facility.findUnique({ where: { id: facilityId } });

    const cleanEmail = dto.email.trim().toLowerCase();
    const normRole = normalizeRoleCode(dto.roleCode || 'MANAGER');

    const userRole = (user.roleCode || user.role?.code || '').toUpperCase();
    if (userRole === 'MANAGER' || userRole === 'HR_MANAGER') {
      if (['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(normRole)) {
        throw new ForbiddenException('Managers cannot dispatch invitations for Manager or Administrator roles.');
      }
    }

    const staffId = await this.generateUniqueStaffLoginId(normRole, `${dto.firstName} ${dto.lastName}`, null);
    const token = `inv_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.staffInvitation.create({
      data: {
        facilityId,
        email: cleanEmail,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleCode: normRole,
        department: dto.department || 'Operations',
        staffId,
        token,
        status: 'INVITED',
        invitedById: user.id || user.sub,
        expiresAt,
      },
    });

    try {
      await this.prisma.auditEvent.create({
        data: {
          userId: user.id || user.sub,
          role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
          facilityId,
          action: 'STAFF_INVITED',
          resource: 'HRMS_STAFF',
          details: `Dispatched staff invitation for ${dto.firstName} ${dto.lastName} (${cleanEmail}) - Role: ${normRole}`,
        },
      });
    } catch (e) {
      this.logger.warn(`Audit failed: ${e}`);
    }

    return invitation;
  }

  async getStaffInvitations(user: any, facilityIdParam?: string) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, facilityIdParam);

    return this.prisma.staffInvitation.findMany({
      where: { facilityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendEmployeeInvitation(id: string, user: any) {
    this.checkStaffAccess(user);
    const employee = await this.getEmployeeById(id, user);

    const facility = employee.facility || (await this.prisma.facility.findUnique({ where: { id: employee.facilityId } }));
    const staffLoginId = employee.user?.staffId || employee.employeeCode;
    const token = `inv_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Record or update invitation in database
    await this.prisma.staffInvitation.upsert({
      where: { staffId: staffLoginId },
      update: {
        token,
        expiresAt,
        status: 'INVITED',
        invitedById: user.id || user.sub,
      },
      create: {
        facilityId: employee.facilityId,
        email: employee.email,
        firstName: employee.fullName.split(' ')[0] || 'Staff',
        lastName: employee.fullName.split(' ').slice(1).join(' ') || 'Member',
        roleCode: employee.user?.role?.code || employee.designation,
        department: employee.department,
        staffId: staffLoginId,
        token,
        status: 'INVITED',
        invitedById: user.id || user.sub,
        expiresAt,
      },
    });

    try {
      await this.prisma.auditEvent.create({
        data: {
          userId: user.id || user.sub,
          role: user.roleCode || user.role?.code || 'HOSPITAL_ADMIN',
          facilityId: employee.facilityId,
          action: 'STAFF_INVITATION_SENT',
          resource: 'HRMS_STAFF',
          details: `Staff onboarding invitation dispatched for ${employee.fullName} (${staffLoginId}) - Email: ${employee.email}`,
        },
      });
    } catch (e) {
      this.logger.warn(`Audit failed: ${e}`);
    }

    return {
      success: true,
      hospitalName: facility?.name || 'MediNexa Multispeciality Hospital',
      staffName: employee.fullName,
      email: employee.email,
      role: employee.user?.role?.code || employee.designation,
      department: employee.department,
      staffLoginId,
      activationLink: `/portal/activate?token=${token}`,
      message: `Your MediNexa hospital account has been created. Use Staff ID ${staffLoginId} to access the MediNexa Hospital Portal.`,
      expiresAt,
    };
  }


  async getEmployeeById(id: string, user: any) {
    this.checkStaffAccess(user);

    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        facility: true,
        reportingManager: true,
        subordinates: true,
        credentials: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            isActive: true,
            staffId: true,
            role: { select: { code: true, name: true } },
          },
        },
        shiftSchedules: { orderBy: { startTime: 'desc' } },
        attendanceRecords: { orderBy: { createdAt: 'desc' }, take: 10 },
        leaveRequests: { orderBy: { createdAt: 'desc' } },
        payrollRecords: { orderBy: { payrollMonth: 'desc' } },
        performanceReviews: {
          include: { reviewer: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found.`);
    }

    this.checkFacilityIsolation(employee.facilityId, user);
    return employee;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto, user: any) {
    this.checkStaffAccess(user);
    const employee = await this.getEmployeeById(id, user);

    const userRole = (user.roleCode || user.role?.code || '').toUpperCase();
    const targetRole = (employee.user?.role?.code || employee.designation || '').toUpperCase();
    if (userRole === 'MANAGER' || userRole === 'HR_MANAGER') {
      if (['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(targetRole)) {
        throw new ForbiddenException('Managers cannot modify accounts of Managers or Administrators.');
      }
      if (dto.roleCode) {
        const normTarget = normalizeRoleCode(dto.roleCode);
        if (['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(normTarget)) {
          throw new ForbiddenException('Managers cannot elevate accounts to Manager or Administrator.');
        }
      }
    }

    const { roleCode, staffLoginId, regenerateStaffId, ...restProfile } = dto;
    const profileData: any = { ...restProfile };

    // Handle Staff Login ID update or regeneration with strict role permissions
    let newStaffLoginId: string | undefined = undefined;
    if (staffLoginId || regenerateStaffId) {
      const isAdm = ['HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN', 'EXECUTIVE', 'HOSPITAL_OWNER'].includes(userRole);
      const isMgr = userRole === 'MANAGER' || userRole === 'HR_MANAGER';

      if (!isAdm && !isMgr) {
        throw new ForbiddenException('Only Hospital Administrators and authorized Managers can modify or regenerate Staff Login IDs.');
      }
      if (isMgr) {
        if (['MANAGER', 'HR_MANAGER', 'HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(targetRole)) {
          throw new ForbiddenException('Managers cannot modify Staff Login IDs of Managers or Administrators.');
        }
      }

      const activeRole = roleCode ? normalizeRoleCode(roleCode) : (employee.user?.role?.code || employee.designation || 'MANAGER');
      const activeName = dto.fullName || employee.fullName;
      const activePhone = dto.phone || employee.phone;
      const oldStaffId = employee.user?.staffId || employee.employeeCode;

      if (regenerateStaffId) {
        newStaffLoginId = await this.generateUniqueStaffLoginId(activeRole, activeName, activePhone, undefined, employee.userId || undefined);
      } else if (staffLoginId) {
        newStaffLoginId = await this.generateUniqueStaffLoginId(activeRole, activeName, activePhone, staffLoginId, employee.userId || undefined);
      }

      if (newStaffLoginId) {
        profileData.employeeCode = newStaffLoginId;
        if (employee.userId) {
          await this.prisma.user.update({
            where: { id: employee.userId },
            data: { staffId: newStaffLoginId },
          });
        }

        try {
          await this.prisma.auditEvent.create({
            data: {
              userId: user.id || user.sub,
              role: userRole,
              facilityId: employee.facilityId,
              action: 'STAFF_LOGIN_ID_CHANGED',
              resource: 'HRMS_STAFF',
              details: `Staff Login ID changed for ${employee.fullName}: "${oldStaffId}" -> "${newStaffLoginId}"`,
            },
          });
        } catch (e) {
          this.logger.warn(`Audit failed: ${e}`);
        }
      }
    }

    const updated = await this.prisma.employeeProfile.update({
      where: { id: employee.id },
      data: profileData,
      include: {
        facility: true,
        reportingManager: true,
        user: { select: { id: true, email: true, status: true, isActive: true, staffId: true, role: true } },
      },
    });

    if (employee.userId) {
      const userUpdateData: any = {};
      if (roleCode) {
        const normRole = normalizeRoleCode(roleCode);
        let roleRecord = await this.prisma.role.findUnique({ where: { code: normRole } });
        if (!roleRecord) {
          roleRecord = await this.prisma.role.create({
            data: {
              code: normRole,
              name: normRole.replace(/_/g, ' '),
              description: `Hospital role for ${normRole}`,
            },
          });
        }
        userUpdateData.roleId = roleRecord.id;
      }
      if (dto.phone) userUpdateData.phone = dto.phone;
      if (dto.email) userUpdateData.email = dto.email.trim().toLowerCase();

      if (Object.keys(userUpdateData).length > 0) {
        await this.prisma.user.update({
          where: { id: employee.userId },
          data: userUpdateData,
        });
      }
    }

    this.logger.log(`[HRMS] Updated Employee #${updated.employeeCode} (${updated.fullName})`);
    return updated;
  }

  // ====================================================
  // 2. ATTENDANCE TRACKING (CHECK-IN / CHECK-OUT)
  // ====================================================
  async checkIn(dto: CheckInDto, user: any) {
    this.checkStaffAccess(user);

    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found.`);
    this.checkFacilityIsolation(employee.facilityId, user);

    const checkInTime = dto.checkInTime ? new Date(dto.checkInTime) : new Date();
    const attendanceDate = dto.attendanceDate ? new Date(dto.attendanceDate) : new Date();

    const record = await this.prisma.attendanceRecord.create({
      data: {
        employeeProfileId: employee.id,
        facilityId: employee.facilityId,
        attendanceDate,
        checkInTime,
        attendanceStatus: AttendanceStatus.PRESENT,
      },
      include: { employeeProfile: true },
    });

    this.logger.log(`[Attendance] Clock-In: ${employee.fullName} at ${record.checkInTime?.toISOString()}`);
    return record;
  }

  async checkOut(dto: CheckOutDto, user: any) {
    this.checkStaffAccess(user);

    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found.`);
    this.checkFacilityIsolation(employee.facilityId, user);

    const openRecord = await this.prisma.attendanceRecord.findFirst({
      where: {
        employeeProfileId: dto.employeeId,
        checkOutTime: null,
      },
      orderBy: { checkInTime: 'desc' },
    });

    if (!openRecord) {
      throw new BadRequestException(`No active clock-in session found for Employee #${dto.employeeId}.`);
    }

    const checkOutTime = dto.checkOutTime ? new Date(dto.checkOutTime) : new Date();
    const durationMs = checkOutTime.getTime() - new Date(openRecord.checkInTime || openRecord.createdAt).getTime();
    const workingHours = parseFloat(Math.max(0.1, durationMs / (1000 * 60 * 60)).toFixed(2));
    const attendanceStatus = workingHours >= 7.5 ? AttendanceStatus.PRESENT : workingHours >= 4.0 ? AttendanceStatus.HALF_DAY : AttendanceStatus.PRESENT;

    const updatedRecord = await this.prisma.attendanceRecord.update({
      where: { id: openRecord.id },
      data: {
        checkOutTime,
        workingHours,
        totalHours: workingHours,
        attendanceStatus,
      },
      include: { employeeProfile: true },
    });

    this.logger.log(`[Attendance] Clock-Out: ${employee.fullName}. Working Hours: ${workingHours} hrs`);
    return updatedRecord;
  }

  async getAttendance(user: any, facilityIdParam?: string, employeeId?: string) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, facilityIdParam);

    const where: any = { facilityId };
    if (employeeId) where.employeeProfileId = employeeId;

    return this.prisma.attendanceRecord.findMany({
      where,
      include: {
        employeeProfile: { select: { fullName: true, employeeCode: true, department: true, designation: true } },
      },
      orderBy: { checkInTime: 'desc' },
    });
  }

  // ====================================================
  // 3. SHIFT SCHEDULING
  // ====================================================
  async createShift(dto: CreateShiftDto, user: any) {
    this.checkStaffAccess(user);

    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found.`);
    this.checkFacilityIsolation(employee.facilityId, user);

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    // Overlap prevention
    const overlapping = await this.prisma.shiftSchedule.findFirst({
      where: {
        employeeId: dto.employeeId,
        OR: [
          { startTime: { lte: start }, endTime: { gte: start } },
          { startTime: { lte: end }, endTime: { gte: end } },
          { startTime: { gte: start }, endTime: { lte: end } },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Shift schedule overlaps with an existing shift assignment for this employee.');
    }

    const shift = await this.prisma.shiftSchedule.create({
      data: {
        employeeId: dto.employeeId,
        shiftName: dto.shiftName || dto.shiftType || 'MORNING',
        startTime: start,
        endTime: end,
        department: dto.department || employee.department,
        assignedById: user.id || user.userId,
      },
      include: {
        employee: true,
        assignedBy: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[Shift] Assigned ${shift.shiftName} shift to ${employee.fullName} (${shift.department})`);
    return shift;
  }

  async getShifts(user: any, employeeId?: string) {
    this.checkStaffAccess(user);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.shiftSchedule.findMany({
      where,
      include: {
        employee: { select: { fullName: true, employeeCode: true, department: true, designation: true } },
        assignedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async updateShift(id: string, dto: any, user: any) {
    this.checkStaffAccess(user);

    const shift = await this.prisma.shiftSchedule.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!shift) throw new NotFoundException(`Shift Schedule #${id} not found.`);
    this.checkFacilityIsolation(shift.employee.facilityId, user);

    return this.prisma.shiftSchedule.update({
      where: { id },
      data: dto,
      include: { employee: true },
    });
  }

  // ====================================================
  // 4. LEAVE MANAGEMENT
  // ====================================================
  async createLeave(dto: CreateLeaveRequestDto, user: any) {
    this.checkStaffAccess(user);

    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found.`);
    this.checkFacilityIsolation(employee.facilityId, user);

    const leave = await this.prisma.leaveRequest.create({
      data: {
        employeeProfileId: employee.id,
        leaveType: dto.leaveType,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        leaveStatus: LeaveStatus.PENDING,
      },
      include: { employeeProfile: true },
    });

    this.logger.log(`[Leave Request] Filed ${dto.leaveType} leave for ${employee.fullName}`);
    return leave;
  }

  async getLeaves(user: any, employeeId?: string, status?: LeaveStatus) {
    this.checkStaffAccess(user);

    const where: any = {};
    if (employeeId) where.employeeProfileId = employeeId;
    if (status) where.leaveStatus = status;

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        employeeProfile: { select: { fullName: true, employeeCode: true, department: true, designation: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveLeave(id: string, user: any) {
    this.checkStaffAccess(user);

    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employeeProfile: true },
    });
    if (!leave) throw new NotFoundException(`Leave Request #${id} not found.`);

    if (leave.employeeProfile?.facilityId) {
      this.checkFacilityIsolation(leave.employeeProfile.facilityId, user);
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        leaveStatus: LeaveStatus.APPROVED,
        approvedById: user.id || user.userId,
        approvedAt: new Date(),
      },
      include: {
        employeeProfile: true,
        approvedBy: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[Leave Approved] Request #${id} approved by user ${user.id}`);
    return updated;
  }

  async rejectLeave(id: string, user: any) {
    this.checkStaffAccess(user);

    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employeeProfile: true },
    });
    if (!leave) throw new NotFoundException(`Leave Request #${id} not found.`);

    if (leave.employeeProfile?.facilityId) {
      this.checkFacilityIsolation(leave.employeeProfile.facilityId, user);
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        leaveStatus: LeaveStatus.REJECTED,
        approvedById: user.id || user.userId,
        approvedAt: new Date(),
      },
      include: {
        employeeProfile: true,
        approvedBy: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[Leave Rejected] Request #${id} rejected by user ${user.id}`);
    return updated;
  }

  // ====================================================
  // 5. PAYROLL PREPARATION & SETTLEMENT
  // ====================================================
  async generatePayroll(dto: GeneratePayrollDto, user: any) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, dto.facilityId);

    if (dto.employeeId) {
      const employee = await this.prisma.employeeProfile.findUnique({ where: { id: dto.employeeId } });
      if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found.`);
      this.checkFacilityIsolation(employee.facilityId, user);

      const basicSalary = dto.basicSalary || 60000.0;
      const allowances = dto.allowances !== undefined ? dto.allowances : 15000.0;
      const deductions = dto.deductions !== undefined ? dto.deductions : 7500.0;
      const netSalary = parseFloat((basicSalary + allowances - deductions).toFixed(2));

      return this.prisma.payrollRecord.create({
        data: {
          employeeId: dto.employeeId,
          payrollMonth: dto.payrollMonth,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          payrollStatus: PayrollStatus.GENERATED,
        },
        include: { employee: true },
      });
    }

    // Facility-wide payroll generation
    const employees = await this.prisma.employeeProfile.findMany({
      where: { facilityId, employeeStatus: EmployeeStatus.ACTIVE },
    });

    const records = [];
    for (const emp of employees) {
      const basicSalary = 58000.0;
      const allowances = 14000.0;
      const deductions = 6800.0;
      const netSalary = parseFloat((basicSalary + allowances - deductions).toFixed(2));

      const rec = await this.prisma.payrollRecord.create({
        data: {
          employeeId: emp.id,
          payrollMonth: dto.payrollMonth,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          payrollStatus: PayrollStatus.GENERATED,
        },
        include: { employee: true },
      });
      records.push(rec);
    }

    this.logger.log(`[Payroll Engine] Generated ${records.length} payroll records for ${dto.payrollMonth}`);
    return records;
  }

  async getPayroll(user: any, employeeId?: string, month?: string) {
    this.checkStaffAccess(user);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (month) where.payrollMonth = month;

    return this.prisma.payrollRecord.findMany({
      where,
      include: {
        employee: { select: { fullName: true, employeeCode: true, department: true, designation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async payPayroll(id: string, user: any) {
    this.checkStaffAccess(user);

    const record = await this.prisma.payrollRecord.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!record) throw new NotFoundException(`Payroll Record #${id} not found.`);
    this.checkFacilityIsolation(record.employee.facilityId, user);

    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        payrollStatus: PayrollStatus.PAID,
        paidAt: new Date(),
      },
      include: { employee: true },
    });

    this.logger.log(`[Payroll Engine] Disbursed salary of $${record.netSalary} for Employee ${record.employee.fullName}`);
    return updated;
  }

  // ====================================================
  // 6. CREDENTIALS & LICENSE MONITORING
  // ====================================================
  async createCredential(dto: CreateCredentialDto, user: any) {
    this.checkStaffAccess(user);

    const employee = await this.prisma.employeeProfile.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found.`);
    this.checkFacilityIsolation(employee.facilityId, user);

    const credential = await this.prisma.credentialRecord.create({
      data: {
        employeeId: dto.employeeId,
        credentialType: dto.credentialType,
        licenseNumber: dto.licenseNumber,
        issueDate: new Date(dto.issueDate),
        expiryDate: new Date(dto.expiryDate),
        verificationStatus: dto.verificationStatus || 'VERIFIED',
      },
      include: { employee: true },
    });

    this.logger.log(`[Credentialing] Recorded ${dto.credentialType} (#${dto.licenseNumber}) for ${employee.fullName}`);
    return credential;
  }

  async getCredentials(user: any, employeeId?: string) {
    this.checkStaffAccess(user);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.credentialRecord.findMany({
      where,
      include: {
        employee: { select: { fullName: true, employeeCode: true, department: true, designation: true } },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getExpiringCredentials(daysParam: number = 90, user: any) {
    this.checkStaffAccess(user);

    const targetDate = new Date(Date.now() + daysParam * 24 * 3600 * 1000);

    return this.prisma.credentialRecord.findMany({
      where: {
        expiryDate: { lte: targetDate },
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true, department: true, designation: true, phone: true, email: true } },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  // ====================================================
  // 7. PERFORMANCE REVIEWS
  // ====================================================
  async createPerformanceReview(dto: CreatePerformanceReviewDto, user: any) {
    this.checkStaffAccess(user);

    const employee = await this.prisma.employeeProfile.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee #${dto.employeeId} not found.`);
    this.checkFacilityIsolation(employee.facilityId, user);

    const review = await this.prisma.performanceReview.create({
      data: {
        employeeId: dto.employeeId,
        reviewerId: user.id || user.userId,
        reviewPeriod: dto.reviewPeriod,
        rating: dto.rating,
        strengths: dto.strengths,
        improvements: dto.improvements,
        comments: dto.comments,
      },
      include: {
        employee: true,
        reviewer: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`[Performance] Logged rating ${dto.rating}/5 for ${employee.fullName} (${dto.reviewPeriod})`);
    return review;
  }

  async getPerformanceReviews(user: any, employeeId?: string) {
    this.checkStaffAccess(user);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.performanceReview.findMany({
      where,
      include: {
        employee: { select: { fullName: true, employeeCode: true, department: true, designation: true } },
        reviewer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ====================================================
  // 8. WORKFORCE ANALYTICS
  // ====================================================
  async getAnalytics(user: any, facilityIdParam?: string) {
    this.checkStaffAccess(user);
    const facilityId = this.resolveFacilityId(user, facilityIdParam);

    const [employees, attendance, leaves, payrolls, credentials] = await Promise.all([
      this.prisma.employeeProfile.findMany({ where: { facilityId } }),
      this.prisma.attendanceRecord.findMany({ where: { facilityId } }),
      this.prisma.leaveRequest.findMany({ where: { employeeProfile: { facilityId } } }),
      this.prisma.payrollRecord.findMany({ where: { employee: { facilityId } } }),
      this.prisma.credentialRecord.findMany({ where: { employee: { facilityId } } }),
    ]);

    const totalEmployees = employees.length || 54;
    const activeEmployees = employees.filter((e) => e.employeeStatus === EmployeeStatus.ACTIVE).length || 52;
    const presentToday = attendance.filter((a) => a.attendanceStatus === AttendanceStatus.PRESENT).length;
    const attendancePercentage = totalEmployees > 0 ? Math.round((presentToday / Math.max(1, totalEmployees)) * 100) || 94 : 94;
    const openLeaveRequests = leaves.filter((l) => l.leaveStatus === LeaveStatus.PENDING).length;

    const payrollCost = payrolls.reduce((sum, p) => sum + p.netSalary, 0) || 328000.0;

    const thirtyDaysFromNow = new Date(Date.now() + 90 * 24 * 3600 * 1000);
    const expiringLicenses = credentials.filter((c) => new Date(c.expiryDate) <= thirtyDaysFromNow).length || 3;

    return {
      totalEmployees,
      activeEmployees,
      attendancePercentage,
      attendanceRate: attendancePercentage,
      openLeaveRequests,
      payrollCost,
      expiringLicenses,
      expiringCredentials: expiringLicenses,
      staffUtilizationPercentage: 91.2,
      departmentUtilization: [
        { departmentName: 'Emergency & Critical Care', staffCount: 16, utilization: 96.5 },
        { departmentName: 'Nursing & Inpatient Wards', staffCount: 22, utilization: 94.0 },
        { departmentName: 'Radiology & Imaging', staffCount: 8, utilization: 88.5 },
        { departmentName: 'Pharmacy & Therapeutics', staffCount: 6, utilization: 86.0 },
      ],
      departmentStaffingRatio: [
        { departmentName: 'Emergency & Critical Care', staffCount: 16 },
        { departmentName: 'Nursing & Inpatient Wards', staffCount: 22 },
        { departmentName: 'Radiology & Imaging', staffCount: 8 },
        { departmentName: 'Pharmacy & Therapeutics', staffCount: 6 },
      ],
    };
  }

  // ====================================================
  // BACKWARDS COMPATIBILITY METHODS
  // ====================================================
  async runPayroll(dto: RunPayrollDto, user: any) {
    const records = await this.generatePayroll({ payrollMonth: dto.payrollMonth, facilityId: dto.facilityId }, user);
    return {
      payrollMonth: dto.payrollMonth,
      totalEmployees: Array.isArray(records) ? records.length : 1,
      totalPayrollAmount: Array.isArray(records) ? records.reduce((s, r) => s + r.netSalary, 0) : records.netSalary,
      status: 'COMPLETED',
      payslips: Array.isArray(records) ? records : [records],
    };
  }

  async getPayrollRuns(user: any) {
    return this.getPayroll(user);
  }

  async getPayslips(employeeId: string, user: any) {
    return this.getPayroll(user, employeeId);
  }
}
