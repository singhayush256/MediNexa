const BASE_URL = 'http://localhost:3001/api/v1';

async function runFinanceE2ETest() {
  console.log('==================================================');
  console.log('💰 MEDINEXA ENTERPRISE FINANCIAL MANAGEMENT & GL E2E TEST');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${passed + failed + 1}. ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${passed + failed + 1}. ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Actors
    const login = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { token: data.accessToken || data.token, user: data.user };
    };

    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A (Finance Director) authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');

    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Senior Clinician authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');

    // Retrieve target patient profile
    const patProfRes = await fetch(`${BASE_URL}/patient-portal/profile`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    const patientProfile = await patProfRes.json();
    assert(!!patientProfile.id, `Target Patient identified (${patientProfile.user?.firstName} ${patientProfile.user?.lastName})`);

    // --- Step 1: RBAC Security Guards ---
    console.log('\n--- Step 1: RBAC Security Guards ---');
    const patRefundRes = await fetch(`${BASE_URL}/finance/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({
        invoiceId: 'invalid-id',
        amount: 500,
        reason: 'Unauthorized refund',
      }),
    });
    assert(patRefundRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from approving financial refunds');

    // --- Step 2: Healthcare Invoice Generation ---
    console.log('\n--- Step 2: Healthcare Invoice Generation ---');
    const invoicePayload = {
      patientId: patientProfile.id,
      lineItems: [
        { category: 'OPD', itemName: 'Executive Cardiology Specialist Consultation', quantity: 1, unitPrice: 200.0 },
        { category: 'LAB', itemName: 'Comprehensive Metabolic Panel & Lipid Profile', quantity: 1, unitPrice: 150.0 },
        { category: 'PHARMACY', itemName: 'Rosuvastatin 20mg + Telmisartan 40mg Course', quantity: 2, unitPrice: 45.0 },
        { category: 'PROCEDURE', itemName: '12-Lead Diagnostic Electrocardiogram (ECG)', quantity: 1, unitPrice: 110.0 },
      ],
      discountAmount: 50.0,
      taxAmount: 35.0,
    };

    const createInvRes = await fetch(`${BASE_URL}/finance/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify(invoicePayload),
    });
    assert(createInvRes.status === 201 || createInvRes.status === 200, 'POST /finance/invoices returned HTTP 201/200');
    const invoice = await createInvRes.json();
    assert(!!invoice.invoiceNumber, `Billing Invoice generated (#${invoice.invoiceNumber})`);
    assert(invoice.totalAmount === 550.0, 'Invoice subtotal correctly computed: $550.00');
    assert(invoice.netAmount === 535.0, 'Invoice net amount correctly computed: $535.00 ($550 - $50 + $35)');
    assert(invoice.paymentStatus === 'PENDING', 'Initial invoice payment status is PENDING');
    assert(invoice.invoiceStatus === 'GENERATED', 'Initial invoice status is GENERATED');
    assert(Array.isArray(invoice.lineItems) && invoice.lineItems.length === 4, 'Invoice line items saved with 4 multi-departmental records');

    // --- Step 3: Query Invoices & Details ---
    console.log('\n--- Step 3: Query Invoices & Details ---');
    const getInvsRes = await fetch(`${BASE_URL}/finance/invoices`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getInvsRes.status === 200, 'GET /finance/invoices returned HTTP 200 OK');
    const invoicesList = await getInvsRes.json();
    assert(Array.isArray(invoicesList) && invoicesList.length > 0, `Invoice directory loaded (${invoicesList.length} invoices)`);

    const getInvDetailRes = await fetch(`${BASE_URL}/finance/invoices/${invoice.id}`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getInvDetailRes.status === 200, 'GET /finance/invoices/:id returned HTTP 200 OK');
    const invDetail = await getInvDetailRes.json();
    assert(invDetail.id === invoice.id, 'Invoice detail retrieved with patient linkage and line items');

    // --- Step 4: Partial Payment Processing ---
    console.log('\n--- Step 4: Partial Payment Processing ---');
    const pmt1Res = await fetch(`${BASE_URL}/finance/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        paymentMethod: 'UPI',
        amount: 235.0,
        transactionReference: 'UPI-REF-99281734',
      }),
    });
    assert(pmt1Res.status === 201 || pmt1Res.status === 200, 'POST /finance/payments (Partial) returned HTTP 201/200');
    const pmt1Data = await pmt1Res.json();
    assert(pmt1Data.invoice.paymentStatus === 'PARTIAL', 'Invoice payment status transitioned to PARTIAL');
    assert(pmt1Data.remainingBalance === 300.0, 'Remaining balance accurately calculated: $300.00 ($535 - $235)');

    // --- Step 5: Overpayment Safety Guard ---
    console.log('\n--- Step 5: Overpayment Safety Guard ---');
    const overPmtRes = await fetch(`${BASE_URL}/finance/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        paymentMethod: 'CASH',
        amount: 500.0, // Exceeds remaining $300.00
      }),
    });
    assert(overPmtRes.status === 400, 'Safety Guard: Overpayment exceeding remaining balance rejected with HTTP 400 Bad Request');

    // --- Step 6: Full Payment Settlement ---
    console.log('\n--- Step 6: Full Payment Settlement ---');
    const pmt2Res = await fetch(`${BASE_URL}/finance/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        paymentMethod: 'CARD',
        amount: 300.0,
        transactionReference: 'CARD-AUTH-654321',
      }),
    });
    assert(pmt2Res.status === 201 || pmt2Res.status === 200, 'POST /finance/payments (Full Settlement) returned HTTP 201/200');
    const pmt2Data = await pmt2Res.json();
    assert(pmt2Data.invoice.paymentStatus === 'PAID', 'Invoice payment status transitioned to PAID');
    assert(pmt2Data.invoice.invoiceStatus === 'FINALIZED', 'Invoice status transitioned to FINALIZED');
    assert(pmt2Data.remainingBalance === 0, 'Remaining balance is $0.00');

    // --- Step 7: Excessive Refund Guard ---
    console.log('\n--- Step 7: Excessive Refund Guard ---');
    const excessRefundRes = await fetch(`${BASE_URL}/finance/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        amount: 1000.0, // Exceeds settled $535.00
        reason: 'Excessive refund attempt',
      }),
    });
    assert(excessRefundRes.status === 400, 'Safety Guard: Refund exceeding total settled receipts rejected with HTTP 400 Bad Request');

    // --- Step 8: Approved Refund Processing ---
    console.log('\n--- Step 8: Approved Refund Processing ---');
    const refundRes = await fetch(`${BASE_URL}/finance/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        amount: 110.0,
        reason: 'ECG diagnostic fee waiver post clinical review',
      }),
    });
    assert(refundRes.status === 201 || refundRes.status === 200, 'POST /finance/refunds returned HTTP 201/200');
    const refundData = await refundRes.json();
    assert(refundData.refund.amount === 110.0, 'Refund of $110.00 recorded with administrative approval');
    assert(refundData.invoice.paymentStatus === 'PARTIAL', 'Invoice payment status updated post refund');

    // --- Step 9: Departmental Cost Center Management ---
    console.log('\n--- Step 9: Departmental Cost Center Management ---');
    const costCenterPayload = {
      name: 'Department of Cardiology & Cardiovascular Surgery',
      code: `CC-CARDIO-${Date.now().toString().slice(-4)}`,
      budgetAmount: 500000.0,
    };
    const createCcRes = await fetch(`${BASE_URL}/finance/cost-centers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify(costCenterPayload),
    });
    assert(createCcRes.status === 201 || createCcRes.status === 200, 'POST /finance/cost-centers returned HTTP 201/200');
    const costCenter = await createCcRes.json();
    assert(costCenter.budgetAmount === 500000.0, `Cost Center ${costCenter.name} configured with $500,000 budget`);

    const getCcRes = await fetch(`${BASE_URL}/finance/cost-centers`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getCcRes.status === 200, 'GET /finance/cost-centers returned HTTP 200 OK');
    const costCenters = await getCcRes.json();
    assert(Array.isArray(costCenters) && costCenters.length > 0, `Cost centers loaded (${costCenters.length} active cost centers)`);

    // --- Step 10: General Ledger & Double-Entry Journal Posting ---
    console.log('\n--- Step 10: General Ledger & Double-Entry Journal Posting ---');
    const getGlRes = await fetch(`${BASE_URL}/finance/gl`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(getGlRes.status === 200, 'GET /finance/gl returned HTTP 200 OK');
    const glData = await getGlRes.json();
    assert(Array.isArray(glData.accounts) && glData.accounts.length >= 5, `Chart of accounts loaded (${glData.accounts?.length} GL accounts)`);
    assert(glData.trialBalance.isBalanced === true, 'Trial Balance is balanced (Total Debits & Credits reconciled)');

    const cashAcc = glData.accounts.find((a) => a.accountCode === '1010-CASH') || glData.accounts[0];
    const expAcc = glData.accounts.find((a) => a.accountCode === '5010-EXP-CLINICAL') || glData.accounts[1];

    const postJeRes = await fetch(`${BASE_URL}/finance/journal-entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        debitAccountId: expAcc.id,
        creditAccountId: cashAcc.id,
        amount: 2500.0,
        narration: 'Monthly diagnostic reagent supply disbursement',
      }),
    });
    assert(postJeRes.status === 201 || postJeRes.status === 200, 'POST /finance/journal-entry returned HTTP 201/200');
    const journalEntry = await postJeRes.json();
    assert(!!journalEntry.entryNumber, `Balanced Journal Voucher posted (#${journalEntry.entryNumber} for $2,500.00)`);

    // --- Step 11: Financial Intelligence Reports Engine ---
    console.log('\n--- Step 11: Financial Intelligence Reports Engine ---');
    const revRepRes = await fetch(`${BASE_URL}/finance/reports/revenue`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(revRepRes.status === 200, 'GET /finance/reports/revenue returned HTTP 200 OK');
    const revReport = await revRepRes.json();
    assert(typeof revReport.totalNetRevenue === 'number', `Revenue Report: Total Net Revenue: $${revReport.totalNetRevenue.toLocaleString()}`);

    const colRepRes = await fetch(`${BASE_URL}/finance/reports/collections`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(colRepRes.status === 200, 'GET /finance/reports/collections returned HTTP 200 OK');
    const colReport = await colRepRes.json();
    assert(typeof colReport.totalCollections === 'number', `Collections Report: Total Collections: $${colReport.totalCollections.toLocaleString()}`);

    const outRepRes = await fetch(`${BASE_URL}/finance/reports/outstanding`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(outRepRes.status === 200, 'GET /finance/reports/outstanding returned HTTP 200 OK');
    const outReport = await outRepRes.json();
    assert(typeof outReport.totalOutstanding === 'number', `Outstanding Receivables: $${outReport.totalOutstanding.toLocaleString()}`);

    const profRepRes = await fetch(`${BASE_URL}/finance/reports/profitability`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(profRepRes.status === 200, 'GET /finance/reports/profitability returned HTTP 200 OK');
    const profReport = await profRepRes.json();
    assert(typeof profReport.profitMarginPct === 'number', `Profitability Report: Operating Profit Margin: ${profReport.profitMarginPct}%`);

    // --- Step 12: Multi-Hospital Isolation Guards ---
    console.log('\n--- Step 12: Multi-Hospital Isolation Guards ---');
    const crossInvRes = await fetch(`${BASE_URL}/finance/invoices?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBAuth.token}` },
    });
    assert(crossInvRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A finance records');

    console.log('\n==================================================');
    console.log(`📊 FINANCE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Finance E2E test:', err);
    process.exit(1);
  }
}

runFinanceE2ETest();
