/**
 * MediNexa Core Validation Utilities (Day 2 Monorepo Shared Package)
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function isStrongPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 6;
}

export function normalizeRoleCode(role: string): string {
  const r = (role || '').toUpperCase().trim();
  if (r === 'ADMIN') return 'HOSPITAL_ADMIN';
  if (r === 'SUPER_ADMIN') return 'MEDINEXA_ADMIN';
  if (r === 'PHARMACIST') return 'PHARMACY_STAFF';
  if (r === 'LAB_TECHNICIAN' || r === 'LAB TECHNICIAN' || r === 'LAB_TECH') return 'LAB_STAFF';
  if (r === 'EMS_OPERATOR' || r === 'AMBULANCE_STAFF') return 'AMBULANCE_DRIVER';
  if (r === 'HOSPITAL_OWNER') return 'EXECUTIVE';
  if (r === 'TRIAGE_NURSE') return 'EMERGENCY_STAFF';
  if (r === 'HR_MANAGER' || r === 'HR') return 'MANAGER';
  if (r === 'MANAGER') return 'MANAGER';
  return r;
}

export function isRoleAuthorized(userRole: string, allowedRoles: string[]): boolean {
  const normUserRole = normalizeRoleCode(userRole);
  return allowedRoles.some((allowed) => {
    const normAllowed = normalizeRoleCode(allowed);
    return normAllowed === normUserRole || allowed === userRole || allowed === normUserRole;
  });
}

export function isPrivilegedRole(roleCode: string): boolean {
  const privilegedRoles = ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'EXECUTIVE', 'HOSPITAL_OWNER'];
  return privilegedRoles.includes(normalizeRoleCode(roleCode));
}

export function isValidTimeString(time: string): boolean {
  return typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function isValidDateString(dateStr: string): boolean {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
}

export function isValidCoordinates(lat: number, lon: number): boolean {
  return typeof lat === 'number' && lat >= -90 && lat <= 90 && typeof lon === 'number' && lon >= -180 && lon <= 180;
}

// ====================================================
// ROLE-BASED STAFF LOGIN ID UTILITIES
// ====================================================

/**
 * Returns canonical 2-character prefix for every hospital role.
 * Standard format: ROLE_PREFIX.FIRSTNAME-LAST4MOBILE
 */
export function getRolePrefix(roleCode: string): string {
  const r = (roleCode || '').toUpperCase().trim();
  if (r === 'DOCTOR') return 'DR';
  if (r === 'NURSE') return 'NR';
  if (r === 'RECEPTIONIST') return 'RC';
  if (r.includes('PHARMAC')) return 'PH';
  if (r.includes('LAB')) return 'LT'; // Lab Technician -> LT
  if (r.includes('BILLING')) return 'BL';
  if (r.includes('AMBULANCE') || r.includes('EMS') || r === 'PARAMEDIC') return 'AM';
  if (r === 'MANAGER' || r === 'HR_MANAGER' || r === 'HR') return 'MG';
  if (r === 'RADIOLOGIST') return 'RD';
  if (r === 'WARD_MANAGER') return 'WM';
  if (r.includes('EMERGENCY') || r === 'TRIAGE_NURSE') return 'ER';
  if (r.includes('INSURANCE')) return 'IN';
  if (r === 'HOSPITAL_ADMIN') return 'HA';
  if (r.includes('ADMIN') || r === 'EXECUTIVE' || r === 'HOSPITAL_OWNER') return 'AD';
  return 'ST'; // Staff fallback
}

/**
 * Extracts and normalizes the first name for the Staff Login ID.
 * Strips titles like Dr., Sister, Mr., Mrs. (with or without space) and removes special characters.
 */
export function normalizeStaffName(name: string): string {
  if (!name || typeof name !== 'string') return 'STAFF';

  // Remove common professional and honorific prefixes with optional space or period
  let cleaned = name.trim().replace(/^(dr\.|dr|doctor|sister|sr\.|nurse|mr\.|mr|mrs\.|mrs|ms\.|ms|prof\.|prof)[\s.]*/i, '');

  // Extract first word only
  const firstWord = cleaned.trim().split(/\s+/)[0] || 'STAFF';

  // Keep only uppercase alphanumeric characters
  const normalized = firstWord.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return normalized || 'STAFF';
}

/**
 * Extracts the last 4 digits of a phone/mobile number.
 */
export function normalizeLast4Digits(phone?: string | null): string {
  if (!phone) return '0001';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  if (digits.length > 0) {
    return digits.padStart(4, '0');
  }
  return '0001';
}

/**
 * Generates the standardized base Staff Login ID:
 * ROLE_PREFIX.FIRSTNAME-LAST4MOBILE (e.g. DR.AYUSH-0263)
 */
export function generateStaffLoginId(roleCode: string, fullName: string, phone?: string | null): string {
  const prefix = getRolePrefix(roleCode);
  const name = normalizeStaffName(fullName);
  const last4 = normalizeLast4Digits(phone);
  return `${prefix}.${name}-${last4}`;
}

/**
 * Validates whether a custom or edited Staff Login ID complies with MediNexa security standards.
 * Allowed: uppercase letters, digits, dots, hyphens (e.g. DR.AYUSH-0263 or DR.AYUSH-CARDIO-0263).
 */
export function isValidStaffLoginId(staffId: string): boolean {
  if (!staffId || typeof staffId !== 'string') return false;
  const trimmed = staffId.trim().toUpperCase();

  // Prevent dangerous or reserved keywords across any segment (Section 34)
  const reserved = ['SUPERADMIN', 'SYSTEM', 'ROOT', 'ADMINISTRATOR', 'MEDINEXA'];
  const segments = trimmed.replace(/\./g, '-').split('-');
  if (segments.some((seg) => reserved.includes(seg))) return false;

  // Format: PREFIX.SEGMENT-SEGMENT[-SUFFIX]
  // Minimum 5 chars, max 40 chars
  const regex = /^[A-Z]{2,4}\.[A-Z0-9]+(-[A-Z0-9]+)+$/;
  return regex.test(trimmed) && trimmed.length >= 5 && trimmed.length <= 40;
}

// ====================================================
// GLOBAL PATIENT UHID & HOSPITAL MRN UTILITIES
// ====================================================

/**
 * Validates whether a UHID complies with MediNexa permanent canonical identifier standards.
 * Allowed formats:
 * - MNX-XXXXXX (e.g. MNX-000001, MNX-104921)
 * - UHID-YYYY-XXXXXX (e.g. UHID-2026-001001, UHID-2026-104921)
 */
export function isValidUhid(uhid: string): boolean {
  if (!uhid || typeof uhid !== 'string') return false;
  const clean = uhid.trim().toUpperCase();
  return /^MNX-\d{6}$/.test(clean) || /^UHID-\d{4}-\d{4,8}$/.test(clean);
}

/**
 * Generates a permanent canonical MediNexa Global UHID.
 * Once created, this UHID never changes for the patient across any hospital or facility.
 * Default format: MNX-XXXXXX
 */
export function generateCanonicalUhid(counter?: number): string {
  if (typeof counter === 'number' && counter > 0) {
    return `MNX-${String(counter).padStart(6, '0')}`;
  }
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `MNX-${randomNum}`;
}

/**
 * Normalizes hospital/facility identifier for local MRN generation.
 * (e.g. 'HOSPITAL_A' -> 'A', 'HOSPITAL_B' -> 'B', 'DELHI' -> 'DELHI')
 */
export function normalizeHospitalCode(facilityIdOrCode: string): string {
  if (!facilityIdOrCode || typeof facilityIdOrCode !== 'string') return 'A';
  const clean = facilityIdOrCode.toUpperCase().trim();
  if (clean.includes('HOSPITAL_A') || clean === 'FAC-HOSPITAL-A' || clean === 'HOSPITALA' || clean === 'A') return 'A';
  if (clean.includes('HOSPITAL_B') || clean === 'FAC-HOSPITAL-B' || clean === 'HOSPITALB' || clean === 'B') return 'B';
  const alphanumeric = clean.replace(/[^A-Z0-9]/g, '');
  return alphanumeric.length > 5 ? alphanumeric.slice(0, 4) : alphanumeric || 'A';
}

/**
 * Generates a unique Hospital Medical Record Number (MRN).
 * Format: HOS-{HOSPITAL_CODE}-{00000} (e.g. HOS-A-00045, HOS-B-00021)
 */
export function generateHospitalMrn(facilityIdOrCode: string, counter?: number): string {
  const code = normalizeHospitalCode(facilityIdOrCode);
  const num = typeof counter === 'number' && counter > 0
    ? String(counter).padStart(5, '0')
    : String(Math.floor(10000 + Math.random() * 90000));
  return `HOS-${code}-${num}`;
}

/**
 * Validates whether an MRN complies with hospital registration standards.
 * Allowed formats: HOS-CODE-XXXXX or MRN-CODE-XXXXX
 */
export function isValidHospitalMrn(mrn: string): boolean {
  if (!mrn || typeof mrn !== 'string') return false;
  const clean = mrn.trim().toUpperCase();
  return /^(HOS|MRN)-[A-Z0-9]{1,8}-\d{4,8}$/.test(clean);
}

// ====================================================
// MEDICINE COMMUNICATION & SCORE OVERRIDE HELPERS
// ====================================================

export const VALID_COMMUNICATION_REASONS = [
  'NO_MOBILE_PHONE',
  'NO_USABLE_NOTIFICATION_CHANNEL',
  'PATIENT_REQUESTED_OFF',
  'CAREGIVER_MANAGED',
  'OTHER',
] as const;

export function isCommunicationReasonValid(reason?: string | null): boolean {
  if (!reason) return true; // Optional if enabling
  const clean = reason.trim().toUpperCase();
  return VALID_COMMUNICATION_REASONS.includes(clean as any);
}

export function getCommunicationStatusExplanation(
  enabled: boolean,
  hasMobile: boolean,
  reason?: string | null,
): string {
  if (enabled) {
    return 'Medicine communication and notifications are active. Medication adherence scoring reflects real-time administration confirmations.';
  }

  if (!hasMobile || reason === 'NO_MOBILE_PHONE') {
    return 'Medicine communication is disabled because the patient does not have a usable mobile/notification channel. Medicine adherence score will not be negatively affected by notification unavailability.';
  }

  if (reason === 'NO_USABLE_NOTIFICATION_CHANNEL') {
    return 'Medicine communication is disabled due to notification channel unavailability. Adherence score is protected from communication-related deductions.';
  }

  if (reason === 'CAREGIVER_MANAGED') {
    return 'Medications are managed directly by a bedside caregiver or nurse. Patient notifications are disabled and the medicine score is protected.';
  }

  if (reason === 'PATIENT_REQUESTED_OFF') {
    return 'Medicine communication was paused at the patient’s direct request. Adherence scoring is protected from notification penalties.';
  }

  return 'Medicine communication is disabled. Medicine adherence score is protected from notification-based penalties.';
}




