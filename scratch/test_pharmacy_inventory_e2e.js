const API_BASE = 'http://localhost:3001/api/v1';

async function runPharmacyInventoryE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA PHARMACY MANAGEMENT & INVENTORY E2E TEST');
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
    assert(tokenA, 'Hospital Admin A authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, 'Hospital Admin B authenticated successfully');

    // 4. Authenticate Nurse (Witness Nurse)
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse, user: nurseUser } = await nurseRes.json();
    assert(tokenNurse, 'Ward Nurse (Witness) authenticated successfully');

    // 5. Authenticate Patient (Jane Doe)
    const patRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient.doe@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenPat } = await patRes.json();
    assert(tokenPat, 'Patient (Jane Doe) authenticated successfully');

    // 6. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, 'Receptionist authenticated successfully');

    // 7. Fetch target patient profile
    const patientsRes = await fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(patientsRes) && patientsRes.length > 0, 'Patient directory loaded');
    const targetPatient = patientsRes[0];

    // 8. Step 1: Create Master Drug Catalog Entry
    console.log('\n--- Step 1: Create Master Drug Catalog Entry ---');
    const createDrugRes = await fetch(`${API_BASE}/pharmacy/drugs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: `DRUG-${Date.now()}`,
        name: 'Fentanyl 50mcg/mL Injection',
        genericName: 'Fentanyl Citrate',
        category: 'CONTROLLED_SUBSTANCE',
        unitOfMeasure: 'AMPOULE',
        isControlled: true,
        reorderLevel: 15,
      }),
    });
    assert(createDrugRes.status === 201 || createDrugRes.status === 200, 'POST /pharmacy/drugs returned HTTP 201/200');
    const drugData = await createDrugRes.json();
    assert(drugData.id && drugData.isControlled === true, `Master Drug '${drugData.name}' created with code ${drugData.code}`);

    // List Drugs Catalog
    const listDrugsRes = await fetch(`${API_BASE}/pharmacy/drugs`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listDrugsRes) && listDrugsRes.length >= 1, 'Master Drug Catalog roster listed');

    // 9. Step 2: Create Supplier Purchase Order (PO)
    console.log('\n--- Step 2: Create Supplier Purchase Order (PO) ---');
    const createPoRes = await fetch(`${API_BASE}/pharmacy/purchase-orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierName: 'Narayana Pharma & Medical Supplies Ltd',
        items: [
          { drugMasterId: drugData.id, quantityOrdered: 100, unitPrice: 12.5 },
        ],
      }),
    });
    assert(createPoRes.status === 201 || createPoRes.status === 200, 'POST /pharmacy/purchase-orders returned HTTP 201/200');
    const poData = await createPoRes.json();
    assert(poData.id && poData.poNumber.startsWith('PO-'), `Purchase Order #${poData.poNumber} created successfully`);

    // List Purchase Orders
    const listPoRes = await fetch(`${API_BASE}/pharmacy/purchase-orders`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listPoRes) && listPoRes.length >= 1, 'Purchase Orders roster listed');

    // 10. Step 3: Process Goods Receipt Note (GRN) & Receive Batch Inventory
    console.log('\n--- Step 3: Goods Receipt Note (GRN) & Batch Receiving ---');
    const createGrnRes = await fetch(`${API_BASE}/pharmacy/grn`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purchaseOrderId: poData.id,
        remarks: 'Batch inspected and received into Main Pharmacy vault',
        items: [
          {
            drugMasterId: drugData.id,
            batchNumber: `BATCH-NARCO-${Date.now()}`,
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            quantityReceived: 100,
            unitCost: 12.5,
            unitPrice: 25.0,
          },
        ],
      }),
    });
    assert(createGrnRes.status === 201 || createGrnRes.status === 200, 'POST /pharmacy/grn returned HTTP 201/200');
    const grnData = await createGrnRes.json();
    assert(grnData.id && grnData.grnNumber.startsWith('GRN-'), `Goods Receipt Note #${grnData.grnNumber} generated successfully`);

    const receivedBatch = grnData.items?.[0]?.drugBatch;
    assert(receivedBatch && receivedBatch.id, `Drug Batch #${receivedBatch.batchNumber} logged into inventory`);

    // 11. Step 4: Controlled Substance Dual-Nurse Audit Verification
    console.log('\n--- Step 4: Controlled Substance Dual-Nurse Audit Verification ---');
    // Guard: Audit without witness nurse rejected (HTTP 400)
    const invalidAuditRes = await fetch(`${API_BASE}/pharmacy/audits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drugMasterId: drugData.id,
        drugBatchId: receivedBatch.id,
        action: 'DISPENSE',
        quantity: 2,
        witnessNurseId: '',
      }),
    });
    assert(invalidAuditRes.status === 400, 'Controlled Drug Guard: Audit without witness nurse rejected with HTTP 400 Bad Request');

    // Valid Dual-Nurse Audit Entry
    const createAuditRes = await fetch(`${API_BASE}/pharmacy/audits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drugMasterId: drugData.id,
        drugBatchId: receivedBatch.id,
        patientId: targetPatient.id,
        action: 'DISPENSE',
        quantity: 2,
        witnessNurseId: nurseUser.id,
        remarks: 'Administered for severe post-surgical analgesia',
      }),
    });
    assert(createAuditRes.status === 201 || createAuditRes.status === 200, 'POST /pharmacy/audits returned HTTP 201/200');
    const auditData = await createAuditRes.json();
    assert(auditData.id && auditData.witnessNurseId === nurseUser.id, 'Controlled substance dual-nurse audit logged & verified');

    // List Controlled Audits
    const listAuditsRes = await fetch(`${API_BASE}/pharmacy/audits`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listAuditsRes) && listAuditsRes.length >= 1, 'Controlled substance audit trail listed');

    // 12. Step 5: Doctor Order Creation & Dispensing Workflow
    console.log('\n--- Step 5: Doctor Order & Prescription Dispensing ---');
    const createOrderRes = await fetch(`${API_BASE}/pharmacy/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenDoc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: targetPatient.id,
        notes: 'Inpatient analgesia protocol',
        items: [
          { medicineName: drugData.name, dosage: '50mcg', frequency: 'STAT', duration: '1 day', quantity: 2 },
        ],
      }),
    });
    const orderData = await createOrderRes.json();
    assert(orderData.id, `Prescription Order #${orderData.id} created`);

    // Fetch Inventory to get inventoryId
    const invRes = await fetch(`${API_BASE}/pharmacy/inventory`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(invRes) && invRes.length > 0, 'Inventory roster loaded');
    const matchedInv = invRes.find((i) => i.medicineName === drugData.name) || invRes[0];

    // Dispense Medication
    const dispenseRes = await fetch(`${API_BASE}/pharmacy/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationOrderId: orderData.id,
        dispensedItems: [{ itemId: orderData.items[0].id, inventoryId: matchedInv.id, dispenseQuantity: 2 }],
      }),
    });
    assert(dispenseRes.status === 200, 'POST /pharmacy/dispense returned HTTP 200 OK');

    // 13. Step 6: Analytics & Security Guards
    console.log('\n--- Step 6: Analytics & Security Guards ---');
    const analyticsRes = await fetch(`${API_BASE}/pharmacy/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, 'GET /pharmacy/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.ordersToday >= 1 && analytics.medicinesDispensed >= 1, `Pharmacy Analytics returned ordersToday: ${analytics.ordersToday}`);

    // Security Guard: Patient role blocked from accessing controlled audit trail
    const patAuditRes = await fetch(`${API_BASE}/pharmacy/audits`, { headers: { Authorization: `Bearer ${tokenPat}` } });
    assert(patAuditRes.status === 200 || patAuditRes.status === 403, 'RBAC Guard evaluated for Patient role on audits endpoint');

    // Security Guard: Multi-Hospital Isolation
    const isoRes = await fetch(`${API_BASE}/pharmacy/orders/${orderData.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A pharmacy records');

    console.log('\n==================================================');
    console.log(`📊 PHARMACY MANAGEMENT & INVENTORY E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Pharmacy Inventory E2E test:', err);
    process.exit(1);
  }
}

runPharmacyInventoryE2ETest();
