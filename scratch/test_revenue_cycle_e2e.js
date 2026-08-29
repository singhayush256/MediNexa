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

async function runRevenueCycleE2ETests() {
  console.log('==================================================');
  console.log('💰 MEDINEXA ENTERPRISE REVENUE CYCLE & AR RECOVERY PLATFORM E2E TEST');
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

    // 3. Authenticate Attending Doctor / Billing Staff
    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Billing Staff / Physician authenticated successfully');
    const docToken = docAuth.token;

    // 4. Authenticate Patient
    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');
    const patientToken = patientAuth.token;

    // 5. Authenticate Receptionist
    const recepAuth = await login('receptionist@medinexa.local', 'Password123!');
    assert(!!recepAuth.token, 'Receptionist authenticated successfully');
    const recepToken = recepAuth.token;

    // 6. Resolve Target Patient
    const patientMeRes = await fetch(`${BASE_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const targetPatient = await patientMeRes.json();
    assert(!!targetPatient?.id, `Target Patient identified (${targetPatient?.user?.firstName || 'Jane'} ${targetPatient?.user?.lastName || 'Doe'})`);
    const patientId = targetPatient.id;

    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    // 7. Patient blocked from posting AR receivables
    const patArRes = await fetch(`${BASE_URL}/revenue/receivables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ receivableType: 'PATIENT', totalAmount: 500, dueDate: new Date().toISOString() }),
    });
    assert(patArRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from creating AR receivables');

    // 8. Patient blocked from corporate contracts
    const patContRes = await fetch(`${BASE_URL}/revenue/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        companyName: 'Test Corp',
        contractNumber: 'TEST-001',
        contactPerson: 'Jane Doe',
        email: 'test@corp.com',
        phone: '+1234567890',
        creditLimit: 10000,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      }),
    });
    assert(patContRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from registering corporate contracts');

    // 9. Patient blocked from corporate invoices
    const patInvRes = await fetch(`${BASE_URL}/revenue/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ contractId: 'invalid-id', amount: 5000, dueDate: new Date().toISOString() }),
    });
    assert(patInvRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from generating corporate invoices');

    // 10. Patient blocked from RCM dashboard
    const patDashRes = await fetch(`${BASE_URL}/revenue/dashboard`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(patDashRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from accessing RCM dashboard');

    console.log('\n--- Step 2: Accounts Receivable Lifecycle & Aging Engine ---');
    // 11. Create Patient Accounts Receivable
    const pastDueDate = new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(); // 45 days ago -> 31-60 aging bracket
    const createArRes = await fetch(`${BASE_URL}/revenue/receivables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        receivableType: 'PATIENT',
        patientId,
        totalAmount: 2400.0,
        outstandingAmount: 2400.0,
        dueDate: pastDueDate,
        collectionStatus: 'OPEN',
      }),
    });
    const arData = await createArRes.json();
    assert(createArRes.status === 201 || createArRes.status === 200, 'POST /revenue/receivables returned HTTP 201/200');
    assert(arData.id && arData.receivableNumber.startsWith('REC-AR-'), 'Receivable generated with tracking number');
    assert(arData.receivableType === 'PATIENT', 'Receivable type recorded as PATIENT');
    assert(arData.outstandingAmount === 2400.0, 'Outstanding balance recorded as $2,400');
    const receivableId = arData.id;

    // 12. Fetch Receivable by ID
    const getArRes = await fetch(`${BASE_URL}/revenue/receivables/${receivableId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fetchedAr = await getArRes.json();
    assert(getArRes.status === 200, 'GET /revenue/receivables/:id returned HTTP 200 OK');
    assert(fetchedAr.id === receivableId, 'Accounts Receivable ID matches');
    assert(fetchedAr.agingDays >= 40, `Aging Engine: Dynamic aging calculated (${fetchedAr.agingDays} days in arrears)`);

    // 13. List Receivables with Filters
    const listArRes = await fetch(`${BASE_URL}/revenue/receivables?type=PATIENT`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const arList = await listArRes.json();
    assert(listArRes.status === 200, 'GET /revenue/receivables returned HTTP 200 OK');
    assert(Array.isArray(arList) && arList.some((r) => r.id === receivableId), 'Patient receivable listed in facility AR aging queue');

    // 14. Update Receivable Balance
    const updateArRes = await fetch(`${BASE_URL}/revenue/receivables/${receivableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        outstandingAmount: 1400.0,
        collectionStatus: 'FOLLOW_UP',
      }),
    });
    const updatedAr = await updateArRes.json();
    assert(updateArRes.status === 200, 'PATCH /revenue/receivables/:id returned HTTP 200 OK');
    assert(updatedAr.outstandingAmount === 1400.0, 'Outstanding balance reduced to $1,400');
    assert(updatedAr.collectionStatus === 'FOLLOW_UP', 'Collection status updated to FOLLOW_UP');

    console.log('\n--- Step 3: Collections Workstation & Recovery Timeline ---');
    // 15. Log Recovery Activity (Phone Call)
    const logCallRes = await fetch(`${BASE_URL}/revenue/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        receivableId,
        activityType: 'CALL',
        notes: 'Spoke with patient Jane Doe. Agreed on Promise-to-Pay for remaining $1,400 via NetBanking by month-end.',
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      }),
    });
    const callData = await logCallRes.json();
    assert(logCallRes.status === 201 || logCallRes.status === 200, 'POST /revenue/collections (Phone Call) returned HTTP 201/200');
    assert(callData.activityType === 'CALL', 'Activity type logged as CALL');
    assert(callData.notes.includes('Promise-to-Pay'), 'Recovery interaction notes saved');

    // 16. Verify Auto-Transition to PROMISE_TO_PAY
    const arAfterCall = await (await fetch(`${BASE_URL}/revenue/receivables/${receivableId}`, { headers: { Authorization: `Bearer ${adminAToken}` } })).json();
    assert(arAfterCall.collectionStatus === 'PROMISE_TO_PAY', 'Receivable auto-advanced to PROMISE_TO_PAY');

    // 17. Query Collection Activity History
    const listActRes = await fetch(`${BASE_URL}/revenue/collections?receivableId=${receivableId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const actList = await listActRes.json();
    assert(listActRes.status === 200, 'GET /revenue/collections returned HTTP 200 OK');
    assert(Array.isArray(actList) && actList.length >= 1, 'Collection recovery audit trail retrieved');

    console.log('\n--- Step 4: Corporate Contracts & Credit Limit Management ---');
    // 18. Register Corporate Contract
    const contNum = `CORP-TEST-${Date.now().toString().slice(-4)}`;
    const createContRes = await fetch(`${BASE_URL}/revenue/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        companyName: 'Infosys BPM Healthcare Partnerships',
        contractNumber: contNum,
        contactPerson: 'Ananya Deshmukh',
        email: 'partnerships@infosys.com',
        phone: '+91-80-2852-0261',
        creditLimit: 750000.0,
        paymentTermsDays: 45,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      }),
    });
    const contData = await createContRes.json();
    assert(createContRes.status === 201 || createContRes.status === 200, 'POST /revenue/contracts returned HTTP 201/200');
    assert(contData.contractNumber === contNum, `Corporate Contract #${contNum} registered`);
    assert(contData.creditLimit === 750000.0, 'Credit limit capped at $750,000');
    assert(contData.paymentTermsDays === 45, 'Payment terms set to Net 45 Days');
    const contractId = contData.id;

    // 19. List Corporate Contracts
    const listContRes = await fetch(`${BASE_URL}/revenue/contracts`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const contList = await listContRes.json();
    assert(listContRes.status === 200, 'GET /revenue/contracts returned HTTP 200 OK');
    assert(Array.isArray(contList) && contList.some((c) => c.id === contractId), 'Corporate partner listed in contract registry');

    // 20. Update Corporate Contract Terms
    const updateContRes = await fetch(`${BASE_URL}/revenue/contracts/${contractId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({ creditLimit: 850000.0 }),
    });
    const updatedCont = await updateContRes.json();
    assert(updateContRes.status === 200, 'PATCH /revenue/contracts/:id returned HTTP 200 OK');
    assert(updatedCont.creditLimit === 850000.0, 'Corporate credit limit expanded to $850,000');

    console.log('\n--- Step 5: Corporate Invoices & Automatic AR Posting ---');
    // 21. Generate Corporate Invoice
    const createInvRes = await fetch(`${BASE_URL}/revenue/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        contractId,
        amount: 45000.0,
        dueDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
      }),
    });
    const invData = await createInvRes.json();
    assert(createInvRes.status === 201 || createInvRes.status === 200, 'POST /revenue/invoices returned HTTP 201/200');
    assert(invData.id && invData.invoiceNumber.startsWith('INV-CORP-'), 'Corporate Invoice generated');
    assert(invData.amount === 45000.0, 'Invoice billed amount is $45,000');
    assert(invData.balanceAmount === 45000.0, 'Initial invoice balance is $45,000');
    const invoiceId = invData.id;

    // 22. List Corporate Invoices
    const listInvRes = await fetch(`${BASE_URL}/revenue/invoices?contractId=${contractId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const invList = await listInvRes.json();
    assert(listInvRes.status === 200, 'GET /revenue/invoices returned HTTP 200 OK');
    assert(Array.isArray(invList) && invList.some((i) => i.id === invoiceId), 'Invoice present in corporate ledger');

    // 23. Verify Linked Corporate Accounts Receivable Auto-Created
    const corpArList = await (await fetch(`${BASE_URL}/revenue/receivables?type=CORPORATE`, { headers: { Authorization: `Bearer ${adminAToken}` } })).json();
    const linkedCorpAr = corpArList.find((r) => r.corporateInvoiceId === invoiceId);
    assert(!!linkedCorpAr, 'AccountsReceivable auto-posted for Corporate Invoice');
    assert(linkedCorpAr?.totalAmount === 45000.0, 'Corporate AR total amount matches invoice ($45,000)');

    // 24. Settle Corporate Invoice Payment
    const payInvRes = await fetch(`${BASE_URL}/revenue/invoices/${invoiceId}/pay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        paidAmount: 45000.0,
        paymentReference: `TXN-CORP-REMIT-${Date.now()}`,
      }),
    });
    const paidInvData = await payInvRes.json();
    assert(payInvRes.status === 200, 'PATCH /revenue/invoices/:id/pay returned HTTP 200 OK');
    assert(paidInvData.status === 'PAID', 'Corporate invoice status transitioned to PAID');
    assert(paidInvData.balanceAmount === 0, 'Corporate invoice balance reduced to $0');

    // 25. Verify Linked Corporate AR Settled
    const corpArAfterPay = await (await fetch(`${BASE_URL}/revenue/receivables/${linkedCorpAr.id}`, { headers: { Authorization: `Bearer ${adminAToken}` } })).json();
    assert(corpArAfterPay.outstandingAmount === 0, 'Corporate AR outstanding balance settled to $0');
    assert(corpArAfterPay.collectionStatus === 'RECOVERED', 'Corporate AR marked as RECOVERED');

    console.log('\n--- Step 6: Payment Allocation Engine ---');
    // 26. Allocate Lumpsum Payment to Patient Receivable
    const allocRes = await fetch(`${BASE_URL}/revenue/payments/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        paymentReference: `ALLOC-REMIT-${Date.now().toString().slice(-4)}`,
        amount: 1400.0,
        allocatedTo: receivableId,
        notes: 'Final settlement via UPI remittance',
      }),
    });
    const allocData = await allocRes.json();
    assert(allocRes.status === 201 || allocRes.status === 200, 'POST /revenue/payments/allocate returned HTTP 201/200');
    assert(allocData.amount === 1400.0, 'Payment allocated for $1,400');

    // 27. Verify Patient Receivable Cleared to Zero
    const patientArAfterAlloc = await (await fetch(`${BASE_URL}/revenue/receivables/${receivableId}`, { headers: { Authorization: `Bearer ${adminAToken}` } })).json();
    assert(patientArAfterAlloc.outstandingAmount === 0, 'Patient AR outstanding balance cleared to $0');
    assert(patientArAfterAlloc.collectionStatus === 'RECOVERED', 'Patient AR collection status transitioned to RECOVERED');

    console.log('\n--- Step 7: Forward Revenue Forecasting ---');
    // 28. Create Financial Forecast
    const nextMonth = '2026-10';
    const createForeRes = await fetch(`${BASE_URL}/revenue/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        forecastMonth: nextMonth,
        projectedRevenue: 480000.0,
        projectedCollections: 435000.0,
        projectedOutstanding: 45000.0,
      }),
    });
    const foreData = await createForeRes.json();
    assert(createForeRes.status === 201 || createForeRes.status === 200, 'POST /revenue/forecast returned HTTP 201/200');
    assert(foreData.forecastMonth === nextMonth, `Forecast created for ${nextMonth}`);
    assert(foreData.projectedRevenue === 480000.0, 'Projected revenue set to $480,000');

    // 29. List Financial Forecasts
    const listForeRes = await fetch(`${BASE_URL}/revenue/forecast`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const foreList = await listForeRes.json();
    assert(listForeRes.status === 200, 'GET /revenue/forecast returned HTTP 200 OK');
    assert(Array.isArray(foreList) && foreList.some((f) => f.forecastMonth === nextMonth), 'Forecast present in financial planning series');

    console.log('\n--- Step 8: Revenue Cycle Command Dashboard ---');
    // 30. Query RCM Dashboard
    const dashRes = await fetch(`${BASE_URL}/revenue/dashboard`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, 'GET /revenue/dashboard returned HTTP 200 OK');
    assert(dashData.revenueMonth !== undefined, `Dashboard: Revenue Month: $${dashData.revenueMonth?.toLocaleString()}`);
    assert(dashData.collectionsMonth !== undefined, `Dashboard: Collections Month: $${dashData.collectionsMonth?.toLocaleString()}`);
    assert(dashData.outstandingAR !== undefined, `Dashboard: Outstanding AR: $${dashData.outstandingAR?.toLocaleString()}`);
    assert(dashData.collectionRate !== undefined, `Dashboard: Collection Rate: ${dashData.collectionRate}%`);
    assert(dashData.agingDistribution && typeof dashData.agingDistribution === 'object', 'Dashboard: AR Aging distribution brackets calculated');
    assert(dashData.activeCorporateContracts !== undefined, `Dashboard: Active Corporate Contracts: ${dashData.activeCorporateContracts}`);

    console.log('\n--- Step 9: Multi-Hospital Isolation Guard ---');
    // 37. Hospital B Admin blocked from accessing Hospital A corporate contract
    const crossContRes = await fetch(`${BASE_URL}/revenue/contracts?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossContRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from requesting Hospital A corporate contracts');

    // 38. Hospital B Admin blocked from accessing Hospital A AR dashboard
    const crossDashRes = await fetch(`${BASE_URL}/revenue/dashboard?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossDashRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A revenue dashboard');

    // 39. Hospital B Admin blocked from accessing Hospital A forecast
    const crossForeRes = await fetch(`${BASE_URL}/revenue/forecast?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossForeRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A revenue forecast');

    // 40. Hospital B Admin blocked from accessing Hospital A receivables
    const crossRecRes = await fetch(`${BASE_URL}/revenue/receivables?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossRecRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A receivables list');

    console.log('\n==================================================');
    console.log(`💰 REVENUE CYCLE & AR E2E RESULT: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log('==================================================\n');

    if (failedAssertions > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal execution error during Revenue Cycle E2E test:', err);
    process.exit(1);
  }
}

runRevenueCycleE2ETests();
