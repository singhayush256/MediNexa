const http = require('http');

function req(path, token) {
  return new Promise((resolve) => {
    const r = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    r.end();
  });
}

async function login(email, password = 'Medinexa@2026') {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    const r = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          resolve(JSON.parse(data).accessToken);
        });
      }
    );
    r.write(postData);
    r.end();
  });
}

async function main() {
  const token = await login('admin@medinexa.in');
  console.log('Admin login successful.');

  const invRes = await req('/api/v1/billing/invoices', token);
  console.log('GET /api/v1/billing/invoices status:', invRes.status, 'Count:', Array.isArray(invRes.body) ? invRes.body.length : invRes.body);

  const analRes = await req('/api/v1/analytics/overview', token);
  console.log('GET /api/v1/analytics/overview status:', analRes.status, 'Metrics:', {
    revenue: analRes.body?.revenue,
    appointments: analRes.body?.appointments,
    admissions: analRes.body?.admissions,
    claims: analRes.body?.insuranceClaims,
    labs: analRes.body?.labOrders,
    pharmacy: analRes.body?.pharmacySales,
  });

  const auditRes = await req('/api/v1/audit-logs?limit=10', token);
  console.log('GET /api/v1/audit-logs?limit=10 status:', auditRes.status, 'Count:', Array.isArray(auditRes.body) ? auditRes.body.length : auditRes.body);
}
main();
