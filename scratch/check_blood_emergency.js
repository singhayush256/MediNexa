const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public' } },
});

async function main() {
  const models = ['bloodDonor', 'bloodDonation', 'bloodUnit', 'bloodRequest', 'triageAssessment', 'ambulance'];
  for (const m of models) {
    try {
      console.log(`${m}:`, await prisma[m].count());
    } catch (e) {
      console.log(`${m}: Error - ${e.message}`);
    }
  }
  await prisma.$disconnect();
}
main();
