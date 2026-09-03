process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/medinexa?schema=public";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const userCount = await prisma.user.count();
    console.log('✅ PostgreSQL 5433 connected! User count:', userCount);
    const roles = await prisma.role.findMany();
    console.log('✅ Roles in DB:', roles.map(r => r.code).join(', '));
  } catch (err) {
    console.error('❌ DB Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
