const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectAdmin() {
  const u = await prisma.user.findUnique({
    where: { email: 'admin@medinexa.local' },
    include: { role: true },
  });
  console.log('Admin User:', JSON.stringify(u, null, 2));
  await prisma.$disconnect();
}

inspectAdmin();
