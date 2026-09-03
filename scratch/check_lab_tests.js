const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function check() {
  const tests = await prisma.labTest.findMany();
  console.log(`Total Lab Tests in DB: ${tests.length}`);
  tests.forEach((t) => {
    console.log(`- [${t.code}] ${t.name} (${t.category}) - ₹${t.price} (Specimen: ${t.specimenType})`);
  });

  const orders = await prisma.labOrder.findMany({
    take: 5,
    include: { testItems: true, patient: { include: { user: true } }, doctor: { include: { user: true } } },
  });
  console.log(`\nTotal Lab Orders in DB sample: ${orders.length}`);
  orders.forEach((o) => {
    console.log(`- Order: ${o.orderNumber}, Status: ${o.status}, Patient: ${o.patient?.user?.firstName || 'Unknown'}, Items: ${o.testItems.length}`);
  });

  await prisma.$disconnect();
}

check().catch(console.error);
