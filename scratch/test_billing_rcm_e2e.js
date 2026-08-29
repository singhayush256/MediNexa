const BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${passedAssertions + 1}. ${message}`);
    passedAssertions++;
  } else {
    console.error(`❌ [FAIL] ${passedAssertions + failedAssertions + 1}. ${message}`);
    failedAssertions++;
  }
}

async function runBillingRcmE2ETests() {
  console.log('==================================================');
  console.log('💰 MEDINEXA REVENUE CYCLE MANAGEMENT & ADVANCED BILLING E2E TEST');
  console.log('==================================================\n');

  try {
    const login = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { token: data.accessToken || data.token, user: data.user };
    };

    // 1. Authenticate Hospital Admin A
    const adminAAuth = await login('admin.hospa@medinexa.local', 'Password123!');
    assert(!!adminAAuth.token, 'Hospital Admin A authenticated successfully');
    const adminAToken = adminAAuth.token;

    // 2. Authenticate Hospital Admin B
    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B authenticated successfully');
    const adminBToken = adminBAuth.token;

    // 3. Authenticate Attending Physician
    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Attending Physician authenticated successfully');
    const docToken = docAuth.token;

    // 4. Authenticate Patient
    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');
    const patientToken = patientAuth.token;

    // 5. Resolve target patient
    const patientMeRes = await fetch(`${BASE_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const targetPatient = await patientMeRes.json();
    assert(!!targetPatient?.id, `Target Patient identified (${targetPatient?.user?.firstName || 'Jane'} ${targetPatient?.user?.lastName || 'Doe'})`);
    const patientId = targetPatient.id;

    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    // 6. Patient blocked from generating invoices
    const patientInvRes = await fetch(`${BASE_URL}/billing/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ patientId, items: [{ unitPrice: 100 }] }),
    });
    assert(patientInvRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from generating invoices');

    // 7. Patient blocked from collecting payments
    const patientPayRes = await fetch(`${BASE_URL}/billing/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ invoiceId: 'dummy-inv', amount: 100 }),
    });
    assert(patientPayRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from collecting payments');

    // 8. Doctor blocked from approving refunds (Only Admin/Accountant permitted)
    const docRefundRes = await fetch(`${BASE_URL}/billing/refunds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({ invoiceId: 'dummy-inv', amount: 50, reason: 'Unauthorized Refund' }),
    });
    assert(docRefundRes.status === 403, 'RBAC Guard: Physician blocked with HTTP 403 Forbidden from approving financial refunds');

    console.log('\n--- Step 2: Invoice Creation & Itemized Charging ---');
    // 9. Generate Enterprise Hospital Bill
    const createInvRes = await fetch(`${BASE_URL}/billing/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        patientId,
        discountAmount: 20,
        taxAmount: 10,
        items: [
          {
            category: 'OPD',
            description: 'Comprehensive Specialist Consultation',
            quantity: 1,
            unitPrice: 120,
          },
          {
            category: 'PHARMACY',
            description: 'Amoxicillin-Clavulanate 625mg Course',
            quantity: 2,
            unitPrice: 25,
          },
        ],
      }),
    });
    const invData = await createInvRes.json();
    assert(createInvRes.status === 201 || createInvRes.status === 200, 'POST /billing/invoices returned HTTP 201/200');
    assert(invData.invoiceNumber.startsWith('INV-'), `Invoice number generated: ${invData.invoiceNumber}`);
    assert(invData.subtotal === 170, 'Subtotal correctly calculated as $170 (120 + 2*25)');
    assert(invData.totalAmount === 160, 'Total Amount correctly calculated as $160 (170 - 20 + 10)');
    assert(invData.balanceAmount === 160, 'Initial balance due matches total amount ($160)');
    assert(invData.paymentStatus === 'PENDING', 'Initial paymentStatus is PENDING');
    const invoiceId = invData.id;

    console.log('\n--- Step 3: Dynamic Service Charge Add-on ---');
    // 10. Add itemized charge (Lab Diagnostic)
    const addItemRes = await fetch(`${BASE_URL}/billing/invoices/${invoiceId}/add-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        category: 'LAB',
        description: 'Complete Blood Count (CBC) with Differential',
        quantity: 1,
        unitPrice: 90,
      }),
    });
    const updatedInv = await addItemRes.json();
    assert(addItemRes.status === 201 || addItemRes.status === 200, 'POST /billing/invoices/:id/add-item returned HTTP 201/200');
    assert(updatedInv.subtotal === 260, 'Subtotal updated to $260 after adding Lab test ($90)');
    assert(updatedInv.totalAmount === 250, 'Total Amount updated to $250 (260 - 20 + 10)');
    assert(updatedInv.balanceAmount === 250, 'Balance due updated to $250');

    console.log('\n--- Step 4: Multi-Payor Split Payment Collection ---');
    // 11. Record Partial Payment 1 (Cash: $100)
    const pay1Res = await fetch(`${BASE_URL}/billing/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        invoiceId,
        amount: 100,
        paymentMethod: 'CASH',
        transactionReference: `CASH-RCPT-${Date.now().toString().slice(-4)}`,
      }),
    });
    assert(pay1Res.status === 201 || pay1Res.status === 200, 'POST /billing/payments (Split 1: Cash $100) returned HTTP 201/200');

    // 12. Verify Invoice Status Updated to PARTIALLY_PAID
    const invAfterPay1 = await (await fetch(`${BASE_URL}/billing/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    })).json();
    assert(invAfterPay1.paidAmount === 100, 'Paid amount updated to $100');
    assert(invAfterPay1.balanceAmount === 150, 'Balance due decreased to $150');
    assert(invAfterPay1.paymentStatus === 'PARTIAL' || invAfterPay1.status === 'PARTIALLY_PAID', 'Invoice status updated to PARTIALLY_PAID / PARTIAL');

    // 13. Record Split Payment 2 (Card: $150 to settle balance)
    const pay2Res = await fetch(`${BASE_URL}/billing/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        invoiceId,
        amount: 150,
        paymentMethod: 'CARD',
        transactionReference: `CARD-TXN-${Date.now().toString().slice(-4)}`,
      }),
    });
    assert(pay2Res.status === 201 || pay2Res.status === 200, 'POST /billing/payments (Split 2: Card $150) returned HTTP 201/200');

    // 14. Verify Invoice Status Fully PAID
    const invAfterPay2 = await (await fetch(`${BASE_URL}/billing/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    })).json();
    assert(invAfterPay2.paidAmount === 250, 'Paid amount updated to $250');
    assert(invAfterPay2.balanceAmount === 0, 'Balance due is $0');
    assert(invAfterPay2.paymentStatus === 'PAID', 'Invoice paymentStatus is PAID');
    assert(invAfterPay2.payments && invAfterPay2.payments.length === 2, 'Invoice records both split payment transactions');

    console.log('\n--- Step 5: Refund & Reversal Engine ---');
    // 15. Process Partial Refund
    const refundRes = await fetch(`${BASE_URL}/billing/refunds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        invoiceId,
        amount: 50,
        reason: 'Service discount voucher applied retroactively',
      }),
    });
    const refundData = await refundRes.json();
    assert(refundRes.status === 201 || refundRes.status === 200, 'POST /billing/refunds (Admin approval) returned HTTP 201/200');
    assert(refundData.amount === 50, 'Refund transaction recorded for $50');

    // 16. Verify Invoice Reversal Balance
    const invAfterRefund = await (await fetch(`${BASE_URL}/billing/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    })).json();
    assert(invAfterRefund.paidAmount === 200, 'Paid amount adjusted to $200 after $50 refund');
    assert(invAfterRefund.refunds && invAfterRefund.refunds.length === 1, 'Refund record linked in invoice audit history');

    console.log('\n--- Step 6: Revenue Ledger & Realization ---');
    // 17. Fetch Revenue Ledger
    const revenueRes = await fetch(`${BASE_URL}/billing/revenue`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const revData = await revenueRes.json();
    assert(revenueRes.status === 200, 'GET /billing/revenue returned HTTP 200 OK');
    assert(revData.totalRevenue > 0, `Total Revenue Realized: $${revData.totalRevenue}`);
    assert(revData.categoryBreakdown && Object.keys(revData.categoryBreakdown).length > 0, 'Revenue breakdown tracks departmental categories');
    assert(revData.categoryBreakdown.OPD !== undefined, 'Revenue ledger tracks OPD consultation postings');
    assert(revData.categoryBreakdown.PHARMACY !== undefined, 'Revenue ledger tracks PHARMACY postings');
    assert(revData.categoryBreakdown.LAB !== undefined, 'Revenue ledger tracks LAB diagnostics postings');

    console.log('\n--- Step 7: RCM KPI Analytics & AR Aging ---');
    // 18. Fetch Billing Analytics
    const analyticsRes = await fetch(`${BASE_URL}/billing/analytics`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200, 'GET /billing/analytics returned HTTP 200 OK');
    assert(analyticsData.revenueToday !== undefined, `Analytics: Revenue Today: $${analyticsData.revenueToday?.toLocaleString()}`);
    assert(analyticsData.revenueThisMonth !== undefined, `Analytics: Revenue This Month: $${analyticsData.revenueThisMonth?.toLocaleString()}`);
    assert(analyticsData.outstandingPayments !== undefined, `Analytics: Outstanding Payments: $${analyticsData.outstandingPayments?.toLocaleString()}`);
    assert(analyticsData.collectionRate !== undefined, `Analytics: Collection Rate: ${analyticsData.collectionRate}`);
    assert(analyticsData.topRevenueDepartments && analyticsData.topRevenueDepartments.length > 0, 'Analytics: Top revenue departments ranked');
    assert(analyticsData.arAgingBuckets && analyticsData.arAgingBuckets.current_0_30_days !== undefined, 'Analytics: AR Aging buckets calculated');

    console.log('\n--- Step 8: Multi-Hospital Isolation Guard ---');
    // 19. Hospital B Admin blocked from accessing Hospital A invoice
    const crossInvRes = await fetch(`${BASE_URL}/billing/invoices/${invoiceId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossInvRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A invoice');

    console.log('\n==================================================');
    console.log(`💰 BILLING & RCM E2E RESULT: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log('==================================================\n');

    if (failedAssertions > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal execution error during Billing RCM E2E test:', error);
    process.exit(1);
  }
}

runBillingRcmE2ETests();
