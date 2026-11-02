const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mirror of validation utilities
function getRolePrefix(roleCode) {
  const r = (roleCode || '').toUpperCase().trim();
  if (r === 'DOCTOR') return 'DR';
  if (r === 'NURSE') return 'NR';
  if (r === 'RECEPTIONIST') return 'RC';
  if (r.includes('PHARMAC')) return 'PH';
  if (r.includes('LAB')) return 'LT';
  if (r.includes('BILLING')) return 'BL';
  if (r.includes('AMBULANCE') || r.includes('EMS')) return 'AM';
  if (r === 'MANAGER' || r === 'HR_MANAGER' || r === 'HR') return 'MG';
  if (r === 'RADIOLOGIST') return 'RD';
  if (r === 'WARD_MANAGER') return 'WM';
  if (r.includes('EMERGENCY') || r === 'TRIAGE_NURSE') return 'ER';
  if (r.includes('INSURANCE')) return 'IN';
  if (r.includes('ADMIN') || r === 'EXECUTIVE' || r === 'HOSPITAL_OWNER') return 'AD';
  return 'ST';
}

function normalizeStaffName(name) {
  if (!name || typeof name !== 'string') return 'STAFF';
  let cleaned = name.trim().replace(/^(dr\.|dr|doctor|sister|sr\.|nurse|mr\.|mr|mrs\.|mrs|ms\.|ms|prof\.|prof)\s+/i, '');
  const firstWord = cleaned.split(/\s+/)[0] || 'STAFF';
  const normalized = firstWord.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return normalized || 'STAFF';
}

function normalizeLast4Digits(phone) {
  if (!phone) return '0001';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);
  if (digits.length > 0) return digits.padStart(4, '0');
  return '0001';
}

function generateStaffLoginId(roleCode, fullName, phone) {
  const prefix = getRolePrefix(roleCode);
  const name = normalizeStaffName(fullName);
  const last4 = normalizeLast4Digits(phone);
  return `${prefix}.${name}-${last4}`;
}

async function generateUniqueStaffLoginId(roleCode, fullName, phone, excludeUserId) {
  const baseId = generateStaffLoginId(roleCode, fullName, phone);
  const existing = await prisma.user.findFirst({
    where: {
      staffId: { equals: baseId, mode: 'insensitive' },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });

  if (!existing) return baseId;

  for (let i = 1; i <= 99; i++) {
    const candidate = `${baseId}-${String(i).padStart(2, '0')}`;
    const collision = await prisma.user.findFirst({
      where: {
        staffId: { equals: candidate, mode: 'insensitive' },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });
    if (!collision) return candidate;
  }
  return `${baseId}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function migrate() {
  console.log('--- MIGRATING EXISTING HOSPITAL STAFF TO ROLE-BASED STAFF LOGIN IDS ---');
  
  const staffUsers = await prisma.user.findMany({
    where: {
      role: { code: { not: 'PATIENT' } },
    },
    include: {
      role: true,
      staffProfile: true,
      facility: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${staffUsers.length} hospital staff users to verify/migrate.\n`);

  for (const u of staffUsers) {
    const roleCode = u.role?.code || 'MANAGER';
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Staff Member';
    const phone = u.phone || u.staffProfile?.phone || null;

    let targetId = u.staffId;
    if (!targetId || !targetId.includes('.')) {
      targetId = await generateUniqueStaffLoginId(roleCode, fullName, phone, u.id);
      
      await prisma.user.update({
        where: { id: u.id },
        data: { staffId: targetId },
      });

      // Also ensure employeeProfile exists and has matching employeeCode
      if (u.staffProfile) {
        await prisma.employeeProfile.update({
          where: { id: u.staffProfile.id },
          data: { employeeCode: targetId },
        });
      } else if (u.facilityId) {
        // Create matching EmployeeProfile if missing for this staff user
        await prisma.employeeProfile.create({
          data: {
            facilityId: u.facilityId,
            userId: u.id,
            employeeCode: targetId,
            fullName,
            department: 'Hospital Administration',
            designation: roleCode.replace(/_/g, ' '),
            phone: phone || '+91 99990 00000',
            email: u.email,
          },
        }).catch(err => console.warn(`Could not create profile for ${u.email}:`, err.message));
      }

      console.log(`[MIGRATED] ${fullName} (${roleCode}) -> Staff Login ID: ${targetId} | Email: ${u.email}`);
    } else {
      console.log(`[ALREADY SET] ${fullName} (${roleCode}) -> Staff Login ID: ${targetId} | Email: ${u.email}`);
    }
  }

  console.log('\n--- Migration finished successfully! ---');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
