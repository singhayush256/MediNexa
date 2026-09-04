const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public' } },
});

async function test() {
  const rev = await prisma.billingInvoice.aggregate({ _sum: { totalAmount: true } });
  const appts = await prisma.appointment.count();
  const adms = await prisma.admission.count();
  const claims = await prisma.insuranceClaim.count();
  const labs = await prisma.labOrder.count();
  const pharm = await prisma.pharmacyDispenseRecord.count();
  console.log({ rev: rev._sum.totalAmount, appts, adms, claims, labs, pharm });
  await prisma.$disconnect();
}
test();
