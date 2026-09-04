const { PrismaClient, UserStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function ensureAdmins() {
  const hash = bcrypt.hashSync('Medinexa@2026', 10);
  const facility = await prisma.facility.findFirst();
  const org = await prisma.organization.findFirst();

  // Roles
  let superAdminRole = await prisma.role.findFirst({ where: { code: 'SUPER_ADMIN' } });
  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: { code: 'SUPER_ADMIN', name: 'SUPER ADMIN', description: 'Global Super Administrator' },
    });
  }

  let hospAdminRole = await prisma.role.findFirst({ where: { code: 'HOSPITAL_ADMIN' } });

  // 1. superadmin@medinexa.in
  await prisma.user.upsert({
    where: { email: 'superadmin@medinexa.in' },
    update: { passwordHash: hash, roleId: superAdminRole.id },
    create: {
      email: 'superadmin@medinexa.in',
      passwordHash: hash,
      firstName: 'Vikram',
      lastName: 'Malhotra',
      phone: '+91 98101 10001',
      status: UserStatus.ACTIVE,
      roleId: superAdminRole.id,
      organizationId: org.id,
      facilityId: facility.id,
    },
  });

  // 2. admin@medinexa.in
  await prisma.user.upsert({
    where: { email: 'admin@medinexa.in' },
    update: { passwordHash: hash, roleId: hospAdminRole.id },
    create: {
      email: 'admin@medinexa.in',
      passwordHash: hash,
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      phone: '+91 98101 10002',
      status: UserStatus.ACTIVE,
      roleId: hospAdminRole.id,
      organizationId: org.id,
      facilityId: facility.id,
    },
  });

  // 3. Ensure patient arjun.nair@gmail.com exists
  let patRole = await prisma.role.findFirst({ where: { code: 'PATIENT' } });
  const arjunUser = await prisma.user.upsert({
    where: { email: 'arjun.nair@gmail.com' },
    update: { passwordHash: hash, roleId: patRole.id },
    create: {
      email: 'arjun.nair@gmail.com',
      passwordHash: hash,
      firstName: 'Arjun',
      lastName: 'Nair',
      phone: '+91 98101 20000',
      status: UserStatus.ACTIVE,
      roleId: patRole.id,
      organizationId: org.id,
      facilityId: facility.id,
    },
  });

  const existingProfile = await prisma.patientProfile.findUnique({
    where: { userId: arjunUser.id },
  });
  if (!existingProfile) {
    await prisma.patientProfile.create({
      data: {
        userId: arjunUser.id,
        gender: 'MALE',
        dateOfBirth: new Date('1992-05-14'),
        bloodGroup: 'O_POSITIVE',
        address: 'UHID: UHID-2026-100101 | Flat 402, Prateek Fedora, Sector 120, Noida - 201301',
        phone: '+91 98101 20000',
      },
    });
  }

  // Update all users password to Medinexa@2026
  await prisma.user.updateMany({
    data: { passwordHash: hash },
  });

  console.log('✅ Admins & all user passwords verified to Medinexa@2026.');
  await prisma.$disconnect();
}

ensureAdmins().catch(console.error);
