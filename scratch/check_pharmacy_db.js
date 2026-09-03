const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

async function check() {
  const inventories = await prisma.pharmacyInventory.findMany();
  console.log(`PharmacyInventory count: ${inventories.length}`);
  if (inventories.length > 0) {
    console.log('Sample inventories:', inventories.slice(0, 5).map(i => ({ name: i.medicineName, batch: i.batchNumber, qty: i.stockQuantity, exp: i.expiryDate, price: i.sellingPrice })));
  }

  const drugs = await prisma.drugMaster.findMany();
  console.log(`DrugMaster count: ${drugs.length}`);

  const prescriptions = await prisma.prescription.findMany({
    include: { items: true, patient: { include: { user: true } } }
  });
  console.log(`Prescriptions count: ${prescriptions.length}`);

  const medOrders = await prisma.medicationOrder.findMany({
    include: { items: true }
  });
  console.log(`MedicationOrders count: ${medOrders.length}`);

  await prisma.$disconnect();
}

check().catch(console.error);
