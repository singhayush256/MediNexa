const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function check() {
  const users = await prisma.user.findMany({
    include: { role: true },
    take: 20,
  });
  console.log('Total users:', await prisma.user.count());
  console.log('Sample users:');
  for (const u of users) {
    console.log(`- ${u.email} | Role: ${u.role?.code} | Name: ${u.firstName} ${u.lastName}`);
  }
  await prisma.$disconnect();
}
check();
