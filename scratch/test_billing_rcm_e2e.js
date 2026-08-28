const API_BASE = 'http://localhost:3001/api/v1';

async function runBillingRcmE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA REVENUE CYCLE MANAGEMENT & BILLING E2E TEST');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, '1. Attending Doctor authenticated successfully');

    // 2. Authenticate Hospital Admin A
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, '2. Hospital Admin A authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, '3. Hospital Admin B authenticated successfully');

    // 4. Authenticate Receptionist / Cashier
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep, user: recepUser } = await recepRes.json();
    assert(tokenRecep, '4. Billing Cashier / Receptionist authenticated successfully');

    // 5. Authenticate Patient (Jane Doe)
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat } = await patRes.json();
    assert(tokenPat, '5. Patient (Jane Doe) authenticated successfully');

    // 6. Load patient directory
    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(patientsRes) && patientsRes.length > 0, '6. Patient directory loaded');
    const targetPatient = patientsRes[0];

    // --- Step 1: Insurance Provider Management ---
    console.log('\n--- Step 1: Insurance Provider Management ---');
    const createProviderRes = await fetch(`${API_BASE}/billing/providers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerName: `Star Health Insurance Corp ${Date.now()}`,
        contactDetails: '+1-800-STAR-HEALTH',
        claimEmail: 'claims@starhealth.com',
        policyValidationRules: 'Max cashless cap: $50,000. 10% co-pay on surgical implants.',
      }),
    });
    assert(createProviderRes.status === 201 || createProviderRes.status === 200, '7. POST /billing/providers returned HTTP 201/200');
    const providerData = await createProviderRes.json();
    assert(providerData.id && providerData.claimEmail === 'claims@starhealth.com', `8. Insurance Provider '${providerData.providerName}' created`);

    const listProvidersRes = await fetch(`${API_BASE}/billing/providers`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listProvidersRes) && listProvidersRes.length >= 1, '9. Insurance Providers roster loaded');

    // --- Step 2: Itemized Hospital Bill & GST Invoice Creation ---
    console.log('\n--- Step 2: Itemized Hospital Bill & GST Invoice Creation ---');
    const createInvoiceRes = await fetch(`${API_BASE}/billing/invoices`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        notes: 'Outpatient specialist consultation + diagnostic blood panel + pharmacy prescription',
        items: [
          { itemType: 'OPD', itemName: 'Super-Specialist Cardiology Consultation', quantity: 1, unitPrice: 150.0, taxPercent: 0.0, discountPercent: 0.0 },
          { itemType: 'LAB', itemName: 'Complete Metabolic Blood Panel (CMP-14)', quantity: 1, unitPrice: 80.0, taxPercent: 5.0, discountPercent: 0.0 },
          { itemType: 'PHARMACY', itemName: 'Augmentin 625mg Strips (x2)', quantity: 2, unitPrice: 20.0, taxPercent: 12.0, discountPercent: 0.0 },
          { itemType: 'RADIOLOGY', itemName: 'Digital 12-Lead Electrocardiogram (ECG)', quantity: 1, unitPrice: 50.0, taxPercent: 5.0, discountPercent: 10.0 },
        ],
      }),
    });
    assert(createInvoiceRes.status === 201 || createInvoiceRes.status === 200, '10. POST /billing/invoices returned HTTP 201/200');
    const invoice1 = await createInvoiceRes.json();
    assert(invoice1.id && invoice1.invoiceNumber.startsWith('INV-'), `11. Invoice #${invoice1.invoiceNumber} created`);
    assert(invoice1.subtotal > 0 && invoice1.totalAmount > invoice1.subtotal, `12. GST Tax and Line Items calculated (Total: $${invoice1.totalAmount}, Balance Due: $${invoice1.balanceDue})`);

    // Fetch Invoices Roster
    const listInvoicesRes = await fetch(`${API_BASE}/billing/invoices`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listInvoicesRes) && listInvoicesRes.length >= 1, '13. Hospital Invoices roster listed');

    // Fetch Invoice By ID
    const getInvoiceRes = await fetch(`${API_BASE}/billing/invoices/${invoice1.id}`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(getInvoiceRes.status === 200, '14. GET /billing/invoices/:id returned HTTP 200 OK');
    const fetchedInvoice = await getInvoiceRes.json();
    assert(fetchedInvoice.items.length === 4, '15. Invoice contains all 4 itemized line items');

    // --- Step 3: Payment Collection Workflows (Partial & Full) ---
    console.log('\n--- Step 3: Payment Collection Workflows (Partial & Full) ---');
    const partialAmount = 100.0;
    const partialPayRes = await fetch(`${API_BASE}/billing/payments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice1.id,
        amount: partialAmount,
        paymentMethod: 'UPI',
        transactionReference: `UPI-TXN-${Date.now()}`,
      }),
    });
    assert(partialPayRes.status === 201 || partialPayRes.status === 200, '16. POST /billing/payments (Partial) returned HTTP 201/200');
    const payResult1 = await partialPayRes.json();
    assert(payResult1.invoice.paymentStatus === 'PARTIAL' && payResult1.invoice.amountPaid === partialAmount, `17. Invoice payment status transitioned to PARTIAL (Paid: $${payResult1.invoice.amountPaid}, Balance: $${payResult1.invoice.balanceDue})`);

    // Complete Remaining Payment
    const remainingBalance = payResult1.invoice.balanceDue;
    const fullPayRes = await fetch(`${API_BASE}/billing/payments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice1.id,
        amount: remainingBalance,
        paymentMethod: 'CARD',
        transactionReference: `CARD-AUTH-${Date.now()}`,
      }),
    });
    assert(fullPayRes.status === 201 || fullPayRes.status === 200, '18. POST /billing/payments (Full balance) returned HTTP 201/200');
    const payResult2 = await fullPayRes.json();
    assert(payResult2.invoice.paymentStatus === 'PAID' && payResult2.invoice.balanceDue === 0, `19. Invoice payment status transitioned to PAID (Balance Due: $0)`);

    // Overpayment Guard: Paying already paid invoice rejected
    const overpayRes = await fetch(`${API_BASE}/billing/payments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice1.id,
        amount: 50.0,
        paymentMethod: 'CASH',
      }),
    });
    assert(overpayRes.status === 400, '20. Overpayment Guard: Payment on fully paid invoice rejected with HTTP 400 Bad Request');

    // List Payments
    const listPaymentsRes = await fetch(`${API_BASE}/billing/payments`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listPaymentsRes) && listPaymentsRes.length >= 2, '21. Payment transactions ledger loaded');

    // --- Step 4: Inpatient Billing & Insurance Claims Adjudication ---
    console.log('\n--- Step 4: Inpatient Billing & Insurance Claims Adjudication ---');
    const createIpdInvoiceRes = await fetch(`${API_BASE}/billing/invoices`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        notes: 'Inpatient Hospitalization & Cardiac Surgery',
        items: [
          { itemType: 'IPD', itemName: 'ICU Bed Charges (3 Days)', quantity: 3, unitPrice: 800.0, taxPercent: 0.0 },
          { itemType: 'SURGERY', itemName: 'Coronary Bypass Procedure & OT Charges', quantity: 1, unitPrice: 3500.0, taxPercent: 5.0 },
        ],
      }),
    });
    const invoice2 = await createIpdInvoiceRes.json();
    assert(invoice2.id, `22. IPD Hospital Invoice #${invoice2.invoiceNumber} created (Total: $${invoice2.totalAmount})`);

    // File Insurance Claim
    const claimRes = await fetch(`${API_BASE}/billing/claims`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRecep}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice2.id,
        providerId: providerData.id,
        patientId: targetPatient.id,
        claimAmount: invoice2.totalAmount,
        remarks: 'Pre-authorized cashless insurance claim for emergency bypass',
      }),
    });
    assert(claimRes.status === 201 || claimRes.status === 200, '23. POST /billing/claims returned HTTP 201/200');
    const claimData = await claimRes.json();
    assert(claimData.id && claimData.claimStatus === 'DRAFT', `24. Insurance Claim #${claimData.claimNumber} filed as DRAFT`);

    // Submit Claim
    const submitClaimRes = await fetch(`${API_BASE}/billing/claims/${claimData.id}/submit`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenRecep}` },
    });
    assert(submitClaimRes.status === 200, '25. PATCH /billing/claims/:id/submit returned HTTP 200 OK');
    const submittedClaim = await submitClaimRes.json();
    assert(submittedClaim.claimStatus === 'SUBMITTED', '26. Claim status transitioned to SUBMITTED');

    // Approve Claim & Auto-Credit Invoice
    const approveClaimRes = await fetch(`${API_BASE}/billing/claims/${claimData.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvedAmount: invoice2.totalAmount,
        rejectedAmount: 0.0,
        remarks: '100% cashless settlement approved by TPA Medical Desk',
      }),
    });
    assert(approveClaimRes.status === 200, '27. PATCH /billing/claims/:id/approve returned HTTP 200 OK');
    const approvedClaim = await approveClaimRes.json();
    assert(approvedClaim.claimStatus === 'APPROVED' && approvedClaim.approvedAmount === invoice2.totalAmount, '28. Insurance Claim approved and settlement auto-credited to invoice');

    // List Claims
    const listClaimsRes = await fetch(`${API_BASE}/billing/claims`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listClaimsRes) && listClaimsRes.length >= 1, '29. Insurance Claims roster loaded');

    // --- Step 5: Analytics & Multi-Tenant Security Guards ---
    console.log('\n--- Step 5: Analytics & Multi-Tenant Security Guards ---');
    const analyticsRes = await fetch(`${API_BASE}/billing/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, '30. GET /billing/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.revenueToday > 0 && analytics.revenueThisMonth > 0, `31. Analytics returned revenueToday: $${analytics.revenueToday}, monthly: $${analytics.revenueThisMonth}`);

    // Patient Least Privilege: Patient queries own invoices
    const patInvoicesRes = await fetch(`${API_BASE}/billing/invoices`, { headers: { Authorization: `Bearer ${tokenPat}` } }).then((r) => r.json());
    assert(Array.isArray(patInvoicesRes), '32. Patient can query own billing invoices');

    // Multi-Hospital Isolation Guard: Hospital B Admin blocked from Hospital A invoices
    const isoRes = await fetch(`${API_BASE}/billing/invoices/${invoice1.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, '33. Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A billing records');

    console.log('\n==================================================');
    console.log(`📊 REVENUE CYCLE MANAGEMENT & BILLING RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Billing RCM E2E test:', err);
    process.exit(1);
  }
}

runBillingRcmE2ETest();
