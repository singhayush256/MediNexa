const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

const REALISTIC_MEDICINES = [
  {
    medicineName: 'Dolo 650 (Paracetamol 650mg)',
    genericName: 'Paracetamol',
    category: 'Analgesic & Antipyretic',
    batchNumber: 'BATCH-2026-DL65',
    manufacturer: 'Micro Labs Ltd',
    stockQuantity: 450,
    reorderLevel: 50,
    expiryDays: 420,
    purchasePrice: 1.8,
    sellingPrice: 3.2,
  },
  {
    medicineName: 'Pan 40 (Pantoprazole 40mg)',
    genericName: 'Pantoprazole Sodium',
    category: 'Gastrointestinal / PPI',
    batchNumber: 'BATCH-2026-PAN40',
    manufacturer: 'Alkem Laboratories',
    stockQuantity: 320,
    reorderLevel: 40,
    expiryDays: 360,
    purchasePrice: 6.5,
    sellingPrice: 11.0,
  },
  {
    medicineName: 'Augmentin 625 Duo (Amoxicillin 500mg + Clavulanate 125mg)',
    genericName: 'Amoxicillin and Potassium Clavulanate',
    category: 'Antibiotic / Penicillin',
    batchNumber: 'BATCH-2026-AUG625',
    manufacturer: 'GlaxoSmithKline (GSK)',
    stockQuantity: 180,
    reorderLevel: 30,
    expiryDays: 300,
    purchasePrice: 14.5,
    sellingPrice: 22.0,
  },
  {
    medicineName: 'Glycomet 500 SR (Metformin 500mg)',
    genericName: 'Metformin Hydrochloride SR',
    category: 'Antidiabetic / Biguanide',
    batchNumber: 'BATCH-2026-GLY500',
    manufacturer: 'USV Private Limited',
    stockQuantity: 280,
    reorderLevel: 35,
    expiryDays: 500,
    purchasePrice: 2.2,
    sellingPrice: 4.5,
  },
  {
    medicineName: 'Telma 40 (Telmisartan 40mg)',
    genericName: 'Telmisartan',
    category: 'Antihypertensive / ARB',
    batchNumber: 'BATCH-2026-TEL40',
    manufacturer: 'Glenmark Pharmaceuticals',
    stockQuantity: 210,
    reorderLevel: 25,
    expiryDays: 450,
    purchasePrice: 7.0,
    sellingPrice: 12.5,
  },
  {
    medicineName: 'Atorva 20 (Atorvastatin 20mg)',
    genericName: 'Atorvastatin Calcium',
    category: 'Cardiovascular / Statin',
    batchNumber: 'BATCH-2026-AT20',
    manufacturer: 'Zydus Healthcare',
    stockQuantity: 160,
    reorderLevel: 25,
    expiryDays: 380,
    purchasePrice: 9.5,
    sellingPrice: 16.0,
  },
  {
    medicineName: 'Azee 500 (Azithromycin 500mg)',
    genericName: 'Azithromycin',
    category: 'Antibiotic / Macrolide',
    batchNumber: 'BATCH-2026-AZ500',
    manufacturer: 'Cipla Ltd',
    stockQuantity: 95,
    reorderLevel: 20,
    expiryDays: 240,
    purchasePrice: 18.0,
    sellingPrice: 28.5,
  },
  {
    medicineName: 'Montair LC (Montelukast 10mg + Levocetirizine 5mg)',
    genericName: 'Montelukast and Levocetirizine',
    category: 'Antiallergic / Respiratory',
    batchNumber: 'BATCH-2026-MLC',
    manufacturer: 'Cipla Ltd',
    stockQuantity: 140,
    reorderLevel: 20,
    expiryDays: 320,
    purchasePrice: 12.0,
    sellingPrice: 19.5,
  },
  // Near-expiry medicine for Expiry Tracking testing (expires in 28 days)
  {
    medicineName: 'Taxim-O 200 (Cefixime 200mg)',
    genericName: 'Cefixime Trihydrate',
    category: 'Antibiotic / Cephalosporin',
    batchNumber: 'BATCH-2025-EXP-TAX',
    manufacturer: 'Alkem Laboratories',
    stockQuantity: 45,
    reorderLevel: 15,
    expiryDays: 28, // Near-expiry!
    purchasePrice: 8.0,
    sellingPrice: 14.0,
  },
  // Low-stock medicine for Stock Management testing (stock 6, reorder level 20)
  {
    medicineName: 'Lantus Solostar (Insulin Glargine 100 IU/mL)',
    genericName: 'Insulin Glargine',
    category: 'Antidiabetic / Long-Acting Insulin',
    batchNumber: 'BATCH-2026-LANT',
    manufacturer: 'Sanofi India Ltd',
    stockQuantity: 6, // Low stock!
    reorderLevel: 20,
    expiryDays: 210,
    purchasePrice: 550.0,
    sellingPrice: 720.0,
  },
];

async function seedPharmacySystem() {
  console.log('--- SEEDING REALISTIC PHARMACY PMS DATABASE ---');

  const facility = await prisma.facility.findFirst();
  const patient = await prisma.patientProfile.findFirst({ include: { user: true } });
  const doctor = await prisma.doctorProfile.findFirst({ include: { user: true } });

  if (!facility || !patient || !doctor) {
    console.error('Facility, Patient, or Doctor missing. Cannot seed pharmacy.');
    return;
  }

  console.log(`Using Facility: ${facility.name}, Patient: ${patient.user.firstName}, Doctor: Dr. ${doctor.user.firstName}`);

  // 1. Clean existing records and seed PharmacyInventory
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.pharmacyInventory.deleteMany({});

  const seededInventories = [];
  for (const med of REALISTIC_MEDICINES) {
    const expiryDate = new Date(Date.now() + med.expiryDays * 86400000);
    const inv = await prisma.pharmacyInventory.create({
      data: {
        facilityId: facility.id,
        medicineName: med.medicineName,
        genericName: med.genericName,
        batchNumber: med.batchNumber,
        manufacturer: med.manufacturer,
        stockQuantity: med.stockQuantity,
        reorderLevel: med.reorderLevel,
        expiryDate,
        purchasePrice: med.purchasePrice,
        sellingPrice: med.sellingPrice,
      },
    });

    // Create opening stock transaction
    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inv.id,
        type: 'PURCHASE',
        quantity: med.stockQuantity,
        performedById: doctor.user.id,
        remarks: `Initial procurement batch #${med.batchNumber}`,
      },
    });

    seededInventories.push(inv);
    console.log(`✓ Stock: [${inv.batchNumber}] ${inv.medicineName} | Qty: ${inv.stockQuantity} | Exp: ${expiryDate.toLocaleDateString()}`);
  }

  // 2. Seed Medication Orders for Prescription Fulfillment & Pharmacist Dispensing
  await prisma.medicationItem.deleteMany({});
  await prisma.medicationOrder.deleteMany({});

  // Order 1: PRESCRIBED (Pending Pharmacist Dispensing)
  const pendingOrder = await prisma.medicationOrder.create({
    data: {
      facilityId: facility.id,
      patientId: patient.id,
      doctorId: doctor.id,
      status: 'PRESCRIBED',
      totalItems: 3,
      notes: 'Post-OPD prescription for acute upper respiratory infection and gastritis.',
      items: {
        create: [
          {
            medicineName: 'Augmentin 625 Duo (Amoxicillin 500mg + Clavulanate 125mg)',
            dosage: '625mg',
            frequency: '1-0-1 (Twice daily after food)',
            duration: '5 Days',
            quantity: 10,
            dispensedQuantity: 0,
            status: 'PRESCRIBED',
          },
          {
            medicineName: 'Pan 40 (Pantoprazole 40mg)',
            dosage: '40mg',
            frequency: '1-0-0 (Once daily before breakfast)',
            duration: '10 Days',
            quantity: 10,
            dispensedQuantity: 0,
            status: 'PRESCRIBED',
          },
          {
            medicineName: 'Dolo 650 (Paracetamol 650mg)',
            dosage: '650mg',
            frequency: 'SOS (As needed for fever > 100°F)',
            duration: '3 Days',
            quantity: 6,
            dispensedQuantity: 0,
            status: 'PRESCRIBED',
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log(`✓ Seeded Pending Medication Order #${pendingOrder.id.slice(0, 8)} with 3 items in PRESCRIBED status.`);

  // Order 2: DISPENSED (Completed Fulfillment)
  const dispensedOrder = await prisma.medicationOrder.create({
    data: {
      facilityId: facility.id,
      patientId: patient.id,
      doctorId: doctor.id,
      status: 'DISPENSED',
      totalItems: 2,
      notes: 'Hypertension and dyslipidemia monthly maintenance refill.',
      items: {
        create: [
          {
            medicineName: 'Telma 40 (Telmisartan 40mg)',
            dosage: '40mg',
            frequency: '1-0-0 (Morning with water)',
            duration: '30 Days',
            quantity: 30,
            dispensedQuantity: 30,
            status: 'DISPENSED',
          },
          {
            medicineName: 'Atorva 20 (Atorvastatin 20mg)',
            dosage: '20mg',
            frequency: '0-0-1 (Night at bedtime)',
            duration: '30 Days',
            quantity: 30,
            dispensedQuantity: 30,
            status: 'DISPENSED',
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log(`✓ Seeded Completed Medication Order #${dispensedOrder.id.slice(0, 8)} with 2 items in DISPENSED status.`);

  // 3. Seed Purchase Orders for Purchase History
  await prisma.purchaseOrder.deleteMany({});
  const po1 = await prisma.purchaseOrder.create({
    data: {
      facilityId: facility.id,
      poNumber: 'PO-2026-0881',
      supplierName: 'Cipla Healthcare Distribution Ltd',
      status: 'APPROVED',
      totalAmount: 48500.0,
      createdById: doctor.user.id,
      approvedById: doctor.user.id,
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      facilityId: facility.id,
      poNumber: 'PO-2026-0894',
      supplierName: 'Sun Pharma National Wholesale Corp',
      status: 'RECEIVED',
      totalAmount: 92400.0,
      createdById: doctor.user.id,
      approvedById: doctor.user.id,
    },
  });

  const po3 = await prisma.purchaseOrder.create({
    data: {
      facilityId: facility.id,
      poNumber: 'PO-2026-0912',
      supplierName: 'Alkem Laboratories Trade Division',
      status: 'SUBMITTED',
      totalAmount: 34200.0,
      createdById: doctor.user.id,
    },
  });

  console.log(`✓ Seeded 3 Purchase Orders (PO-2026-0881, 0894, 0912) for Procurement History.`);

  await prisma.$disconnect();
  console.log('--- PHARMACY PMS SEEDING COMPLETE ---');
}

seedPharmacySystem().catch(console.error);
