const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/medinexa?schema=public',
    },
  },
});

const REQUIRED_LAB_TESTS = [
  {
    code: 'LAB-CBC',
    name: 'Complete Blood Count (CBC with ESR)',
    category: 'HEMATOLOGY',
    description: 'Comprehensive evaluation of RBCs, WBCs, Platelet count, Hemoglobin, PCV, and ESR.',
    specimenType: 'Whole Blood (EDTA Vacutainer)',
    turnaroundTimeMinutes: 60,
    price: 450.0,
    status: 'ACTIVE',
  },
  {
    code: 'LAB-BS-FBS',
    name: 'Fasting Blood Sugar (FBS)',
    category: 'BIOCHEMISTRY',
    description: 'Plasma glucose level after 8-10 hours of overnight fasting.',
    specimenType: 'Fluoride Plasma / Serum',
    turnaroundTimeMinutes: 45,
    price: 150.0,
    status: 'ACTIVE',
  },
  {
    code: 'LAB-BS-PPBS',
    name: 'Post-Prandial Blood Sugar (PPBS)',
    category: 'BIOCHEMISTRY',
    description: 'Plasma glucose level exactly 2 hours after a standardized meal.',
    specimenType: 'Fluoride Plasma / Serum',
    turnaroundTimeMinutes: 45,
    price: 150.0,
    status: 'ACTIVE',
  },
  {
    code: 'LAB-LFT',
    name: 'Liver Function Test (LFT Comprehensive)',
    category: 'BIOCHEMISTRY',
    description: 'Serum Bilirubin (Total/Direct), SGOT, SGPT, Alkaline Phosphatase, Total Protein, and Albumin.',
    specimenType: 'Clotted Blood / Serum (Gold Top)',
    turnaroundTimeMinutes: 90,
    price: 900.0,
    status: 'ACTIVE',
  },
  {
    code: 'LAB-KFT',
    name: 'Kidney Function Test (KFT with Electrolytes)',
    category: 'BIOCHEMISTRY',
    description: 'Blood Urea, Serum Creatinine, Uric Acid, Sodium, Potassium, and Chloride.',
    specimenType: 'Clotted Blood / Serum (Gold Top)',
    turnaroundTimeMinutes: 90,
    price: 850.0,
    status: 'ACTIVE',
  },
  {
    code: 'LAB-THYROID',
    name: 'Thyroid Profile Total (T3, T4, TSH)',
    category: 'BIOCHEMISTRY',
    description: 'Chemiluminescence immunoassay measurement of Total Triiodothyronine, Thyroxine, and TSH.',
    specimenType: 'Serum (Plain Vacutainer)',
    turnaroundTimeMinutes: 120,
    price: 750.0,
    status: 'ACTIVE',
  },
  {
    code: 'LAB-URINE-ROUTINE',
    name: 'Complete Urine Routine & Microscopy (CUE)',
    category: 'BIOCHEMISTRY',
    description: 'Physical, chemical, and microscopic examination of clean-catch midstream urine sample.',
    specimenType: 'Urine (Sterile Container)',
    turnaroundTimeMinutes: 45,
    price: 250.0,
    status: 'ACTIVE',
  },
];

async function seedDiagnosticPanels() {
  console.log('--- SEEDING 6 REQUIRED LAB DIAGNOSTIC PANELS ---');

  for (const t of REQUIRED_LAB_TESTS) {
    const upserted = await prisma.labTest.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        category: t.category,
        description: t.description,
        specimenType: t.specimenType,
        turnaroundTimeMinutes: t.turnaroundTimeMinutes,
        price: t.price,
        status: t.status,
      },
      create: t,
    });
    console.log(`✓ Lab Test: [${upserted.code}] ${upserted.name} - ₹${upserted.price}`);
  }

  // Find demo patient, doctor, and facility
  const facility = await prisma.facility.findFirst();
  const patient = await prisma.patientProfile.findFirst({
    include: { user: true },
  });
  const doctor = await prisma.doctorProfile.findFirst({
    include: { user: true },
  });

  if (!facility || !patient || !doctor) {
    console.error('Facility, Patient, or Doctor missing from DB. Cannot seed lab orders.');
    return;
  }

  console.log(`Using Facility: ${facility.name}, Patient: ${patient.user.firstName}, Doctor: Dr. ${doctor.user.firstName}`);

  // Create sample verified Lab Orders with rich LabTestItems for each of the 6 panels!
  const PANELS_DATA = [
    {
      title: 'Complete Blood Count (CBC with ESR)',
      code: 'LAB-CBC',
      notes: 'Routine preoperative hematological clearance.',
      items: [
        { testName: 'Hemoglobin (Hb)', resultValue: '14.2', referenceRange: '13.0 - 17.0', unit: 'g/dL', flag: 'NORMAL' },
        { testName: 'Total Leukocyte Count (TLC/WBC)', resultValue: '7,400', referenceRange: '4,000 - 11,000', unit: '/cumm', flag: 'NORMAL' },
        { testName: 'Platelet Count', resultValue: '280,000', referenceRange: '150,000 - 450,000', unit: '/cumm', flag: 'NORMAL' },
        { testName: 'Red Blood Cells (RBC)', resultValue: '4.85', referenceRange: '4.50 - 5.50', unit: 'mill/cumm', flag: 'NORMAL' },
        { testName: 'Packed Cell Volume (PCV/Hematocrit)', resultValue: '42.5', referenceRange: '40.0 - 50.0', unit: '%', flag: 'NORMAL' },
        { testName: 'ESR (Westergren Method)', resultValue: '8', referenceRange: '0 - 15', unit: 'mm/1st hr', flag: 'NORMAL' },
      ],
    },
    {
      title: 'Blood Sugar Fasting & Post-Prandial (Diabetic Screen)',
      code: 'LAB-BS-FBS',
      notes: 'Quarterly glycemic evaluation in known Type-2 Diabetic.',
      items: [
        { testName: 'Fasting Blood Sugar (FBS)', resultValue: '104', referenceRange: '70 - 99', unit: 'mg/dL', flag: 'ABNORMAL' },
        { testName: 'Post-Prandial Blood Sugar (PPBS)', resultValue: '138', referenceRange: '70 - 140', unit: 'mg/dL', flag: 'NORMAL' },
        { testName: 'Estimated Average Glucose (eAG)', resultValue: '118', referenceRange: '90 - 130', unit: 'mg/dL', flag: 'NORMAL' },
      ],
    },
    {
      title: 'Liver Function Test (Comprehensive LFT)',
      code: 'LAB-LFT',
      notes: 'Hepatic safety evaluation during statin therapy.',
      items: [
        { testName: 'Bilirubin - Total', resultValue: '0.85', referenceRange: '0.20 - 1.20', unit: 'mg/dL', flag: 'NORMAL' },
        { testName: 'Bilirubin - Direct (Conjugated)', resultValue: '0.22', referenceRange: '0.00 - 0.30', unit: 'mg/dL', flag: 'NORMAL' },
        { testName: 'SGOT / AST', resultValue: '28', referenceRange: '10 - 40', unit: 'U/L', flag: 'NORMAL' },
        { testName: 'SGPT / ALT', resultValue: '34', referenceRange: '10 - 45', unit: 'U/L', flag: 'NORMAL' },
        { testName: 'Alkaline Phosphatase (ALP)', resultValue: '88', referenceRange: '40 - 130', unit: 'U/L', flag: 'NORMAL' },
        { testName: 'Total Protein', resultValue: '7.2', referenceRange: '6.0 - 8.3', unit: 'g/dL', flag: 'NORMAL' },
        { testName: 'Serum Albumin', resultValue: '4.4', referenceRange: '3.5 - 5.0', unit: 'g/dL', flag: 'NORMAL' },
      ],
    },
    {
      title: 'Kidney Function Test (KFT with Electrolytes)',
      code: 'LAB-KFT',
      notes: 'Renal function screening for antihypertensive optimization.',
      items: [
        { testName: 'Blood Urea', resultValue: '24', referenceRange: '15 - 40', unit: 'mg/dL', flag: 'NORMAL' },
        { testName: 'Blood Urea Nitrogen (BUN)', resultValue: '11.2', referenceRange: '7.0 - 20.0', unit: 'mg/dL', flag: 'NORMAL' },
        { testName: 'Serum Creatinine', resultValue: '0.92', referenceRange: '0.60 - 1.20', unit: 'mg/dL', flag: 'NORMAL' },
        { testName: 'Serum Uric Acid', resultValue: '5.1', referenceRange: '3.5 - 7.2', unit: 'mg/dL', flag: 'NORMAL' },
        { testName: 'Serum Sodium (Na+)', resultValue: '141', referenceRange: '135 - 145', unit: 'mEq/L', flag: 'NORMAL' },
        { testName: 'Serum Potassium (K+)', resultValue: '4.3', referenceRange: '3.5 - 5.0', unit: 'mEq/L', flag: 'NORMAL' },
      ],
    },
    {
      title: 'Thyroid Profile Total (T3, T4, TSH)',
      code: 'LAB-THYROID',
      notes: 'Endocrine screening for metabolic fatigue.',
      items: [
        { testName: 'Total Triiodothyronine (T3)', resultValue: '1.24', referenceRange: '0.80 - 2.00', unit: 'ng/mL', flag: 'NORMAL' },
        { testName: 'Total Thyroxine (T4)', resultValue: '8.6', referenceRange: '5.1 - 14.1', unit: 'ug/dL', flag: 'NORMAL' },
        { testName: 'Thyroid Stimulating Hormone (TSH)', resultValue: '2.45', referenceRange: '0.35 - 4.94', unit: 'uIU/mL', flag: 'NORMAL' },
      ],
    },
    {
      title: 'Complete Urine Routine & Microscopy (CUE)',
      code: 'LAB-URINE-ROUTINE',
      notes: 'Routine urinalysis.',
      items: [
        { testName: 'Color & Appearance', resultValue: 'Pale Yellow / Clear', referenceRange: 'Pale Yellow / Clear', unit: '', flag: 'NORMAL' },
        { testName: 'Specific Gravity', resultValue: '1.018', referenceRange: '1.005 - 1.030', unit: '', flag: 'NORMAL' },
        { testName: 'Reaction (pH)', resultValue: '6.0', referenceRange: '5.0 - 7.5', unit: '', flag: 'NORMAL' },
        { testName: 'Urine Albumin / Protein', resultValue: 'NIL', referenceRange: 'NIL', unit: '', flag: 'NORMAL' },
        { testName: 'Urine Sugar / Glucose', resultValue: 'NIL', referenceRange: 'NIL', unit: '', flag: 'NORMAL' },
        { testName: 'Pus Cells (Leukocytes)', resultValue: '1 - 2', referenceRange: '1 - 5', unit: '/HPF', flag: 'NORMAL' },
        { testName: 'Red Blood Cells (RBCs)', resultValue: 'NIL', referenceRange: 'NIL', unit: '/HPF', flag: 'NORMAL' },
      ],
    },
  ];

  for (let i = 0; i < PANELS_DATA.length; i++) {
    const panel = PANELS_DATA[i];
    const orderNumber = `LAB-VERIFIED-2026-00${i + 1}`;

    // Upsert LabOrder
    const order = await prisma.labOrder.upsert({
      where: { orderNumber },
      update: {
        status: 'VERIFIED',
        completedAt: new Date(),
        verifiedAt: new Date(),
        verifiedBy: doctor.user.id,
      },
      create: {
        orderNumber,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: facility.id,
        priority: 'ROUTINE',
        status: 'VERIFIED',
        clinicalNotes: panel.notes,
        orderedAt: new Date(Date.now() - (i + 1) * 86400000),
        collectedAt: new Date(Date.now() - (i + 1) * 86400000 + 1800000),
        completedAt: new Date(),
        verifiedAt: new Date(),
        verifiedBy: doctor.user.id,
      },
    });

    // Delete existing test items for this order and recreate clean items
    await prisma.labTestItem.deleteMany({ where: { labOrderId: order.id } });

    for (const item of panel.items) {
      await prisma.labTestItem.create({
        data: {
          labOrderId: order.id,
          testName: item.testName,
          category: panel.code.includes('CBC') ? 'HEMATOLOGY' : 'BIOCHEMISTRY',
          status: 'VERIFIED',
          resultValue: item.resultValue,
          referenceRange: item.referenceRange,
          unit: item.unit,
          flag: item.flag,
          verifiedById: doctor.user.id,
          verifiedAt: new Date(),
        },
      });
    }

    console.log(`✓ Seeded Lab Order [${order.orderNumber}]: ${panel.title} with ${panel.items.length} verified parameters.`);
  }

  // Also create 1 pending order in ORDERED status so the Lab Technician workflow can be tested live!
  const pendingOrderNum = 'LAB-QUEUE-2026-0099';
  const pendingOrder = await prisma.labOrder.upsert({
    where: { orderNumber: pendingOrderNum },
    update: { status: 'ORDERED' },
    create: {
      orderNumber: pendingOrderNum,
      patientId: patient.id,
      doctorId: doctor.id,
      facilityId: facility.id,
      priority: 'URGENT',
      status: 'ORDERED',
      clinicalNotes: 'STAT Evaluation - Patient experiencing acute fatigue and fever.',
      orderedAt: new Date(),
    },
  });

  await prisma.labTestItem.deleteMany({ where: { labOrderId: pendingOrder.id } });
  await prisma.labTestItem.createMany({
    data: [
      {
        labOrderId: pendingOrder.id,
        testName: 'Complete Blood Count (CBC with ESR)',
        category: 'HEMATOLOGY',
        status: 'ORDERED',
        referenceRange: '13.0 - 17.0 g/dL',
        unit: 'g/dL',
        flag: 'NORMAL',
      },
      {
        labOrderId: pendingOrder.id,
        testName: 'Fasting Blood Sugar (FBS)',
        category: 'BIOCHEMISTRY',
        status: 'ORDERED',
        referenceRange: '70 - 99 mg/dL',
        unit: 'mg/dL',
        flag: 'NORMAL',
      },
    ],
  });

  console.log(`✓ Seeded Pending Lab Order [${pendingOrder.orderNumber}] in ORDERED status for live technician workflow testing!`);

  await prisma.$disconnect();
  console.log('--- ALL DIAGNOSTIC PANELS SEEDED SUCCESSFULLY ---');
}

seedDiagnosticPanels().catch(console.error);
