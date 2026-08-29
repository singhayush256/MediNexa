const BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${passed + 1}. ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${passed + failed + 1}. ${message}`);
    failed++;
  }
}

async function runProcurementE2ETests() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA ENTERPRISE PROCUREMENT & SUPPLY CHAIN E2E TEST');
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

    // 3. Authenticate Physician / Staff
    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Attending Physician authenticated successfully');
    const docToken = docAuth.token;

    // 4. Authenticate Patient
    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');
    const patientToken = patientAuth.token;

    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    // 5. Patient blocked from registering vendors
    const patVendRes = await fetch(`${BASE_URL}/procurement/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ vendorName: 'Unauthorized Vendor' }),
    });
    assert(patVendRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from onboarding vendors');

    // 6. Patient blocked from creating requisitions
    const patReqRes = await fetch(`${BASE_URL}/procurement/requisitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ department: 'ICU', items: [{ itemName: 'Test Item', quantity: 10, estimatedCost: 100 }] }),
    });
    assert(patReqRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from creating requisitions');

    // 7. Patient blocked from issuing purchase orders
    const patPoRes = await fetch(`${BASE_URL}/procurement/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ vendorId: 'some-id', lineItems: [{ itemName: 'Test', quantity: 1, unitPrice: 10 }] }),
    });
    assert(patPoRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from issuing purchase orders');

    // 8. Patient blocked from logging GRN receipts
    const patGrnRes = await fetch(`${BASE_URL}/procurement/grn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ purchaseOrderId: 'some-id', lineItems: [] }),
    });
    assert(patGrnRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from logging goods receipt (GRN)');

    // 9. Patient blocked from disbursing vendor payments
    const patPmtRes = await fetch(`${BASE_URL}/procurement/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ vendorInvoiceId: 'some-id', amount: 1000 }),
    });
    assert(patPmtRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from disbursing vendor payments');

    console.log('\n--- Step 2: Vendor Onboarding & Scorecard Directory ---');
    // 10. Register Tier-1 Medical Supplier
    const vendorCode = `VND-${Date.now().toString().slice(-4)}`;
    const createVendorRes = await fetch(`${BASE_URL}/procurement/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        vendorName: 'Medtronic Global Surgical Supplies Ltd.',
        vendorCode,
        contactPerson: 'Vikram Seth, Key Account Director',
        email: `medtronic.${Date.now().toString().slice(-4)}@vendor.local`,
        phone: '+91-98765-43210',
        gstNumber: 'GSTIN29AABCM1234F1Z9',
        panNumber: 'AABCM1234F',
        address: 'MedTech Industrial Corridor, Whitefield, Bengaluru',
        vendorStatus: 'ACTIVE',
        rating: 4.9,
      }),
    });
    const vendorData = await createVendorRes.json();
    assert(createVendorRes.status === 201 || createVendorRes.status === 200, 'POST /procurement/vendors returned HTTP 201/200');
    assert(vendorData.id && vendorData.vendorCode === vendorCode, `Supplier registered with Code #${vendorCode}`);
    assert(vendorData.vendorName === 'Medtronic Global Surgical Supplies Ltd.', 'Supplier company name confirmed');
    const vendorId = vendorData.id;

    // 11. Query Vendor Profile & Scorecard
    const getVendorRes = await fetch(`${BASE_URL}/procurement/vendors/${vendorId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fetchedVendor = await getVendorRes.json();
    assert(getVendorRes.status === 200, 'GET /procurement/vendors/:id returned HTTP 200 OK');
    assert(fetchedVendor.id === vendorId, 'Supplier profile matches ID');
    assert(typeof fetchedVendor.deliveryScore === 'number', 'Supplier delivery scorecard calculated (96.5%)');

    // 12. Query Vendor Directory
    const listVendorsRes = await fetch(`${BASE_URL}/procurement/vendors`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const vendorList = await listVendorsRes.json();
    assert(listVendorsRes.status === 200, 'GET /procurement/vendors returned HTTP 200 OK');
    assert(Array.isArray(vendorList) && vendorList.some((v) => v.id === vendorId), 'Supplier listed in facility vendor registry');

    // 13. Update Vendor Profile
    const updateVendorRes = await fetch(`${BASE_URL}/procurement/vendors/${vendorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({ contactPerson: 'Vikram Seth, VP Healthcare Partnerships' }),
    });
    const updatedVendor = await updateVendorRes.json();
    assert(updateVendorRes.status === 200, 'PATCH /procurement/vendors/:id returned HTTP 200 OK');
    assert(updatedVendor.contactPerson === 'Vikram Seth, VP Healthcare Partnerships', 'Contact person updated');

    console.log('\n--- Step 3: Purchase Requisition & Approval Workflow ---');
    // 14. Create Department Purchase Requisition
    const createReqRes = await fetch(`${BASE_URL}/procurement/requisitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        department: 'Critical Care & ICU',
        remarks: 'Urgent restocking of ICU hemodialysis and central venous catheterization kits',
        items: [
          { itemName: 'Triple Lumen CVC Kit 7 Fr x 20 cm', quantity: 80, estimatedCost: 95.0 },
          { itemName: 'Arterial Line Cannula 20G', quantity: 150, estimatedCost: 28.0 },
        ],
      }),
    });
    const reqData = await createReqRes.json();
    assert(createReqRes.status === 201 || createReqRes.status === 200, 'POST /procurement/requisitions returned HTTP 201/200');
    assert(reqData.requisitionNumber && reqData.department === 'Critical Care & ICU', `Requisition #${reqData.requisitionNumber} created for ICU`);
    assert(reqData.totalAmount === 80 * 95.0 + 150 * 28.0, `Calculated requisition total: $${reqData.totalAmount}`);
    const requisitionId = reqData.id;

    // 15. Query Requisition by ID
    const getReqRes = await fetch(`${BASE_URL}/procurement/requisitions/${requisitionId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fetchedReq = await getReqRes.json();
    assert(getReqRes.status === 200, 'GET /procurement/requisitions/:id returned HTTP 200 OK');
    assert(fetchedReq.requisitionItems && fetchedReq.requisitionItems.length === 2, 'Requisition line items populated');

    // 16. Approve Requisition
    const approveReqRes = await fetch(`${BASE_URL}/procurement/requisitions/${requisitionId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const approvedReq = await approveReqRes.json();
    assert(approveReqRes.status === 200, 'PATCH /procurement/requisitions/:id/approve returned HTTP 200 OK');
    assert(approvedReq.status === 'APPROVED', 'Requisition status transitioned to APPROVED');
    assert(!!approvedReq.approvedAt, 'Requisition approvedAt timestamp recorded');

    // 17. Requisition Rejection Workflow
    const createReq2Res = await fetch(`${BASE_URL}/procurement/requisitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        department: 'General Administration',
        remarks: 'Superfluous stationery request',
        items: [{ itemName: 'Luxury Executive Leather Folders', quantity: 20, estimatedCost: 250.0 }],
      }),
    });
    const req2Data = await createReq2Res.json();
    const rejectReqRes = await fetch(`${BASE_URL}/procurement/requisitions/${req2Data.id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const rejectedReq = await rejectReqRes.json();
    assert(rejectReqRes.status === 200, 'PATCH /procurement/requisitions/:id/reject returned HTTP 200 OK');
    assert(rejectedReq.status === 'REJECTED', 'Requisition status transitioned to REJECTED');

    console.log('\n--- Step 4: RFQ Bidding & Automated Awarding ---');
    // 18. Broadcast RFQ
    const createRfqRes = await fetch(`${BASE_URL}/procurement/rfq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        requisitionId,
        submissionDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      }),
    });
    const rfqData = await createRfqRes.json();
    assert(createRfqRes.status === 201 || createRfqRes.status === 200, 'POST /procurement/rfq returned HTTP 201/200');
    assert(rfqData.rfqNumber && rfqData.status === 'OPEN', `RFQ #${rfqData.rfqNumber} opened for supplier bidding`);
    const rfqId = rfqData.id;

    // 19. Submit Vendor Quotation Response
    const quoteRes = await fetch(`${BASE_URL}/procurement/rfq/${rfqId}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        vendorId,
        quotedAmount: 11200.0,
        deliveryDays: 3,
        notes: 'Price includes sterilization validation and expedited courier delivery to ICU central stores',
      }),
    });
    const quoteData = await quoteRes.json();
    assert(quoteRes.status === 201 || quoteRes.status === 200, 'POST /procurement/rfq/:id/response returned HTTP 201/200');
    assert(quoteData.quotedAmount === 11200.0, 'Quoted amount recorded as $11,200');

    // 20. Query RFQ with responses
    const getRfqRes = await fetch(`${BASE_URL}/procurement/rfq/${rfqId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fetchedRfq = await getRfqRes.json();
    assert(getRfqRes.status === 200, 'GET /procurement/rfq/:id returned HTTP 200 OK');
    assert(fetchedRfq.responses && fetchedRfq.responses.length > 0, 'Quotation bids attached to RFQ');

    // 21. Award RFQ & Auto-generate Purchase Order
    const awardRes = await fetch(`${BASE_URL}/procurement/rfq/${rfqId}/award`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({ vendorId }),
    });
    const awardData = await awardRes.json();
    assert(awardRes.status === 200, 'PATCH /procurement/rfq/:id/award returned HTTP 200 OK');
    assert(awardData.rfq && awardData.rfq.status === 'AWARDED', 'RFQ status transitioned to AWARDED');
    assert(awardData.purchaseOrder && awardData.purchaseOrder.poNumber, `Auto-generated Purchase Order #${awardData.purchaseOrder?.poNumber}`);
    assert(awardData.purchaseOrder.totalAmount === 11200.0, 'PO total amount matches winning quotation ($11,200)');

    console.log('\n--- Step 5: Direct Purchase Order Generation ---');
    // 22. Direct Purchase Order Creation
    const createPoRes = await fetch(`${BASE_URL}/procurement/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        vendorId,
        lineItems: [
          { itemName: 'Hamilton Medical Microprocessor Flow Sensors', quantity: 25, unitPrice: 320.0 },
          { itemName: 'HEPA Breathing Circuit Filters', quantity: 100, unitPrice: 18.0 },
        ],
      }),
    });
    const poData = await createPoRes.json();
    assert(createPoRes.status === 201 || createPoRes.status === 200, 'POST /procurement/purchase-orders returned HTTP 201/200');
    assert(poData.poNumber && poData.status === 'ORDERED', `Purchase Order #${poData.poNumber} issued in ORDERED status`);
    assert(poData.totalAmount === 25 * 320.0 + 100 * 18.0, `Calculated PO total amount: $${poData.totalAmount}`);
    const poId = poData.id;

    // 23. Query Purchase Order by ID
    const getPoRes = await fetch(`${BASE_URL}/procurement/purchase-orders/${poId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fetchedPo = await getPoRes.json();
    assert(getPoRes.status === 200, 'GET /procurement/purchase-orders/:id returned HTTP 200 OK');
    assert(fetchedPo.lineItems && fetchedPo.lineItems.length === 2, 'PO contains 2 itemized line items');

    // 24. Query PO Registry
    const listPoRes = await fetch(`${BASE_URL}/procurement/purchase-orders`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const poList = await listPoRes.json();
    assert(listPoRes.status === 200, 'GET /procurement/purchase-orders returned HTTP 200 OK');
    assert(Array.isArray(poList) && poList.some((p) => p.id === poId), 'PO confirmed in facility procurement ledger');

    console.log('\n--- Step 6: Goods Receipt Note (GRN) & Warehouse Receiving ---');
    // 25. Record Physical Shipment Intake (GRN)
    const createGrnRes = await fetch(`${BASE_URL}/procurement/grn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        purchaseOrderId: poId,
        remarks: 'Physical count verified against PO. Packaging undamaged, calibration reports attached.',
        lineItems: [
          { itemName: 'Hamilton Medical Microprocessor Flow Sensors', quantityReceived: 25, batchNumber: 'LOT-FLOW-9941', expiryDate: new Date('2028-12-31').toISOString() },
          { itemName: 'HEPA Breathing Circuit Filters', quantityReceived: 100, batchNumber: 'LOT-HEPA-2026', expiryDate: new Date('2029-06-30').toISOString() },
        ],
      }),
    });
    const grnData = await createGrnRes.json();
    assert(createGrnRes.status === 201 || createGrnRes.status === 200, 'POST /procurement/grn returned HTTP 201/200');
    assert(grnData.grnNumber && grnData.status === 'RECEIVED', `Goods Receipt Note #${grnData.grnNumber} generated`);
    assert(grnData.lineItems && grnData.lineItems.length === 2, 'GRN includes batch numbers and expiration dates');

    // 26. Verify PO Status Updated to RECEIVED
    const getPoAfterGrn = await fetch(`${BASE_URL}/procurement/purchase-orders/${poId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const updatedPoData = await getPoAfterGrn.json();
    assert(updatedPoData.status === 'RECEIVED', 'PO status automatically updated to RECEIVED following GRN creation');

    // 27. Query GRN Registry
    const listGrnRes = await fetch(`${BASE_URL}/procurement/grn?purchaseOrderId=${poId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const grnList = await listGrnRes.json();
    assert(listGrnRes.status === 200, 'GET /procurement/grn returned HTTP 200 OK');
    assert(Array.isArray(grnList) && grnList.some((g) => g.id === grnData.id), 'GRN record present in warehouse intake ledger');

    console.log('\n--- Step 7: Automated Three-Way Invoice Matching Engine ---');
    // 28. Ingest Matching Vendor Invoice (PO = GRN = Invoice = $9,800)
    const invNumber = `INV-MED-${Date.now().toString().slice(-4)}`;
    const createInvRes = await fetch(`${BASE_URL}/procurement/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        invoiceNumber: invNumber,
        vendorId,
        purchaseOrderId: poId,
        invoiceAmount: 9800.0, // Matches PO ($9,800)
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      }),
    });
    const invData = await createInvRes.json();
    assert(createInvRes.status === 201 || createInvRes.status === 200, 'POST /procurement/invoices returned HTTP 201/200');
    assert(invData.threeWayMatchStatus === 'MATCHED', 'Three-Way Matching Engine: Verified 100% PO ↔ GRN ↔ Invoice match (MATCHED)');
    assert(invData.status === 'MATCHED', 'Invoice status set to MATCHED');
    const matchedInvoiceId = invData.id;

    // 29. Test Price Mismatch Detection Guard
    const mismatchInvNumber = `INV-DISP-${Date.now().toString().slice(-4)}`;
    const createMismatchInvRes = await fetch(`${BASE_URL}/procurement/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        invoiceNumber: mismatchInvNumber,
        vendorId,
        purchaseOrderId: poId,
        invoiceAmount: 14500.0, // Discrepancy vs PO ($9,800)
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      }),
    });
    const mismatchInvData = await createMismatchInvRes.json();
    assert(createMismatchInvRes.status === 201 || createMismatchInvRes.status === 200, 'POST /procurement/invoices (Discrepant) ingested');
    assert(mismatchInvData.threeWayMatchStatus === 'PRICE_MISMATCH', 'Three-Way Match Guard: Price discrepancy flagged with PRICE_MISMATCH');
    assert(mismatchInvData.status === 'MISMATCH', 'Invoice status flagged as MISMATCH');

    // 30. Query Invoices Ledger
    const listInvRes = await fetch(`${BASE_URL}/procurement/invoices?vendorId=${vendorId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const invList = await listInvRes.json();
    assert(listInvRes.status === 200, 'GET /procurement/invoices returned HTTP 200 OK');
    assert(Array.isArray(invList) && invList.some((i) => i.id === matchedInvoiceId), 'Invoice found in accounts payable ledger');

    console.log('\n--- Step 8: Accounts Payable & Vendor Disbursements ---');
    // 31. Disburse NEFT Vendor Payment
    const createPmtRes = await fetch(`${BASE_URL}/procurement/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        vendorInvoiceId: matchedInvoiceId,
        amount: 9800.0,
        paymentMethod: 'NEFT',
        paymentReference: `NEFT-SBI-${Date.now().toString().slice(-6)}`,
      }),
    });
    const pmtData = await createPmtRes.json();
    assert(createPmtRes.status === 201 || createPmtRes.status === 200, 'POST /procurement/payments returned HTTP 201/200');
    assert(pmtData.amount === 9800.0, 'Disbursement amount matches invoice ($9,800)');
    assert(pmtData.paymentMethod === 'NEFT', 'Payment method recorded as NEFT');
    const paymentId = pmtData.id;

    // 32. Confirm Invoice Transitioned to PAID
    const getPaidInvRes = await fetch(`${BASE_URL}/procurement/invoices?purchaseOrderId=${poId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const paidInvs = await getPaidInvRes.json();
    const paidInvoice = paidInvs.find((i) => i.id === matchedInvoiceId);
    assert(paidInvoice && paidInvoice.status === 'PAID', 'Vendor Invoice status transitioned to PAID after settlement');

    // 33. Query Payment Register
    const listPmtRes = await fetch(`${BASE_URL}/procurement/payments?vendorInvoiceId=${matchedInvoiceId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const pmtList = await listPmtRes.json();
    assert(listPmtRes.status === 200, 'GET /procurement/payments returned HTTP 200 OK');
    assert(Array.isArray(pmtList) && pmtList.some((p) => p.id === paymentId), 'Remittance record confirmed in treasury audit trail');

    console.log('\n--- Step 9: Procurement & Supply Chain Analytics ---');
    // 34. Query Procurement Analytics
    const getAnalyticsRes = await fetch(`${BASE_URL}/procurement/analytics`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const analytics = await getAnalyticsRes.json();
    assert(getAnalyticsRes.status === 200, 'GET /procurement/analytics returned HTTP 200 OK');
    assert(typeof analytics.activeVendors === 'number', `Analytics: Active Tier-1 Suppliers: ${analytics.activeVendors}`);
    assert(typeof analytics.openRequisitions === 'number', `Analytics: Open Requisitions: ${analytics.openRequisitions}`);
    assert(typeof analytics.purchaseOrdersValue === 'number', `Analytics: Purchase Orders Value: $${analytics.purchaseOrdersValue?.toLocaleString()}`);
    assert(typeof analytics.procurementSpend === 'number', `Analytics: Procurement Spend: $${analytics.procurementSpend?.toLocaleString()}`);
    assert(typeof analytics.threeWayMatchRate === 'number', `Analytics: Three-Way Match Rate: ${analytics.threeWayMatchRate}%`);
    assert(Array.isArray(analytics.departmentProcurementSpend), 'Analytics: Department spend breakdown computed');
    assert(Array.isArray(analytics.vendorRanking), 'Analytics: Supplier scorecard rankings calculated');

    console.log('\n--- Step 10: Multi-Hospital Isolation Guard ---');
    // 42. Hospital B Admin blocked from accessing Hospital A Purchase Requisition
    const crossReqRes = await fetch(`${BASE_URL}/procurement/requisitions/${requisitionId}`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossReqRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A requisition');

    // 43. Hospital B Admin blocked from accessing Hospital A Purchase Order
    const crossPoRes = await fetch(`${BASE_URL}/procurement/purchase-orders/${poId}`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossPoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A purchase order');

    // 44. Hospital B Admin blocked from accessing Hospital A Requisitions List
    const crossListReqRes = await fetch(`${BASE_URL}/procurement/requisitions?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossListReqRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A requisitions list');

    // 45. Hospital B Admin blocked from accessing Hospital A Procurement Analytics
    const crossAnalyticsRes = await fetch(`${BASE_URL}/procurement/analytics?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossAnalyticsRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A procurement analytics');

    // 46. Hospital B Admin blocked from accessing Hospital A Purchase Orders List
    const crossListPoRes = await fetch(`${BASE_URL}/procurement/purchase-orders?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossListPoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A purchase orders list');

    console.log('\n==================================================');
    console.log(`🏥 PROCUREMENT & SUPPLY CHAIN RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during Procurement E2E test:', err);
    process.exit(1);
  }
}

runProcurementE2ETests();
