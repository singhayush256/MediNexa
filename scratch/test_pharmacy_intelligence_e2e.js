const API_BASE = 'http://localhost:3001/api/v1';

async function runPharmacyIntelligenceE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA PHARMACY MANAGEMENT & INVENTORY INTELLIGENCE E2E TEST');
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

    // 2. Authenticate Hospital Admin A (Pharmacist / Admin)
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, '2. Hospital Admin A / Pharmacist authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, '3. Hospital Admin B authenticated successfully');

    // 4. Authenticate Ward Nurse
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse, user: nurseUser } = await nurseRes.json();
    assert(tokenNurse, '4. Ward Nurse (Witness) authenticated successfully');

    // 5. Authenticate Patient (Jane Doe)
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat } = await patRes.json();
    assert(tokenPat, '5. Patient (Jane Doe) authenticated successfully');

    // 6. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, '6. Receptionist authenticated successfully');

    // 7. Load patient directory
    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(patientsRes) && patientsRes.length > 0, '7. Patient directory loaded');
    const targetPatient = patientsRes[0];

    // --- Step 1: Drug Catalog Management ---
    console.log('\n--- Step 1: Drug Catalog Management ---');
    const createDrugRes = await fetch(`${API_BASE}/pharmacy/drugs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: `DRUG-INTEL-${Date.now()}`,
        name: 'Augmentin 625mg Tablet',
        genericName: 'Amoxicillin + Clavulanic Acid',
        strength: '625mg',
        form: 'TABLET',
        manufacturer: 'GSK Pharmaceuticals Ltd',
        hsnCode: '30049099',
        gstPercentage: 18.0,
        category: 'ANTIBIOTIC',
        unitOfMeasure: 'STRIP',
        isControlled: false,
        reorderLevel: 20,
      }),
    });
    assert(createDrugRes.status === 201 || createDrugRes.status === 200, '8. POST /pharmacy/drugs returned HTTP 201/200');
    const drugData = await createDrugRes.json();
    assert(drugData.id && drugData.hsnCode === '30049099', `9. Master Drug '${drugData.name}' created with HSN ${drugData.hsnCode} and GST ${drugData.gstPercentage}%`);

    const listDrugsRes = await fetch(`${API_BASE}/pharmacy/drugs`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listDrugsRes) && listDrugsRes.length >= 1, '10. Drug Catalog roster loaded');

    // --- Step 2: Vendor Purchase Orders & GRN Receiving ---
    console.log('\n--- Step 2: Vendor Purchase Orders & GRN Receiving ---');
    const createPoRes = await fetch(`${API_BASE}/pharmacy/purchase-orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierName: 'Apollo WholeSale Pharma Distributors',
        items: [{ drugMasterId: drugData.id, quantityOrdered: 200, unitPrice: 15.0 }],
      }),
    });
    assert(createPoRes.status === 201 || createPoRes.status === 200, '11. POST /pharmacy/purchase-orders returned HTTP 201/200');
    const poData = await createPoRes.json();
    assert(poData.id && poData.poNumber.startsWith('PO-'), `12. Vendor Purchase Order #${poData.poNumber} created successfully`);

    const listPoRes = await fetch(`${API_BASE}/pharmacy/purchase-orders`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listPoRes) && listPoRes.length >= 1, '13. Purchase Orders roster loaded');

    // Process Goods Receipt Note (GRN)
    const grnRes = await fetch(`${API_BASE}/pharmacy/grn`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purchaseOrderId: poData.id,
        remarks: 'Goods received, batch verified for QC',
        items: [
          {
            drugMasterId: drugData.id,
            batchNumber: `BATCH-AUG-${Date.now()}`,
            expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
            quantityReceived: 200,
            unitCost: 15.0,
            unitPrice: 28.0,
          },
        ],
      }),
    });
    assert(grnRes.status === 201 || grnRes.status === 200, '14. POST /pharmacy/grn returned HTTP 201/200');
    const grnData = await grnRes.json();
    assert(grnData.id && grnData.grnNumber.startsWith('GRN-'), `15. Goods Receipt Note #${grnData.grnNumber} generated successfully`);

    const listGrnRes = await fetch(`${API_BASE}/pharmacy/grn`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listGrnRes) && listGrnRes.length >= 1, '16. Goods Receipt Notes roster loaded');

    // --- Step 3: Controlled Drug Dual-Authorization Compliance ---
    console.log('\n--- Step 3: Controlled Drug Dual-Authorization Compliance ---');
    const invalidAuditRes = await fetch(`${API_BASE}/pharmacy/audits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drugMasterId: drugData.id,
        drugBatchId: grnData.items[0].drugBatchId,
        action: 'DISPENSE',
        quantity: 5,
        witnessNurseId: '',
      }),
    });
    assert(invalidAuditRes.status === 400, '17. Controlled Drug Guard: Missing witness nurse rejected with HTTP 400 Bad Request');

    const validAuditRes = await fetch(`${API_BASE}/pharmacy/audits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drugMasterId: drugData.id,
        drugBatchId: grnData.items[0].drugBatchId,
        patientId: targetPatient.id,
        action: 'DISPENSE',
        quantity: 5,
        witnessNurseId: nurseUser.id,
        remarks: 'Controlled substance dual-authorization verified',
      }),
    });
    assert(validAuditRes.status === 201 || validAuditRes.status === 200, '18. POST /pharmacy/audits returned HTTP 201/200');
    const auditData = await validAuditRes.json();
    assert(auditData.id && auditData.witnessNurseId === nurseUser.id, '19. Controlled drug audit trail logged with witness nurse sign-off');

    const listAuditsRes = await fetch(`${API_BASE}/pharmacy/audits`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listAuditsRes) && listAuditsRes.length >= 1, '20. Controlled drug audit logs loaded');

    // --- Step 4: Prescription Fulfillment & Dispensing ---
    console.log('\n--- Step 4: Prescription Fulfillment & Dispensing ---');
    const createOrderRes = await fetch(`${API_BASE}/pharmacy/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        notes: 'Outpatient treatment protocol',
        items: [{ medicineName: drugData.name, dosage: '625mg', frequency: 'BD', duration: '5 days', quantity: 10 }],
      }),
    });
    const orderData = await createOrderRes.json();
    assert(orderData.id, `21. Prescription Order #${orderData.id} created successfully`);

    const invRes = await fetch(`${API_BASE}/pharmacy/inventory`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(invRes) && invRes.length > 0, '22. Pharmacy inventory roster loaded');
    const matchedInv = invRes.find((i) => i.medicineName === drugData.name) || invRes[0];

    // Partial Dispense
    const partialDispenseRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationOrderId: orderData.id,
        dispensedItems: [{ itemId: orderData.items[0].id, inventoryId: matchedInv.id, dispenseQuantity: 5 }],
      }),
    });
    assert(partialDispenseRes.status === 200, '23. POST /pharmacy/dispense (Partial) returned HTTP 200 OK');

    // Complete Dispense
    const completeDispenseRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationOrderId: orderData.id,
        dispensedItems: [{ itemId: orderData.items[0].id, inventoryId: matchedInv.id, dispenseQuantity: 5 }],
      }),
    });
    assert(completeDispenseRes.status === 200, '24. POST /pharmacy/dispense (Complete) returned HTTP 200 OK');

    // --- Step 5: Alerts & Expiry Engine (30/60/90 days) ---
    console.log('\n--- Step 5: Alerts & Expiry Engine (30/60/90 days) ---');
    const lowStockRes = await fetch(`${API_BASE}/pharmacy/low-stock`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(lowStockRes.status === 200, '25. GET /pharmacy/low-stock returned HTTP 200 OK');

    const exp30Res = await fetch(`${API_BASE}/pharmacy/expiry-alerts?days=30`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(exp30Res.status === 200, '26. GET /pharmacy/expiry-alerts?days=30 returned HTTP 200 OK');

    const exp60Res = await fetch(`${API_BASE}/pharmacy/expiry-alerts?days=60`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(exp60Res.status === 200, '27. GET /pharmacy/expiry-alerts?days=60 returned HTTP 200 OK');

    const exp90Res = await fetch(`${API_BASE}/pharmacy/expiry-alerts?days=90`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(exp90Res.status === 200, '28. GET /pharmacy/expiry-alerts?days=90 returned HTTP 200 OK');

    // --- Step 6: Analytics & Security Guards ---
    console.log('\n--- Step 6: Analytics & Security Guards ---');
    const analyticsRes = await fetch(`${API_BASE}/pharmacy/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, '29. GET /pharmacy/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.ordersToday >= 1 && analytics.revenue >= 0, `30. Analytics returned ordersToday: ${analytics.ordersToday}, revenue: $${analytics.revenue}`);

    // Security Guard: Patient blocked from dispensing
    const patBlockRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenPat}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicationOrderId: orderData.id, dispensedItems: [] }),
    });
    assert(patBlockRes.status === 403, '31. RBAC Guard: Patient role blocked with HTTP 403 Forbidden from dispensing medications');

    // Security Guard: Multi-Hospital Isolation
    const isoRes = await fetch(`${API_BASE}/pharmacy/orders/${orderData.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, '32. Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A pharmacy records');

    console.log('\n==================================================');
    console.log(`📊 PHARMACY INTELLIGENCE E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Pharmacy Intelligence E2E test:', err);
    process.exit(1);
  }
}

runPharmacyIntelligenceE2ETest();
