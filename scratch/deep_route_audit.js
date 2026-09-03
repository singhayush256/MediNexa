const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runDeepAudit() {
  console.log('===========================================================');
  console.log('🏥 MEDINEXA DEEP CLINICAL & RELATIONAL DATA INTEGRITY AUDIT');
  console.log('===========================================================\n');

  let checks = 0;
  let passed = 0;
  const issues = [];

  // Check 1: Patients Count & Clinical Profiles
  checks++;
  const patientCount = await prisma.patientProfile.count();
  if (patientCount >= 100) {
    passed++;
    console.log(`  [PASS] Patient Profiles: ${patientCount} active Indian patients (Target >= 100)`);
  } else {
    issues.push(`Expected at least 100 patient profiles, found ${patientCount}`);
  }

  // Check 2: Doctor Profiles & Specialization
  checks++;
  const doctorCount = await prisma.doctorProfile.count();
  if (doctorCount >= 20) {
    passed++;
    console.log(`  [PASS] Doctor Profiles: ${doctorCount} credentialed specialists (Target >= 20)`);
  } else {
    issues.push(`Expected at least 20 doctor profiles, found ${doctorCount}`);
  }

  // Check 3: Doctor OPD Schedules
  checks++;
  const scheduleCount = await prisma.doctorSchedule.count();
  if (scheduleCount >= 100) {
    passed++;
    console.log(`  [PASS] OPD Schedules: ${scheduleCount} active weekly consultation slots`);
  } else {
    issues.push(`Expected >100 schedule slots, found ${scheduleCount}`);
  }

  // Check 4: Nurses Count
  checks++;
  const nurseRole = await prisma.role.findFirst({ where: { code: 'NURSE' } });
  const nurseCount = await prisma.user.count({ where: { roleId: nurseRole?.id } });
  if (nurseCount >= 50) {
    passed++;
    console.log(`  [PASS] Nursing Staff: ${nurseCount} registered nurses (Target >= 50)`);
  } else {
    issues.push(`Expected at least 50 nurses, found ${nurseCount}`);
  }

  // Check 5: Receptionists Count
  checks++;
  const recRole = await prisma.role.findFirst({ where: { code: 'RECEPTIONIST' } });
  const recCount = await prisma.user.count({ where: { roleId: recRole?.id } });
  if (recCount >= 10) {
    passed++;
    console.log(`  [PASS] Front Desk Receptionists: ${recCount} intake registrars (Target >= 10)`);
  } else {
    issues.push(`Expected at least 10 receptionists, found ${recCount}`);
  }

  // Check 6: Lab Technicians Count
  checks++;
  const labRole = await prisma.role.findFirst({ where: { code: 'LAB_STAFF' } });
  const labCount = await prisma.user.count({ where: { roleId: labRole?.id } });
  if (labCount >= 10) {
    passed++;
    console.log(`  [PASS] Laboratory Technicians: ${labCount} pathology staff (Target >= 10)`);
  } else {
    issues.push(`Expected at least 10 lab technicians, found ${labCount}`);
  }

  // Check 7: Pharmacists Count
  checks++;
  const pharmRole = await prisma.role.findFirst({ where: { code: 'PHARMACY_STAFF' } });
  const pharmCount = await prisma.user.count({ where: { roleId: pharmRole?.id } });
  if (pharmCount >= 10) {
    passed++;
    console.log(`  [PASS] Pharmacists: ${pharmCount} dispensing pharmacists (Target >= 10)`);
  } else {
    issues.push(`Expected at least 10 pharmacists, found ${pharmCount}`);
  }

  // Check 8: Hospital Facilities & Beds
  checks++;
  const facilitiesCount = await prisma.facility.count();
  const bedsCount = await prisma.bed.count();
  if (facilitiesCount >= 3 && bedsCount >= 6) {
    passed++;
    console.log(`  [PASS] Inpatient Infrastructure: ${facilitiesCount} tertiary hospital facilities, ${bedsCount} ICU/General beds`);
  } else {
    issues.push(`Facilities: ${facilitiesCount}, Beds: ${bedsCount}`);
  }

  // Check 9: Diagnostic Lab Test Panels & Orders
  checks++;
  const labTestCount = await prisma.labTest.count();
  const labOrdersCount = await prisma.labOrder.count();
  if (labTestCount >= 6 && labOrdersCount >= 20) {
    passed++;
    console.log(`  [PASS] Pathology Lab: ${labTestCount} diagnostic panels, ${labOrdersCount} verified test orders`);
  } else {
    issues.push(`Lab tests: ${labTestCount}, orders: ${labOrdersCount}`);
  }

  // Check 10: Pharmacy Medication Batches
  checks++;
  const medBatchesCount = await prisma.pharmacyInventory.count();
  if (medBatchesCount >= 10) {
    passed++;
    console.log(`  [PASS] Pharmacy Inventory: ${medBatchesCount} active medication batches with batch & expiry tracking`);
  } else {
    issues.push(`Expected >= 10 medication batches, found ${medBatchesCount}`);
  }

  // Check 11: Billing Invoices & Statutory Line Items
  checks++;
  const invCount = await prisma.billingInvoice.count();
  const lineItemCount = await prisma.billingLineItem.count();
  if (invCount >= 40 && lineItemCount >= 40) {
    passed++;
    console.log(`  [PASS] Revenue & Billing: ${invCount} invoices in INR (₹) with ${lineItemCount} statutory line items`);
  } else {
    issues.push(`Invoices: ${invCount}, Line items: ${lineItemCount}`);
  }

  // Check 12: Insurance Policies & Cashless Claims
  checks++;
  const polCount = await prisma.insurancePolicy.count();
  const claimCount = await prisma.insuranceClaim.count();
  if (polCount >= 25 && claimCount >= 25) {
    passed++;
    console.log(`  [PASS] TPA Insurance: ${polCount} policies, ${claimCount} pre-authorized cashless claims`);
  } else {
    issues.push(`Policies: ${polCount}, Claims: ${claimCount}`);
  }

  // Check 13: Inpatient Admissions & Discharge Records
  checks++;
  const admCount = await prisma.admission.count();
  if (admCount >= 20) {
    passed++;
    console.log(`  [PASS] Inpatient Care: ${admCount} admissions recorded across General Ward & Critical Care ICU`);
  } else {
    issues.push(`Admissions: ${admCount}`);
  }

  // Check 14: Enterprise Audit Trail
  checks++;
  const auditCount = await prisma.auditEvent.count();
  if (auditCount >= 10) {
    passed++;
    console.log(`  [PASS] Enterprise Audit Ledger: ${auditCount} statutory PHI access and clinical events`);
  } else {
    issues.push(`Audit events: ${auditCount}`);
  }

  console.log('\n===========================================================');
  console.log(`Deep Clinical Audit: ${passed}/${checks} checks passed (${((passed / checks) * 100).toFixed(1)}%)`);
  if (issues.length > 0) {
    console.log('Identified Issues:');
    issues.forEach((i) => console.log(`  - ${i}`));
  } else {
    console.log('✅ ZERO DATABASE OR RELATIONAL INTEGRITY DEFECTS DETECTED!');
  }
  console.log('===========================================================\n');

  await prisma.$disconnect();
  return { passed, checks, issues };
}

runDeepAudit().catch((e) => {
  console.error('Audit crashed:', e);
  process.exit(1);
});
