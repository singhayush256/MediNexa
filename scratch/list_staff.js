const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function listStaff() {
  const staff = await prisma.user.findMany({
    where: { email: { contains: '@medinexa.in' } },
    include: { role: true },
  });
  console.log(`Found ${staff.length} staff members with @medinexa.in:`);
  for (const s of staff) {
    console.log(`- ${s.email} | Role: ${s.role?.code} | Name: ${s.firstName} ${s.lastName}`);
  }
  await prisma.$disconnect();
}
listStaff();
