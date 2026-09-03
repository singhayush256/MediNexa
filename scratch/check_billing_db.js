const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function check() {
  const invs = await prisma.invoice.findMany({
    include: { items: true, lineItems: true, patient: { include: { user: true } } }
  });
  console.log(`Invoices count: ${invs.length}`);
  if (invs.length > 0) {
    console.log('Sample invoice:', JSON.stringify(invs[0], null, 2));
  }

  const claims = await prisma.insuranceClaim.findMany({
    include: { patient: { include: { user: true } }, provider: true }
  });
  console.log(`Insurance claims count: ${claims.length}`);
  if (claims.length > 0) {
    console.log('Sample claim:', JSON.stringify(claims[0], null, 2));
  }

  const providers = await prisma.insuranceProvider.findMany();
  console.log('Insurance providers in DB:', providers.map(p => ({ name: p.name, code: p.code })));

  await prisma.$disconnect();
}

check().catch(console.error);
