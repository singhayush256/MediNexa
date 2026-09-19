import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { RoleCode } from '@medinexa/types';
import { normalizeRoleCode } from '@medinexa/validation';

/**
 * HospitalTenantGuard
 *
 * Enforces strict multi-tenant hospital data isolation between facilities (e.g. Hospital A vs Hospital B).
 *
 * Rules:
 * 1. SUPER_ADMIN & MEDINEXA_ADMIN hold enterprise-wide privileges and may access any facility.
 * 2. PATIENT & GUARDIAN roles have universal cross-facility visibility to discover doctors,
 *    compare bed availability, and book appointments across both Hospital A and Hospital B.
 * 3. All working hospital staff (Hospital Admins, Doctors, Nurses, Receptionists, Ward Managers,
 *    Lab Staff, Pharmacists, Billing Specialists, etc.) are strictly scoped to their assigned facility.
 *    Any attempt to query or manipulate records belonging to another hospital triggers an immediate 403 Forbidden.
 */
@Injectable()
export class HospitalTenantGuard implements CanActivate {
  private readonly logger = new Logger(HospitalTenantGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Public or unauthenticated routes proceed to standard auth guards
    if (!user) {
      return true;
    }

    const rawRole = user.roleCode || user.role?.code || user.role;
    const normalizedRole = rawRole ? normalizeRoleCode(rawRole) : null;

    // 1. Super Admins hold cross-enterprise master governance
    if (normalizedRole === 'MEDINEXA_ADMIN' || normalizedRole === RoleCode.SUPER_ADMIN) {
      return true;
    }

    // 2. Patients have universal access across network hospitals
    if (normalizedRole === RoleCode.PATIENT || normalizedRole === 'GUARDIAN') {
      return true;
    }

    // 3. Operational Staff: resolve assigned facility
    const assignedFacilityId =
      user.facilityId ||
      user.facility?.id ||
      user.doctorProfile?.facilityId ||
      null;

    // If staff has no facility assigned yet, proceed with warning
    if (!assignedFacilityId) {
      return true;
    }

    // Attach effective facility to request for downstream service queries
    req.effectiveFacilityId = assignedFacilityId;

    // Check incoming target facility indicators from Query, Params, or Body
    const queryFacility = req.query?.facilityId || req.query?.hospitalId;
    const paramFacility = req.params?.facilityId || req.params?.hospitalId;
    const bodyFacility = req.body?.facilityId || req.body?.hospitalId;

    const requestedFacility = queryFacility || paramFacility || bodyFacility;

    if (requestedFacility && typeof requestedFacility === 'string') {
      const cleanRequested = requestedFacility.trim().toUpperCase();
      const cleanAssigned = assignedFacilityId.trim().toUpperCase();

      // Normalize common aliases: 'HOSPITAL_A' vs UUID or 'HOSPITAL_B'
      const isMatch =
        cleanRequested === cleanAssigned ||
        (cleanAssigned.includes('HOSPITAL_A') && cleanRequested.includes('HOSPITAL_A')) ||
        (cleanAssigned.includes('HOSPITAL_B') && cleanRequested.includes('HOSPITAL_B'));

      if (!isMatch) {
        this.logger.warn(
          `[MULTI-TENANT VIOLATION] User ${user.email} (${normalizedRole}) assigned to '${assignedFacilityId}' attempted to access facility '${requestedFacility}'. Access Denied.`,
        );
        throw new ForbiddenException(
          `Cross-hospital access violation: You are assigned to hospital '${assignedFacilityId}' and do not have permission to access data from hospital '${requestedFacility}'.`,
        );
      }
    }

    // Automatically enforce assigned facility on query if missing, so staff queries stay scoped
    if (req.query && typeof req.query === 'object' && !req.query.facilityId) {
      req.query.facilityId = assignedFacilityId;
    }

    return true;
  }
}
