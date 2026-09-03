const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHospitalBilling() {
  console.log('--- SEEDING COMPREHENSIVE HOSPITAL BILLING & CLAIMS DATABASE ---');

  // 1. Get Facility
  let facility = await prisma.facility.findFirst({
    where: { name: { contains: 'Apollo', mode: 'insensitive' } },
  });
  if (!facility) {
    facility = await prisma.facility.findFirst();
  }

  // 2. Get Patient
  let patient = await prisma.patientProfile.findFirst({
    where: { user: { firstName: { contains: 'Aarav', mode: 'insensitive' } } },
    include: { user: true },
  });
  if (!patient) {
    patient = await prisma.patientProfile.findFirst({ include: { user: true } });
  }

  // 3. Get Doctor
  let doctor = await prisma.doctorProfile.findFirst({
    where: { user: { firstName: { contains: 'Arvind', mode: 'insensitive' } } },
    include: { user: true },
  });
  if (!doctor) {
    doctor = await prisma.doctorProfile.findFirst({ include: { user: true } });
  }

  console.log(`Using Facility: ${facility?.name}, Patient: ${patient?.user?.firstName} ${patient?.user?.lastName}, Doctor: Dr. ${doctor?.user?.firstName}`);

  // 4. Ensure Insurance Providers exist
  let starHealth = await prisma.insuranceProvider.findFirst({
    where: { providerName: { contains: 'Star Health', mode: 'insensitive' } },
  });
  if (!starHealth) {
    starHealth = await prisma.insuranceProvider.create({
      data: {
        providerName: 'Star Health and Allied Insurance Co. Ltd.',
        providerCode: 'TPA-STAR-01',
        contactEmail: 'claims.delhi@starhealth.in',
        contactPhone: '+91 1800-425-2255',
      },
    });
  }

  let hdfcErgo = await prisma.insuranceProvider.findFirst({
    where: { providerName: { contains: 'HDFC ERGO', mode: 'insensitive' } },
  });
  if (!hdfcErgo) {
    hdfcErgo = await prisma.insuranceProvider.create({
      data: {
        providerName: 'HDFC ERGO General Insurance TPA Ltd',
        providerCode: 'TPA-HDFC-02',
        contactEmail: 'preauth@hdfcergo.com',
        contactPhone: '+91 1800-266-6444',
      },
    });
  }

  // 5. Ensure Insurance Policy exists for Patient
  let policy = await prisma.insurancePolicy.findFirst({
    where: { patientId: patient.id },
  });
  if (!policy) {
    policy = await prisma.insurancePolicy.create({
      data: {
        patientId: patient.id,
        providerId: starHealth.id,
        policyNumber: 'POL-STAR-2026-88912',
        coverageAmount: 500000.0,
        validTill: new Date('2028-12-31'),
        status: 'ACTIVE',
      },
    });
  }

  // 6. Seed OPD Consultation Invoice
  const opdInvNumber = `INV-OPD-${Date.now().toString().slice(-5)}`;
  const opdInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: opdInvNumber,
      patientId: patient.id,
      facilityId: facility.id,
      subtotal: 800.0,
      discountAmount: 0.0,
      taxAmount: 0.0,
      totalAmount: 800.0,
      netAmount: 800.0,
      paidAmount: 800.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      status: 'GENERATED',
      invoiceStatus: 'GENERATED',
      createdBy: doctor.user.id,
      items: {
        create: [
          {
            category: 'OPD',
            description: 'Specialist Doctor Consultation Fee - Dr. Arvind Deshmukh (SAC 999311)',
            quantity: 1,
            unitPrice: 800.0,
            totalPrice: 800.0,
          },
        ],
      },
      lineItems: {
        create: [
          {
            category: 'OPD',
            itemName: 'Specialist Doctor Consultation Fee',
            quantity: 1,
            unitPrice: 800.0,
            amount: 800.0,
          },
        ],
      },
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      financeInvoiceId: opdInvoice.id,
      amount: 800.0,
      paymentMethod: 'UPI',
      transactionReference: 'UPI-AXIS-9021849102',
      receivedById: doctor.user.id,
    },
  });
  console.log(`✓ Seeded OPD Billing Invoice #${opdInvoice.invoiceNumber} (Consultation Fee: ₹800, PAID)`);

  // 7. Seed Comprehensive IPD Admission Invoice (Bed Charges, Doctor Charges, Procedure Charges)
  const ipdInvNumber = `INV-IPD-${Date.now().toString().slice(-5)}`;
  const ipdBedCharge = 13500.0; // 3 days @ 4500
  const ipdDocCharge = 5000.0;  // 5 visits @ 1000
  const ipdProcCharge = 35000.0; // Laparoscopic Procedure
  const ipdSubtotal = ipdBedCharge + ipdDocCharge + ipdProcCharge; // 53,500
  const ipdTax = 0.0;

  const ipdInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: ipdInvNumber,
      patientId: patient.id,
      facilityId: facility.id,
      subtotal: ipdSubtotal,
      discountAmount: 2000.0,
      taxAmount: ipdTax,
      totalAmount: ipdSubtotal - 2000.0,
      netAmount: ipdSubtotal - 2000.0,
      paidAmount: 20000.0,
      balanceAmount: 31500.0,
      paymentStatus: 'PARTIAL',
      status: 'GENERATED',
      invoiceStatus: 'GENERATED',
      createdBy: doctor.user.id,
      items: {
        create: [
          {
            category: 'IPD',
            description: 'ICU / Critical Care Bed Charges (3 Days @ ₹4,500/day) - SAC 999312',
            quantity: 3,
            unitPrice: 4500.0,
            totalPrice: 13500.0,
          },
          {
            category: 'IPD',
            description: 'Inpatient Senior Consultant Daily Rounds & Doctor Charges (5 Visits)',
            quantity: 5,
            unitPrice: 1000.0,
            totalPrice: 5000.0,
          },
          {
            category: 'IPD',
            description: 'Surgical Procedure: Laparoscopic Cholecystectomy & OT Facility Charges',
            quantity: 1,
            unitPrice: 35000.0,
            totalPrice: 35000.0,
          },
        ],
      },
      lineItems: {
        create: [
          {
            category: 'IPD',
            itemName: 'ICU Bed Charges (3 Days)',
            quantity: 3,
            unitPrice: 4500.0,
            amount: 13500.0,
          },
          {
            category: 'IPD',
            itemName: 'Doctor Visit Charges (5 Visits)',
            quantity: 5,
            unitPrice: 1000.0,
            amount: 5000.0,
          },
          {
            category: 'IPD',
            itemName: 'Laparoscopic Surgery Procedure Charges',
            quantity: 1,
            unitPrice: 35000.0,
            amount: 35000.0,
          },
        ],
      },
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      financeInvoiceId: ipdInvoice.id,
      amount: 20000.0,
      paymentMethod: 'CARD',
      transactionReference: 'CARD-HDFC-99120',
      receivedById: doctor.user.id,
    },
  });
  console.log(`✓ Seeded IPD Billing Invoice #${ipdInvoice.invoiceNumber} (Bed: ₹13,500, Doc: ₹5,000, Proc: ₹35,000, Total: ₹51,500)`);

  // 8. Seed Lab Diagnostics Invoice (Test Charges)
  const labInvNumber = `INV-LAB-${Date.now().toString().slice(-5)}`;
  const labInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: labInvNumber,
      patientId: patient.id,
      facilityId: facility.id,
      subtotal: 3150.0,
      discountAmount: 150.0,
      taxAmount: 0.0,
      totalAmount: 3000.0,
      netAmount: 3000.0,
      paidAmount: 3000.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      status: 'GENERATED',
      invoiceStatus: 'GENERATED',
      createdBy: doctor.user.id,
      items: {
        create: [
          {
            category: 'LAB',
            description: 'Complete Blood Count (CBC) with ESR Panel (SAC 999316)',
            quantity: 1,
            unitPrice: 650.0,
            totalPrice: 650.0,
          },
          {
            category: 'LAB',
            description: 'Liver Function Test (LFT) Comprehensive 11 Parameters',
            quantity: 1,
            unitPrice: 1100.0,
            totalPrice: 1100.0,
          },
          {
            category: 'LAB',
            description: 'Kidney Function Test (KFT) with Electrolytes Panel',
            quantity: 1,
            unitPrice: 950.0,
            totalPrice: 950.0,
          },
          {
            category: 'LAB',
            description: 'Fasting Blood Sugar (FBS) Automated Hexokinase',
            quantity: 1,
            unitPrice: 450.0,
            totalPrice: 450.0,
          },
        ],
      },
      lineItems: {
        create: [
          {
            category: 'LAB',
            itemName: 'CBC Panel',
            quantity: 1,
            unitPrice: 650.0,
            amount: 650.0,
          },
          {
            category: 'LAB',
            itemName: 'LFT Comprehensive',
            quantity: 1,
            unitPrice: 1100.0,
            amount: 1100.0,
          },
          {
            category: 'LAB',
            itemName: 'KFT with Electrolytes',
            quantity: 1,
            unitPrice: 950.0,
            amount: 950.0,
          },
          {
            category: 'LAB',
            itemName: 'Fasting Blood Sugar',
            quantity: 1,
            unitPrice: 450.0,
            amount: 450.0,
          },
        ],
      },
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      financeInvoiceId: labInvoice.id,
      amount: 3000.0,
      paymentMethod: 'CASH',
      transactionReference: 'CASH-REC-0921',
      receivedById: doctor.user.id,
    },
  });
  console.log(`✓ Seeded Lab Billing Invoice #${labInvoice.invoiceNumber} (Diagnostic Test Charges: ₹3,000, PAID)`);

  // 9. Seed Pharmacy Dispensary Invoice (Medicine Charges with 12% GST)
  const pharmInvNumber = `INV-PHARM-${Date.now().toString().slice(-5)}`;
  const medSubtotal = 1450.0;
  const medGst = 174.0; // 12% GST
  const medTotal = medSubtotal + medGst;

  const pharmInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: pharmInvNumber,
      patientId: patient.id,
      facilityId: facility.id,
      subtotal: medSubtotal,
      discountAmount: 0.0,
      taxAmount: medGst,
      totalAmount: medTotal,
      netAmount: medTotal,
      paidAmount: medTotal,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      status: 'GENERATED',
      invoiceStatus: 'GENERATED',
      createdBy: doctor.user.id,
      items: {
        create: [
          {
            category: 'PHARMACY',
            description: 'Augmentin 625 Duo (Amoxicillin 500mg + Clavulanate 125mg) - 10 Tabs (HSN 3004)',
            quantity: 2,
            unitPrice: 220.0,
            totalPrice: 440.0,
          },
          {
            category: 'PHARMACY',
            description: 'Pan 40 Gastro-resistant Tablets (Pantoprazole 40mg) - 15 Tabs (HSN 3004)',
            quantity: 3,
            unitPrice: 165.0,
            totalPrice: 495.0,
          },
          {
            category: 'PHARMACY',
            description: 'Dolo 650 (Paracetamol 650mg) - 15 Tabs (HSN 3004)',
            quantity: 3,
            unitPrice: 52.5,
            totalPrice: 157.5,
          },
          {
            category: 'PHARMACY',
            description: 'Montair LC (Montelukast 10mg + Levocetirizine 5mg) - 10 Tabs (HSN 3004)',
            quantity: 2,
            unitPrice: 178.75,
            totalPrice: 357.5,
          },
        ],
      },
      lineItems: {
        create: [
          {
            category: 'PHARMACY',
            itemName: 'Augmentin 625 Duo',
            quantity: 2,
            unitPrice: 220.0,
            amount: 440.0,
          },
          {
            category: 'PHARMACY',
            itemName: 'Pan 40 Tablets',
            quantity: 3,
            unitPrice: 165.0,
            amount: 495.0,
          },
          {
            category: 'PHARMACY',
            itemName: 'Dolo 650 Tablets',
            quantity: 3,
            unitPrice: 52.5,
            amount: 157.5,
          },
          {
            category: 'PHARMACY',
            itemName: 'Montair LC Tablets',
            quantity: 2,
            unitPrice: 178.75,
            amount: 357.5,
          },
        ],
      },
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      financeInvoiceId: pharmInvoice.id,
      amount: medTotal,
      paymentMethod: 'CARD',
      transactionReference: 'POS-SBI-089124',
      receivedById: doctor.user.id,
    },
  });
  console.log(`✓ Seeded Pharmacy Billing Invoice #${pharmInvoice.invoiceNumber} (Medicine Charges: ₹${medSubtotal} + 12% GST: ₹${medGst} = ₹${medTotal})`);

  // 10. Seed Insurance Claims (Create Claim, Claim Tracking, Claim Status)
  const claim1Number = `CLM-STAR-${Date.now().toString().slice(-5)}`;
  const claim1 = await prisma.insuranceClaim.create({
    data: {
      claimNumber: claim1Number,
      patientId: patient.id,
      insuranceProviderId: starHealth.id,
      policyId: policy.id,
      facilityId: facility.id,
      claimType: 'CASHLESS',
      status: 'APPROVED',
      amountClaimed: 51500.0,
      amountApproved: 48000.0,
      amountPaid: 0.0,
      remarks: 'Cashless pre-authorization approved for Laparoscopic Surgery & IPD stay',
    },
  });

  const claim2Number = `CLM-HDFC-${Date.now().toString().slice(-5)}`;
  const claim2 = await prisma.insuranceClaim.create({
    data: {
      claimNumber: claim2Number,
      patientId: patient.id,
      insuranceProviderId: hdfcErgo.id,
      policyId: policy.id,
      facilityId: facility.id,
      claimType: 'REIMBURSEMENT',
      status: 'UNDER_REVIEW',
      amountClaimed: 18500.0,
      amountApproved: 0.0,
      amountPaid: 0.0,
      remarks: 'Outpatient diagnostic panels and emergency stabilization reimbursement claim submitted',
    },
  });

  const claim3Number = `CLM-STAR-${(Date.now() + 1).toString().slice(-5)}`;
  const claim3 = await prisma.insuranceClaim.create({
    data: {
      claimNumber: claim3Number,
      patientId: patient.id,
      insuranceProviderId: starHealth.id,
      policyId: policy.id,
      facilityId: facility.id,
      claimType: 'CASHLESS',
      status: 'SETTLED',
      amountClaimed: 32000.0,
      amountApproved: 32000.0,
      amountPaid: 32000.0,
      remarks: 'Cashless claim settled via NEFT transfer by Star Health TPA',
    },
  });

  console.log(`✓ Seeded 3 Insurance Claims:`);
  console.log(`  • ${claim1.claimNumber} (${claim1.claimType}) - Status: ${claim1.status} | Approved: ₹${claim1.amountApproved}`);
  console.log(`  • ${claim2.claimNumber} (${claim2.claimType}) - Status: ${claim2.status} | Total: ₹${claim2.amountClaimed}`);
  console.log(`  • ${claim3.claimNumber} (${claim3.claimType}) - Status: ${claim3.status} | Settled: ₹${claim3.amountApproved}`);

  console.log('\n--- HOSPITAL BILLING & INSURANCE SEEDING COMPLETE ---');
}

seedHospitalBilling()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
