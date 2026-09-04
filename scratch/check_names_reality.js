const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public' } },
});

async function check() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: 'Jane', mode: 'insensitive' } },
        { lastName: { contains: 'Doe', mode: 'insensitive' } },
        { firstName: { contains: 'Sarah', mode: 'insensitive' } },
        { lastName: { contains: 'Smith', mode: 'insensitive' } },
        { firstName: { contains: 'Michael', mode: 'insensitive' } },
        { lastName: { contains: 'Chen', mode: 'insensitive' } },
        { firstName: { contains: 'Demo', mode: 'insensitive' } },
        { firstName: { contains: 'Test', mode: 'insensitive' } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, email: true, status: true },
  });
  console.log('Database Western / Demo names found in PostgreSQL:', users.length);
  console.log(users);
  await prisma.$disconnect();
}
check();
