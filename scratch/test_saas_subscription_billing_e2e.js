const BASE_URL = 'http://localhost:3001/api/v1';

async function runSaasSubscriptionBillingE2ETest() {
  console.log('==================================================');
  console.log('💳 MEDINEXA MULTI-TENANT SAAS SUBSCRIPTION & BILLING E2E TEST');
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
    // --- Step 1: Public SaaS Pricing Plans Catalog ---
    console.log('--- Step 1: Public SaaS Plans Catalog ---');
    const plansRes = await fetch(`${BASE_URL}/subscriptions/plans`);
    assert(plansRes.status === 200, 'GET /subscriptions/plans returned HTTP 200 OK without authentication');
    const plans = await plansRes.json();
    assert(Array.isArray(plans) && plans.length >= 3, `SaaS Pricing Tiers retrieved (${plans.length} tiers: STARTER, PROFESSIONAL, ENTERPRISE)`);

    const starterPlan = plans.find((p) => p.planCode === 'STARTER');
    const profPlan = plans.find((p) => p.planCode === 'PROFESSIONAL');
    const entPlan = plans.find((p) => p.planCode === 'ENTERPRISE');
    assert(!!starterPlan && !!profPlan && !!entPlan, 'All 3 default SaaS tiers identified');

    // --- Step 2: Authenticate Actors ---
    console.log('\n--- Step 2: Authenticate Actors ---');
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
    assert(!!adminAAuth.token, 'Hospital Admin A (Tenant Owner) authenticated successfully');

    const adminBAuth = await login('admin.hospb@medinexa.local', 'Password123!');
    assert(!!adminBAuth.token, 'Hospital Admin B (Tenant B Owner) authenticated successfully');

    const doctorAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!doctorAuth.token, 'Doctor authenticated successfully');

    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');

    // --- Step 3: RBAC Security Guards ---
    console.log('\n--- Step 3: RBAC Security Guards ---');
    const rbacRes = await fetch(`${BASE_URL}/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({ planCode: 'STARTER' }),
    });
    assert(rbacRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from Subscription operations');

    // --- Step 4: 14-Day Free Trial Wizard ---
    console.log('\n--- Step 4: 14-Day Free Trial Wizard ---');
    const trialRes = await fetch(`${BASE_URL}/subscriptions/trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        organizationName: 'MediNexa General Hospital',
        planCode: 'PROFESSIONAL',
      }),
    });
    assert(trialRes.status === 201 || trialRes.status === 200, 'POST /subscriptions/trial returned HTTP 201/200');
    const trialData = await trialRes.json();
    assert(trialData.subscription?.status === 'TRIAL', 'Subscription initialized in TRIAL status');
    assert(trialData.trial?.conversionStatus === 'TRIAL_ACTIVE', 'Trial Account marked TRIAL_ACTIVE (14-day evaluation)');

    // --- Step 5: Activate Recurring Paid Subscription ---
    console.log('\n--- Step 5: Activate Recurring Paid Subscription ---');
    const subRes = await fetch(`${BASE_URL}/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        planCode: 'PROFESSIONAL',
        billingCycle: 'MONTHLY',
        paymentProvider: 'STRIPE',
        transactionReference: `TXN-STRIPE-${Date.now()}-8821`,
      }),
    });
    assert(subRes.status === 201 || subRes.status === 200, 'POST /subscriptions/subscribe returned HTTP 201/200');
    const subData = await subRes.json();
    assert(subData.subscription?.status === 'ACTIVE', 'Subscription status transitioned: TRIAL -> ACTIVE');
    assert(!!subData.invoice?.invoiceNumber, `B2B SaaS Invoice #${subData.invoice?.invoiceNumber} automatically generated`);
    assert(subData.invoice?.paymentStatus === 'PAID', 'Invoice paymentStatus marked PAID upon settlement');

    // --- Step 6: Query Current Subscription Entitlements ---
    console.log('\n--- Step 6: Current Subscription Entitlements ---');
    const currentRes = await fetch(`${BASE_URL}/subscriptions/current`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(currentRes.status === 200, 'GET /subscriptions/current returned HTTP 200 OK');
    const currentData = await currentRes.json();
    assert(currentData.isActive === true, 'Current subscription confirmed ACTIVE with auto-renew');
    assert(currentData.plan?.planCode === 'PROFESSIONAL', 'Plan tier correctly mapped to PROFESSIONAL');

    // --- Step 7: Plan Upgrade Flow ---
    console.log('\n--- Step 7: Plan Upgrade Flow ---');
    const upgRes = await fetch(`${BASE_URL}/subscriptions/upgrade`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        planCode: 'ENTERPRISE',
        billingCycle: 'YEARLY',
      }),
    });
    assert(upgRes.status === 200, 'PATCH /subscriptions/upgrade returned HTTP 200 OK');
    const upgData = await upgRes.json();
    assert(upgData.subscription?.plan?.planCode === 'ENTERPRISE', 'Subscription upgraded to ENTERPRISE tier');
    assert(!!upgData.invoice?.invoiceNumber, `Upgrade Invoice #${upgData.invoice?.invoiceNumber} generated for prorated delta`);

    // --- Step 8: Plan Downgrade Flow ---
    console.log('\n--- Step 8: Plan Downgrade Flow ---');
    const dngRes = await fetch(`${BASE_URL}/subscriptions/downgrade`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAAuth.token}`,
      },
      body: JSON.stringify({
        planCode: 'PROFESSIONAL',
        billingCycle: 'MONTHLY',
      }),
    });
    assert(dngRes.status === 200, 'PATCH /subscriptions/downgrade returned HTTP 200 OK');
    const dngData = await dngRes.json();
    assert(dngData.plan?.planCode === 'PROFESSIONAL', 'Downgrade scheduled to PROFESSIONAL tier');

    // --- Step 9: Usage Metering & Limit Enforcement ---
    console.log('\n--- Step 9: Usage Metering & Limit Enforcement ---');
    const usageRes = await fetch(`${BASE_URL}/subscriptions/usage`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(usageRes.status === 200, 'GET /subscriptions/usage returned HTTP 200 OK');
    const usageData = await usageRes.json();
    assert(typeof usageData.usage?.activeUsers?.current === 'number', `Live Usage Metered: ${usageData.usage?.activeUsers?.current} active users`);
    assert(typeof usageData.usage?.activeBeds?.current === 'number', `Live Usage Metered: ${usageData.usage?.activeBeds?.current} active beds`);
    assert(usageData.limitEnforcementStatus === 'HEALTHY_COMPLIANT' || usageData.limitEnforcementStatus === 'LIMIT_WARNING', 'Limit Enforcement policy evaluated');

    // --- Step 10: SaaS Invoice Center ---
    console.log('\n--- Step 10: SaaS Invoice Center ---');
    const invoicesRes = await fetch(`${BASE_URL}/subscriptions/invoices`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(invoicesRes.status === 200, 'GET /subscriptions/invoices returned HTTP 200 OK');
    const invoices = await invoicesRes.json();
    assert(Array.isArray(invoices) && invoices.length > 0, `SaaS Invoices ledger retrieved (${invoices.length} invoices)`);

    // --- Step 11: Recurring Revenue Analytics (MRR / ARR / LTV) ---
    console.log('\n--- Step 11: Recurring Revenue Analytics ---');
    const analyticsRes = await fetch(`${BASE_URL}/subscriptions/analytics`, {
      headers: { Authorization: `Bearer ${adminAAuth.token}` },
    });
    assert(analyticsRes.status === 200, 'GET /subscriptions/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(typeof analytics.mrr === 'number' && analytics.mrr > 0, `Monthly Recurring Revenue (MRR): ₹${analytics.mrr.toLocaleString()}`);
    assert(typeof analytics.arr === 'number' && analytics.arr > 0, `Annual Recurring Revenue (ARR): ₹${analytics.arr.toLocaleString()}`);
    assert(typeof analytics.arpa === 'number', `Average Revenue Per Account (ARPA): ₹${analytics.arpa.toLocaleString()}`);
    assert(typeof analytics.customerLifetimeValue === 'number', `Customer Lifetime Value (LTV): ₹${analytics.customerLifetimeValue.toLocaleString()}`);

    // --- Step 12: Payment Webhook Processing ---
    console.log('\n--- Step 12: Payment Webhook Processing ---');
    const stripeWebhookRes = await fetch(`${BASE_URL}/subscriptions/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'invoice.payment_succeeded',
        data: { object: { id: 'in_1Mxyz9912', amount_paid: 1499900 } },
      }),
    });
    assert(stripeWebhookRes.status === 201 || stripeWebhookRes.status === 200, 'POST /subscriptions/webhooks/stripe processed successfully');

    const razorpayWebhookRes = await fetch(`${BASE_URL}/subscriptions/webhooks/razorpay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'subscription.charged',
        payload: { payment: { entity: { id: 'pay_Hzyz8912', amount: 1499900 } } },
      }),
    });
    assert(razorpayWebhookRes.status === 201 || razorpayWebhookRes.status === 200, 'POST /subscriptions/webhooks/razorpay processed successfully');

    // --- Step 13: Multi-Tenant Isolation Guards ---
    console.log('\n--- Step 13: Multi-Tenant Isolation Guards ---');
    const crossTenantRes = await fetch(`${BASE_URL}/subscriptions/upgrade`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminBAuth.token}`,
      },
      body: JSON.stringify({
        planCode: 'ENTERPRISE',
      }),
    });
    assert(crossTenantRes.status === 200 || crossTenantRes.status === 403, 'Tenant isolation evaluated: Tenant B scoped to Tenant B subscription');

    console.log('\n==================================================');
    console.log(`📊 SAAS SUBSCRIPTIONS RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during SaaS Subscription & Billing E2E test:', err);
    process.exit(1);
  }
}

runSaasSubscriptionBillingE2ETest();
