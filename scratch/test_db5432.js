process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/medinexa?schema=public";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const count = await prisma.user.count();
    console.log('Database connected successfully on 5432! Total users:', count);
  } catch (err) {
    console.error('Connection error on 5432:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
