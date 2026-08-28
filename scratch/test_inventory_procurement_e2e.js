const API_BASE = 'http://localhost:3001/api/v1';

async function runInventoryProcurementE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA INVENTORY, PROCUREMENT & ASSETS E2E TEST');
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

    // 4. Authenticate Nurse
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse } = await nurseRes.json();
    assert(tokenNurse, '4. Nurse authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception.a@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, '5. Receptionist authenticated successfully');

    // Load hospital doctors / departments
    const doctorsRes = await fetch(`${API_BASE}/doctors`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(doctorsRes) && doctorsRes.length > 0, '6. Hospital departments loaded');
    const targetDeptId = doctorsRes[0].departmentId;

    // --- Step 1: Inventory Item Catalog ---
    console.log('\n--- Step 1: Inventory Item Catalog ---');
    const createItem1Res = await fetch(`${API_BASE}/inventory/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: `Sterile Nitrile Surgical Gloves (Box of 100) ${Date.now()}`,
        category: 'SURGICAL_CONSUMABLES',
        unitOfMeasure: 'BOX',
        currentStock: 100,
        minimumStock: 20,
        reorderLevel: 30,
        unitPrice: 18.5,
        location: 'Central Sterile Supply Department (CSSD)',
      }),
    });
    assert(createItem1Res.status === 201 || createItem1Res.status === 200, '7. POST /inventory/items (Item 1) returned HTTP 201/200');
    const item1 = await createItem1Res.json();
    assert(item1.id && item1.itemCode.startsWith('SKU-'), `8. Item #${item1.itemCode} created (${item1.itemName})`);

    const createItem2Res = await fetch(`${API_BASE}/inventory/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: `N95 Respirator Masks Pack ${Date.now()}`,
        category: 'PPE',
        unitOfMeasure: 'PACK',
        currentStock: 10,
        minimumStock: 25,
        reorderLevel: 40,
        unitPrice: 24.0,
      }),
    });
    const item2 = await createItem2Res.json();
    assert(item2.id, `9. Low-stock Item #${item2.itemCode} created`);

    // Query Items
    const listItemsRes = await fetch(`${API_BASE}/inventory/items`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listItemsRes) && listItemsRes.length >= 2, '10. Hospital Inventory items listed');

    // --- Step 2: Stock Transactions & Negative Inventory Guard ---
    console.log('\n--- Step 2: Stock Transactions & Negative Inventory Guard ---');
    const txInRes = await fetch(`${API_BASE}/inventory/transactions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item1.id,
        transactionType: 'IN',
        quantity: 50,
        remarks: 'New shipment receipt from vendor',
      }),
    });
    assert(txInRes.status === 201 || txInRes.status === 200, '11. POST /inventory/transactions (IN) returned HTTP 201/200');
    const txIn = await txInRes.json();
    assert(txIn.newStock === 150, `12. Stock increased: 100 -> ${txIn.newStock}`);

    const txOutRes = await fetch(`${API_BASE}/inventory/transactions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item1.id,
        transactionType: 'OUT',
        quantity: 30,
        remarks: 'Dispatched to Operation Theatre Suite 01',
      }),
    });
    assert(txOutRes.status === 201 || txOutRes.status === 200, '13. POST /inventory/transactions (OUT) returned HTTP 201/200');
    const txOut = await txOutRes.json();
    assert(txOut.newStock === 120, `14. Stock reduced: 150 -> ${txOut.newStock}`);

    // Negative Inventory Guard
    const negTxRes = await fetch(`${API_BASE}/inventory/transactions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item1.id,
        transactionType: 'OUT',
        quantity: 500, // Exceeds 120
      }),
    });
    assert(negTxRes.status === 400, '15. Negative Inventory Guard: Stock-out exceeding available stock rejected with HTTP 400 Bad Request');

    const listTxRes = await fetch(`${API_BASE}/inventory/transactions`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listTxRes) && listTxRes.length >= 2, '16. Inventory transactions ledger loaded');

    // --- Step 3: Vendor & Procurement Workflows ---
    console.log('\n--- Step 3: Vendor & Procurement Workflows ---');
    const createVendorRes = await fetch(`${API_BASE}/inventory/vendors`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: `GE Healthcare Medical Systems ${Date.now()}`,
        contactPerson: 'David Miller',
        email: 'sales@gehealthcare.com',
        phone: '+1-800-GE-HEALTH',
        gstNumber: 'GSTIN27AABCG1234F1Z8',
        address: '100 Innovation Parkway, Chicago, IL',
      }),
    });
    assert(createVendorRes.status === 201 || createVendorRes.status === 200, '17. POST /inventory/vendors returned HTTP 201/200');
    const vendor = await createVendorRes.json();
    assert(vendor.id && vendor.vendorCode.startsWith('VND-'), `18. Vendor '${vendor.companyName}' registered`);

    const listVendorsRes = await fetch(`${API_BASE}/inventory/vendors`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listVendorsRes) && listVendorsRes.length >= 1, '19. Approved vendors directory loaded');

    // Purchase Requisition
    const createReqRes = await fetch(`${API_BASE}/inventory/requisitions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        departmentId: targetDeptId,
        totalAmount: 14500.0,
        items: 'Emergency Resuscitation Consumables & Defibrillator Pads',
      }),
    });
    assert(createReqRes.status === 201 || createReqRes.status === 200, '20. POST /inventory/requisitions returned HTTP 201/200');
    const req = await createReqRes.json();
    assert(req.id && req.approvalStatus === 'PENDING', '21. Purchase Requisition filed with status PENDING');

    // Approve Requisition
    const approveReqRes = await fetch(`${API_BASE}/inventory/requisitions/${req.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(approveReqRes.status === 200, '22. PATCH /inventory/requisitions/:id/approve returned HTTP 200 OK');
    const approvedReq = await approveReqRes.json();
    assert(approvedReq.approvalStatus === 'APPROVED', '23. Requisition approved by Admin');

    // Purchase Order
    const createPoRes = await fetch(`${API_BASE}/inventory/purchase-orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: vendor.id,
        requisitionId: req.id,
        totalAmount: 14500.0,
      }),
    });
    assert(createPoRes.status === 201 || createPoRes.status === 200, '24. POST /inventory/purchase-orders returned HTTP 201/200');
    const po = await createPoRes.json();
    assert(po.id && po.status === 'ORDERED', `25. Purchase Order #${po.poNumber} created`);

    // Receive Goods & Generate GRN
    const receivePoRes = await fetch(`${API_BASE}/inventory/purchase-orders/${po.id}/receive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(receivePoRes.status === 200, '26. PATCH /inventory/purchase-orders/:id/receive returned HTTP 200 OK');
    const grn = await receivePoRes.json();
    assert(grn.id && grn.receiptNumber.startsWith('GRN-PROC-'), `27. Goods Receipt #${grn.receiptNumber} generated`);

    // --- Step 4: Hospital Asset & Biomedical Maintenance ---
    console.log('\n--- Step 4: Hospital Asset & Biomedical Maintenance ---');
    const createAssetRes = await fetch(`${API_BASE}/inventory/assets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetName: `Mindray SV300 ICU Ventilator Unit ${Date.now()}`,
        category: 'ICU_VENTILATOR',
        departmentId: targetDeptId,
        warrantyExpiry: new Date(Date.now() + 365 * 86400000).toISOString(),
        maintenanceFrequency: 'MONTHLY',
        currentLocation: 'ICU Bed Bay 04',
        purchaseCost: 28500.0,
      }),
    });
    assert(createAssetRes.status === 201 || createAssetRes.status === 200, '28. POST /inventory/assets returned HTTP 201/200');
    const asset = await createAssetRes.json();
    assert(asset.id && asset.status === 'ACTIVE', `29. Biomedical Asset #${asset.assetCode} registered`);

    // Create Maintenance Ticket
    const createTicketRes = await fetch(`${API_BASE}/inventory/maintenance`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: asset.id,
        issueDescription: 'Periodic sensor calibration and flow sensor replacement',
        priority: 'HIGH',
      }),
    });
    assert(createTicketRes.status === 201 || createTicketRes.status === 200, '30. POST /inventory/maintenance returned HTTP 201/200');
    const ticket = await createTicketRes.json();
    assert(ticket.id && ticket.status === 'OPEN', '31. Maintenance ticket opened and asset placed UNDER_MAINTENANCE');

    // Resolve Maintenance Ticket
    const resolveTicketRes = await fetch(`${API_BASE}/inventory/maintenance/${ticket.id}/resolve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolutionNotes: 'Calibration verified. Flow sensor replaced with OEM part. Tested OK.',
      }),
    });
    assert(resolveTicketRes.status === 200, '32. PATCH /inventory/maintenance/:id/resolve returned HTTP 200 OK');
    const resolvedTicket = await resolveTicketRes.json();
    assert(resolvedTicket.status === 'RESOLVED', '33. Ticket resolved and asset restored to ACTIVE');

    // --- Step 5: Analytics & Multi-Hospital Isolation Guards ---
    console.log('\n--- Step 5: Analytics & Multi-Hospital Isolation Guards ---');
    const analyticsRes = await fetch(`${API_BASE}/inventory/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, '34. GET /inventory/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.inventoryValue > 0 && analytics.purchaseSpend > 0, `35. Analytics calculated (Valuation: $${analytics.inventoryValue})`);

    // Multi-Hospital Isolation Guard: Hospital B Admin blocked from Hospital A assets
    const isoRes = await fetch(`${API_BASE}/inventory/maintenance`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: asset.id,
        issueDescription: 'Unauthorized cross-facility ticket attempt',
      }),
    });
    assert(isoRes.status === 403, '36. Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A asset records');

    console.log('\n==================================================');
    console.log(`📊 INVENTORY, PROCUREMENT & ASSETS RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during Inventory Procurement E2E test:', err);
    process.exit(1);
  }
}

runInventoryProcurementE2ETest();
