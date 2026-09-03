async function login(email, password = 'Password123!') {
  const res = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token || data.accessToken;
}

async function testPharmacy() {
  console.log('Testing Pharmacy API endpoints with Pharmacist user...');
  const token = await login('pharmacy.01@medinexa.in');
  const headers = { Authorization: `Bearer ${token}` };

  const [inv, ord, low, exp, po, ana] = await Promise.all([
    fetch('http://localhost:3001/api/v1/pharmacy/inventory', { headers }).then(r => r.json()),
    fetch('http://localhost:3001/api/v1/pharmacy/orders', { headers }).then(r => r.json()),
    fetch('http://localhost:3001/api/v1/pharmacy/low-stock', { headers }).then(r => r.json()),
    fetch('http://localhost:3001/api/v1/pharmacy/expiry-alerts', { headers }).then(r => r.json()),
    fetch('http://localhost:3001/api/v1/pharmacy/purchase-orders', { headers }).then(r => r.json()),
    fetch('http://localhost:3001/api/v1/pharmacy/analytics', { headers }).then(r => r.json()),
  ]);

  console.log('Inventory Count:', Array.isArray(inv) ? inv.length : inv);
  console.log('Orders Count:', Array.isArray(ord) ? ord.length : ord);
  console.log('Low Stock Items Count:', Array.isArray(low) ? low.length : low);
  console.log('Expiring Items Count:', Array.isArray(exp) ? exp.length : exp);
  console.log('Purchase Orders Count:', Array.isArray(po) ? po.length : po);
  console.log('Analytics Summary:', ana);
}

testPharmacy().catch(console.error);
