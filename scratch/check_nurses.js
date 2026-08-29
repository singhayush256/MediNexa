require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNurses() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        code: { in: ['NURSE', 'LAB_STAFF', 'DOCTOR', 'HOSPITAL_ADMIN'] }
      }
    },
    select: {
      id: true,
      email: true,
      role: { select: { code: true } },
      facilityId: true,
    }
  });
  console.log('Hospital Clinical Staff Users:', JSON.stringify(users, null, 2));
}

checkNurses().finally(() => prisma.$disconnect());
