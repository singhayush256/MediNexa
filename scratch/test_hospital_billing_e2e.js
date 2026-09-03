const assert = require('assert');

async function login(email, password = 'Password123!') {
  const res = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}`);
  const data = await res.json();
  return { token: data.token || data.accessToken, user: data.user };
}

async function testHospitalBilling() {
  console.log('===========================================================');
  console.log('🏥 TESTING COMPLETE HOSPITAL BILLING & INSURANCE SYSTEM (E2E)');
  console.log('===========================================================\n');

  const BASE_URL = 'http://localhost:3001/api/v1';

  // 1. Staff Login
  console.log('STEP 1: Authenticating Hospital Admin / Billing Officer...');
  const staff = await login('admin@medinexa.in');
  console.log(`  Staff logged in: ${staff.user.firstName} ${staff.user.lastName} (${staff.user.role?.code || 'ADMIN'})`);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staff.token}`,
  };

  // Get a patient ID
  const patientsRes = await fetch(`${BASE_URL}/patients`, { headers });
  const ptsData = await patientsRes.json();
  const patientList = Array.isArray(ptsData) ? ptsData : ptsData.data || [];
  const patientId = patientList[0]?.id || '98eb2b37-1511-498f-a066-19cd487639e0';
  console.log(`  Using Patient ID: ${patientId}`);

  // 2. OPD Billing: Consultation Fee
  console.log('\nSTEP 2: Testing OPD Billing (Doctor Consultation Fee)...');
  const opdRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      patientId,
      discountAmount: 0,
      taxAmount: 0,
      items: [
        {
          category: 'OPD',
          description: 'Specialist Doctor Consultation Fee - Dr. Arvind Deshmukh (SAC 999311)',
          quantity: 1,
          unitPrice: 800,
        },
      ],
    }),
  });
  assert.strictEqual(opdRes.status, 201, 'OPD Invoice creation must return 201');
  const opdInvoice = await opdRes.json();
  assert(opdInvoice.totalAmount === 800, 'OPD invoice total must be 800');
  console.log(`  [PASS] OPD Consultation Invoice created: #${opdInvoice.invoiceNumber} (Total: ₹${opdInvoice.totalAmount})`);

  // 3. IPD Billing: Bed Charges, Doctor Charges, Procedure Charges
  console.log('\nSTEP 3: Testing IPD Billing (Bed Charges, Doctor Charges, Procedure Charges)...');
  const ipdBedCharge = 3 * 4500; // 13,500
  const ipdDocCharge = 5 * 1000; // 5,000
  const ipdProcCharge = 35000;   // 35,000
  const ipdExpectedSubtotal = ipdBedCharge + ipdDocCharge + ipdProcCharge; // 53,500
  const ipdDiscount = 2000;

  const ipdRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      patientId,
      discountAmount: ipdDiscount,
      taxAmount: 0,
      items: [
        {
          category: 'IPD',
          description: 'ICU / Critical Care Bed Charges (3 Days @ ₹4,500/day) - SAC 999312',
          quantity: 3,
          unitPrice: 4500,
        },
        {
          category: 'IPD',
          description: 'Inpatient Senior Consultant Daily Rounds & Doctor Charges (5 Visits)',
          quantity: 5,
          unitPrice: 1000,
        },
        {
          category: 'IPD',
          description: 'Surgical Procedure: Laparoscopic Cholecystectomy & OT Charges',
          quantity: 1,
          unitPrice: 35000,
        },
      ],
    }),
  });
  assert.strictEqual(ipdRes.status, 201, 'IPD Invoice creation must return 201');
  const ipdInvoice = await ipdRes.json();
  assert.strictEqual(ipdInvoice.subtotal, ipdExpectedSubtotal);
  assert.strictEqual(ipdInvoice.totalAmount, ipdExpectedSubtotal - ipdDiscount);
  console.log(`  [PASS] IPD Comprehensive Invoice created: #${ipdInvoice.invoiceNumber}`);
  console.log(`    • Bed Charges: ₹${ipdBedCharge}`);
  console.log(`    • Doctor Charges: ₹${ipdDocCharge}`);
  console.log(`    • Procedure Charges: ₹${ipdProcCharge}`);
  console.log(`    • Net Total Payable: ₹${ipdInvoice.totalAmount}`);

  // 4. Lab Billing: Diagnostic Test Charges
  console.log('\nSTEP 4: Testing Lab Billing (Diagnostic Test Charges)...');
  const labRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      patientId,
      discountAmount: 0,
      taxAmount: 0,
      items: [
        { category: 'LAB', description: 'Complete Blood Count (CBC) with ESR (SAC 999316)', quantity: 1, unitPrice: 650 },
        { category: 'LAB', description: 'Liver Function Test (LFT) Comprehensive (SAC 999316)', quantity: 1, unitPrice: 1100 },
        { category: 'LAB', description: 'Kidney Function Test (KFT) with Electrolytes (SAC 999316)', quantity: 1, unitPrice: 950 },
      ],
    }),
  });
  assert.strictEqual(labRes.status, 201, 'Lab Invoice creation must return 201');
  const labInvoice = await labRes.json();
  assert.strictEqual(labInvoice.totalAmount, 2700);
  console.log(`  [PASS] Lab Diagnostics Invoice created: #${labInvoice.invoiceNumber} (Total: ₹${labInvoice.totalAmount})`);

  // 5. Pharmacy Billing: Medicine Charges with 12% GST
  console.log('\nSTEP 5: Testing Pharmacy Billing (Medicine Charges + GST)...');
  const medSubtotal = 2 * 220 + 3 * 165 + 3 * 52.5; // 440 + 495 + 157.5 = 1092.5
  const medGst = Math.round(medSubtotal * 0.12 * 100) / 100; // 131.1
  const medTotal = medSubtotal + medGst;

  const pharmRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      patientId,
      discountAmount: 0,
      taxAmount: medGst,
      items: [
        { category: 'PHARMACY', description: 'Augmentin 625 Duo - HSN 3004', quantity: 2, unitPrice: 220 },
        { category: 'PHARMACY', description: 'Pan 40 Gastro-resistant Tablets - HSN 3004', quantity: 3, unitPrice: 165 },
        { category: 'PHARMACY', description: 'Dolo 650 Tablets - HSN 3004', quantity: 3, unitPrice: 52.5 },
      ],
    }),
  });
  assert.strictEqual(pharmRes.status, 201, 'Pharmacy Invoice creation must return 201');
  const pharmInvoice = await pharmRes.json();
  assert.strictEqual(pharmInvoice.subtotal, medSubtotal);
  assert.strictEqual(pharmInvoice.taxAmount, medGst);
  assert.strictEqual(pharmInvoice.totalAmount, medTotal);
  console.log(`  [PASS] Pharmacy GST Tax Invoice created: #${pharmInvoice.invoiceNumber}`);
  console.log(`    • Medicine Subtotal: ₹${pharmInvoice.subtotal}`);
  console.log(`    • Statutory 12% GST: ₹${pharmInvoice.taxAmount}`);
  console.log(`    • Net Invoice Total: ₹${pharmInvoice.totalAmount}`);

  // 6. Insurance: Create Claim, Claim Tracking, Claim Status
  console.log('\nSTEP 6: Testing Insurance Claims Lifecycle...');
  const providersRes = await fetch(`${BASE_URL}/insurance/providers`, { headers });
  const providers = await providersRes.json();
  const providerId = providers[0]?.id;

  // 6a. Create Claim
  console.log('  6a. Creating Insurance Claim...');
  const claimCreateRes = await fetch(`${BASE_URL}/billing/claims`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      patientId,
      providerId,
      claimAmount: 51500,
      claimType: 'CASHLESS',
      remarks: 'Planned laparoscopic surgical hospitalization coverage',
    }),
  });
  const newClaim = await claimCreateRes.json();
  if (claimCreateRes.status !== 201) {
    console.log('Claim create error:', JSON.stringify(newClaim, null, 2));
  }
  assert.strictEqual(claimCreateRes.status, 201, 'Claim creation must return 201');
  assert(newClaim.claimNumber && newClaim.id, 'Claim must have number and ID');
  console.log(`    [PASS] Claim Draft Created: #${newClaim.claimNumber} (Amount: ₹${newClaim.totalClaimAmount || newClaim.amountClaimed})`);

  // 6b. Claim Tracking
  console.log('  6b. Tracking Claims Roster...');
  const claimsListRes = await fetch(`${BASE_URL}/billing/claims`, { headers });
  const claimsList = await claimsListRes.json();
  assert(Array.isArray(claimsList) && claimsList.length > 0, 'Must return array of claims');
  const foundClaim = claimsList.find((c) => c.id === newClaim.id);
  assert(foundClaim, 'Created claim must be traceable in tracking roster');
  console.log(`    [PASS] Claim #${foundClaim.claimNumber} tracked successfully. Current Status: ${foundClaim.status}`);

  // 6c. Claim Status Transitions: Submit -> Approve
  console.log('  6c. Advancing Claim Status (Submit -> Approve)...');
  const submitRes = await fetch(`${BASE_URL}/billing/claims/${newClaim.id}/submit`, {
    method: 'PATCH',
    headers,
  });
  assert.strictEqual(submitRes.status, 200, 'Claim submit must return 200');
  const submittedClaim = await submitRes.json();
  assert.strictEqual(submittedClaim.status, 'CLAIM_SUBMITTED');
  console.log(`    [PASS] Claim Status updated to: ${submittedClaim.status}`);

  const approveRes = await fetch(`${BASE_URL}/billing/claims/${newClaim.id}/approve`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ approvedAmount: 48000 }),
  });
  assert.strictEqual(approveRes.status, 200, 'Claim approve must return 200');
  const approvedClaim = await approveRes.json();
  assert.strictEqual(approvedClaim.status, 'APPROVED');
  assert.strictEqual(approvedClaim.approvedAmount, 48000);
  console.log(`    [PASS] Claim Status updated to: ${approvedClaim.status} (Approved: ₹${approvedClaim.approvedAmount})`);

  // 7. Test Recording Payment on Invoice
  console.log('\nSTEP 7: Testing Payment Collection on Invoices...');
  const payRes = await fetch(`${BASE_URL}/billing/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      invoiceId: opdInvoice.id,
      amount: 800,
      paymentMethod: 'UPI',
      transactionReference: 'UPI-TEST-881920',
    }),
  });
  assert.strictEqual(payRes.status, 201, 'Payment record must return 201');
  console.log(`  [PASS] Payment of ₹800 recorded via UPI on Invoice #${opdInvoice.invoiceNumber}`);

  console.log('\n===========================================================');
  console.log('🎉 ALL HOSPITAL BILLING & INSURANCE REQUIREMENTS VALIDATED (100% PASS)!');
  console.log('===========================================================\n');
}

testHospitalBilling().catch((err) => {
  console.error('\n❌ HOSPITAL BILLING TEST FAILED:', err);
  process.exit(1);
});
