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
  if (r === 'LAB_TECHNICIAN' || r === 'LAB TECHNICIAN') return 'LAB_STAFF';
  if (r === 'EMS_OPERATOR') return 'AMBULANCE_DRIVER';
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
  const privilegedRoles = ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'];
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

