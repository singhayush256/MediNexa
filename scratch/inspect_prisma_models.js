const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public' } },
});

async function main() {
  console.log('billingInvoice:', await prisma.billingInvoice.count());
  console.log('billingLineItem:', await prisma.billingLineItem.count());
  console.log('invoice:', await prisma.invoice.count());
  console.log('invoiceItem:', await prisma.invoiceItem.count());
  console.log('insuranceClaim:', await prisma.insuranceClaim.count());
  console.log('insurancePolicy:', await prisma.insurancePolicy.count());
  console.log('abhaProfile:', await prisma.abhaProfile.count());
  console.log('abdmConsent:', await prisma.abdmConsent.count());
  console.log('abdmAuditLog:', await prisma.abdmAuditLog.count());
  await prisma.$disconnect();
}
main();
