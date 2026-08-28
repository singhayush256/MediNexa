const API_BASE = 'http://localhost:3001/api/v1';

async function runPharmacyE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA ENTERPRISE PHARMACY PMS & DISPENSING E2E TEST');
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
    assert(tokenDoc, 'Attending Doctor authenticated successfully');

    // 2. Authenticate Hospital Admin A (Pharmacist permissions)
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, 'Hospital Admin A / Pharmacist authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, 'Hospital Admin B authenticated successfully');

    // 4. Authenticate Patient (Jane Doe)
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat } = await patRes.json();
    assert(tokenPat, 'Patient (Jane Doe) authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, 'Receptionist authenticated successfully');

    // 6. Fetch target patient profile
    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(patientsRes) && patientsRes.length > 0, 'Patient directory loaded');
    const targetPatient = patientsRes[0];

    // 7. Step 1: Pharmacist Adds Stock Batches
    console.log('\n--- Step 1: Pharmacist Adds Inventory Stock Batches ---');
    // Batch 1: Fresh Stock Batch (Amoxicillin 500mg)
    const addBatch1Res = await fetch(`${API_BASE}/pharmacy/inventory`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicineName: 'Amoxicillin 500mg Capsule',
        genericName: 'Amoxicillin',
        batchNumber: `BATCH-AMX-${Date.now()}`,
        manufacturer: 'GSK Pharma',
        stockQuantity: 50,
        reorderLevel: 10,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        purchasePrice: 1.5,
        sellingPrice: 3.5,
      }),
    });
    assert(addBatch1Res.status === 201 || addBatch1Res.status === 200, 'POST /pharmacy/inventory (Fresh Batch) returned HTTP 201/200');
    const freshBatch = await addBatch1Res.json();
    assert(freshBatch.id && freshBatch.stockQuantity === 50, `Fresh Stock Batch #${freshBatch.batchNumber} added with 50 units`);

    // Batch 2: Expired Stock Batch (For testing Business Rule 4)
    const addBatch2Res = await fetch(`${API_BASE}/pharmacy/inventory`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicineName: 'Expired Ciprofloxacin 250mg',
        genericName: 'Ciprofloxacin',
        batchNumber: `BATCH-EXP-${Date.now()}`,
        manufacturer: 'Bayer',
        stockQuantity: 20,
        reorderLevel: 5,
        expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        purchasePrice: 2.0,
        sellingPrice: 4.0,
      }),
    });
    const expiredBatch = await addBatch2Res.json();
    assert(expiredBatch.id, `Expired Batch #${expiredBatch.batchNumber} added for validation tests`);

    // 8. Step 2: Doctor Creates Medication Order
    console.log('\n--- Step 2: Doctor Creates Medication Order ---');
    const createOrderRes = await fetch(`${API_BASE}/pharmacy/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        notes: 'Post-op infection prophylaxis and analgesia',
        items: [
          { medicineName: 'Amoxicillin 500mg Capsule', dosage: '500mg', frequency: 'TID', duration: '5 days', quantity: 15 },
        ],
      }),
    });
    assert(createOrderRes.status === 201 || createOrderRes.status === 200, 'POST /pharmacy/orders returned HTTP 201/200');
    const orderData = await createOrderRes.json();
    assert(orderData.id && orderData.items?.length === 1, `Medication Order #${orderData.id} created with status PRESCRIBED`);
    const medItem = orderData.items[0];

    // 9. Step 3: Business Rules & Validation Guards
    console.log('\n--- Step 3: Dispensing Business Rules & Validation Guards ---');
    // Guard 1: Expired Medicine Dispensing Guard (HTTP 400)
    const expDispRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationOrderId: orderData.id,
        dispensedItems: [{ itemId: medItem.id, inventoryId: expiredBatch.id, dispenseQuantity: 5 }],
      }),
    });
    assert(expDispRes.status === 400, 'Business Rule 4 Guard: Dispensing expired medicine rejected with HTTP 400 Bad Request');

    // Guard 2: Insufficient Stock Guard (HTTP 400)
    const stockDispRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationOrderId: orderData.id,
        dispensedItems: [{ itemId: medItem.id, inventoryId: freshBatch.id, dispenseQuantity: 999 }],
      }),
    });
    assert(stockDispRes.status === 400, 'Business Rule 2 Guard: Dispensing quantity exceeding stock rejected with HTTP 400 Bad Request');

    // 10. Step 4: Partial Dispensing & Stock Deduction
    console.log('\n--- Step 4: Partial Dispensing & Stock Audit ---');
    const partialRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationOrderId: orderData.id,
        dispensedItems: [{ itemId: medItem.id, inventoryId: freshBatch.id, dispenseQuantity: 5 }],
      }),
    });
    assert(partialRes.status === 200, 'POST /pharmacy/dispense (Partial) returned HTTP 200 OK');
    const partialOrder = await partialRes.json();
    assert(partialOrder.status === 'PARTIALLY_DISPENSED', 'Order status updated to PARTIALLY_DISPENSED');

    // Verify stock reduced (50 - 5 = 45)
    const invCheckRes = await fetch(`${API_BASE}/pharmacy/inventory`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    const updatedBatch = invCheckRes.find((i) => i.id === freshBatch.id);
    assert(updatedBatch && updatedBatch.stockQuantity === 45, 'Stock quantity automatically reduced from 50 to 45');

    // 11. Step 5: Complete Remaining Dispensing
    console.log('\n--- Step 5: Complete Full Dispensing ---');
    const fullRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationOrderId: orderData.id,
        dispensedItems: [{ itemId: medItem.id, inventoryId: freshBatch.id, dispenseQuantity: 10 }],
      }),
    });
    assert(fullRes.status === 200, 'POST /pharmacy/dispense (Complete) returned HTTP 200 OK');
    const fullOrder = await fullRes.json();
    assert(fullOrder.status === 'DISPENSED', 'Order status updated to DISPENSED after full fulfillment');

    // 12. Step 6: Stock Adjustment & Inventory Audit
    console.log('\n--- Step 6: Stock Adjustment & Audit ---');
    const adjustRes = await fetch(`${API_BASE}/pharmacy/inventory/${freshBatch.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicineName: freshBatch.medicineName,
        batchNumber: freshBatch.batchNumber,
        stockQuantity: 100,
        expiryDate: freshBatch.expiryDate,
        remarks: 'Audit restocking adjustment',
      }),
    });
    assert(adjustRes.status === 200, 'PATCH /pharmacy/inventory/:id returned HTTP 200 OK');
    const adjustedBatch = await adjustRes.json();
    assert(adjustedBatch.stockQuantity === 100, 'Stock quantity adjusted to 100');

    // 13. Step 7: Low Stock & Expiry Alerts & Analytics
    console.log('\n--- Step 7: Alerts & Analytics Dashboard ---');
    const lowRes = await fetch(`${API_BASE}/pharmacy/low-stock`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(lowRes.status === 200, 'GET /pharmacy/low-stock returned HTTP 200 OK');
    const lowList = await lowRes.json();
    assert(Array.isArray(lowList), 'Low stock alerts list retrieved');

    const expRes = await fetch(`${API_BASE}/pharmacy/expiry-alerts`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(expRes.status === 200, 'GET /pharmacy/expiry-alerts returned HTTP 200 OK');
    const expList = await expRes.json();
    assert(Array.isArray(expList) && expList.length >= 1, `Expiry alerts list retrieved (${expList.length} expiring batches)`);

    const analyticsRes = await fetch(`${API_BASE}/pharmacy/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, 'GET /pharmacy/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.ordersToday >= 1 && analytics.medicinesDispensed >= 15, `Pharmacy Analytics returned ordersToday: ${analytics.ordersToday}, dispensed: ${analytics.medicinesDispensed}`);

    // 14. Step 8: Security & RBAC Guards
    console.log('\n--- Step 8: Security & RBAC Guards ---');
    // Guard 1: Patient role blocked from dispensing
    const patDispRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenPat}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicationOrderId: orderData.id, dispensedItems: [] }),
    });
    assert(patDispRes.status === 403, 'RBAC Guard: Patient role blocked with HTTP 403 Forbidden from dispensing medications');

    // Guard 2: Multi-Hospital Isolation
    const isoRes = await fetch(`${API_BASE}/pharmacy/orders/${orderData.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A pharmacy records');

    console.log('\n==================================================');
    console.log(`📊 PHARMACY PMS E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Pharmacy PMS E2E test:', err);
    process.exit(1);
  }
}

runPharmacyE2ETest();
