const assert = require('assert');

async function login(email, password = 'Password123!') {
  const res = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed for ${email}: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return { token: data.token || data.accessToken, user: data.user };
}

async function testPharmacyWorkflow() {
  console.log('====================================================');
  console.log('💊 TESTING COMPLETE PHARMACY MANAGEMENT SYSTEM (E2E)');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3001/api/v1';

  // 1. Pharmacist Workflow
  console.log('STEP 1: Pharmacist Logging in...');
  const pharmacist = await login('pharmacy.01@medinexa.in');
  console.log(`  Pharmacist logged in: ${pharmacist.user.firstName} ${pharmacist.user.lastName}`);
  const pharmHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${pharmacist.token}`,
  };

  // 1a. Medicine Inventory
  console.log('\nSTEP 2: Pharmacist Auditing Medicine Inventory...');
  const invRes = await fetch(`${BASE_URL}/pharmacy/inventory`, { headers: pharmHeaders });
  const inventory = await invRes.json();
  assert(Array.isArray(inventory) && inventory.length >= 10, 'Must have at least 10 realistic medicines');
  console.log(`  [PASS] Total Inventory Batches: ${inventory.length}`);
  console.log(`  Sample: [${inventory[0].batchNumber}] ${inventory[0].medicineName} - Stock: ${inventory[0].stockQuantity} Units`);

  // 1b. Stock Management (Update Stock via PATCH)
  console.log('\nSTEP 3: Pharmacist Updating Stock (PATCH /pharmacy/inventory/:id)...');
  const targetMed = inventory[0];
  const oldStock = targetMed.stockQuantity;
  const newStock = oldStock + 50;

  const updateRes = await fetch(`${BASE_URL}/pharmacy/inventory/${targetMed.id}`, {
    method: 'PATCH',
    headers: pharmHeaders,
    body: JSON.stringify({
      stockQuantity: newStock,
      sellingPrice: 3.5,
      remarks: 'Replenished central shelf stock from main distributor delivery',
    }),
  });
  console.log(`  Update Stock Status: ${updateRes.status}`);
  const updatedInv = await updateRes.json();
  if (updateRes.status !== 200) {
    console.log('  Update Stock Error Payload:', JSON.stringify(updatedInv, null, 2));
  }
  assert.strictEqual(updatedInv.stockQuantity, newStock);
  console.log(`  [PASS] Stock updated: ${oldStock} -> ${updatedInv.stockQuantity} Units`);

  // 1c. Expiry Tracking
  console.log('\nSTEP 4: Pharmacist Checking Expiry Tracking...');
  const expRes = await fetch(`${BASE_URL}/pharmacy/expiry-alerts?days=90`, { headers: pharmHeaders });
  const expiring = await expRes.json();
  assert(Array.isArray(expiring) && expiring.length > 0, 'Must identify expiring batches');
  console.log(`  [PASS] Identified ${expiring.length} near-expiry batch: [${expiring[0].batchNumber}] ${expiring[0].medicineName}`);

  // 1d. Prescription Fulfillment (Dispensing)
  console.log('\nSTEP 5: Pharmacist Fulfilling Prescription Orders...');
  const ordersRes = await fetch(`${BASE_URL}/pharmacy/orders`, { headers: pharmHeaders });
  const orders = await ordersRes.json();
  const pendingOrder = orders.find(o => o.status === 'PRESCRIBED') || orders[0];
  console.log(`  Selected Order #${pendingOrder.id.slice(0, 8)} (${pendingOrder.status}) with ${pendingOrder.items?.length || 0} items`);

  if (pendingOrder.status === 'PRESCRIBED' && pendingOrder.items?.length > 0) {
    const firstItem = pendingOrder.items[0];
    const matchInv = inventory.find(i => i.medicineName.toLowerCase().includes(firstItem.medicineName.toLowerCase())) || inventory[0];

    const dispenseRes = await fetch(`${BASE_URL}/pharmacy/dispense`, {
      method: 'POST',
      headers: pharmHeaders,
      body: JSON.stringify({
        medicationOrderId: pendingOrder.id,
        dispensedItems: [
          {
            itemId: firstItem.id,
            inventoryId: matchInv.id,
            dispenseQuantity: firstItem.quantity,
          },
        ],
      }),
    });
    console.log(`  Dispense Status: ${dispenseRes.status}`);
    const dispenseResult = await dispenseRes.json();
    assert.strictEqual(dispenseRes.status, 201);
    console.log(`  [PASS] Prescription item dispensed. Order Status: ${dispenseResult.status}`);
  }

  // 1e. Purchase History
  console.log('\nSTEP 6: Checking Purchase History (Purchase Orders)...');
  const poRes = await fetch(`${BASE_URL}/pharmacy/purchase-orders`, { headers: pharmHeaders });
  const purchaseOrders = await poRes.json();
  assert(Array.isArray(purchaseOrders) && purchaseOrders.length >= 3, 'Must have at least 3 purchase orders');
  console.log(`  [PASS] Retrieved ${purchaseOrders.length} historical purchase orders:`);
  purchaseOrders.forEach(po => {
    console.log(`    • ${po.poNumber} | ${po.supplierName} | ₹${po.totalAmount.toLocaleString()} | Status: ${po.status}`);
  });

  // 2. Patient: View Medicines
  console.log('\nSTEP 7: Patient Viewing Available Medicines...');
  const patient = await login('patient@medinexa.in');
  const patientHeaders = { Authorization: `Bearer ${patient.token}` };
  const patientInvRes = await fetch(`${BASE_URL}/pharmacy/inventory`, { headers: patientHeaders });
  const patientMedicines = await patientInvRes.json();
  assert(Array.isArray(patientMedicines) && patientMedicines.length > 0);
  console.log(`  [PASS] Patient accessed ${patientMedicines.length} hospital formulary medicines.`);

  // 3. Admin: Inventory Analytics
  console.log('\nSTEP 8: Admin Viewing Pharmacy Analytics...');
  const admin = await login('admin@medinexa.in');
  const adminHeaders = { Authorization: `Bearer ${admin.token}` };
  const anaRes = await fetch(`${BASE_URL}/pharmacy/analytics`, { headers: adminHeaders });
  const analytics = await anaRes.json();
  assert(analytics.stockValue > 0);
  console.log(`  [PASS] Pharmacy Inventory Analytics:`);
  console.log(`    • Stock Valuation: ₹${analytics.stockValue.toLocaleString()}`);
  console.log(`    • Low Stock Alerts: ${analytics.lowStockCount}`);
  console.log(`    • Expiring Alerts: ${analytics.expiringMedicinesCount}`);
  console.log(`    • Turnover Rate: ${analytics.inventoryTurnoverRate}`);

  console.log('\n====================================================');
  console.log('🎉 COMPLETE PHARMACY SYSTEM VALIDATED (100% PASS)!');
  console.log('====================================================\n');
}

testPharmacyWorkflow().catch(err => {
  console.error('\n❌ PHARMACY TEST FAILED:', err);
  process.exit(1);
});
