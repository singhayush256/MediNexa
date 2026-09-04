const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public' } },
});

async function main() {
  const sample = await prisma.billingInvoice.findFirst({
    include: { patient: { include: { user: true } }, items: true },
  });
  console.log('BillingInvoice sample:', JSON.stringify(sample, null, 2));
  await prisma.$disconnect();
}
main();
