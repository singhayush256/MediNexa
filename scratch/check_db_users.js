const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function check() {
  const { DispenseStatus } = require('@prisma/client');
  console.log('DispenseStatus values:', DispenseStatus);
  const sampleBed = await prisma.bed.findFirst();
  console.log('Sample bed:', sampleBed);
  await prisma.$disconnect();
}
check();
