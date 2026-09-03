const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function check() {
  const p = await prisma.prescription.findFirst({
    include: {
      items: { include: { medication: true } },
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
      facility: true,
    }
  });
  console.log('Sample prescription:', JSON.stringify(p, null, 2));
  const meds = await prisma.medication.findMany();
  console.log('Medications in DB:', meds.map(m => ({ code: m.code, name: m.brandName, generic: m.genericName, strength: m.strength, form: m.dosageForm })));
  await prisma.$disconnect();
}

check().catch(console.error);
