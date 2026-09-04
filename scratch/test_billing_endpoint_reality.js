const http = require('http');

function req(token) {
  return new Promise((resolve) => {
    const r = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/billing/invoices',
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

async function login() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email: 'admin@medinexa.in', password: 'Medinexa@2026' });
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
  const token = await login();
  const res = await req(token);
  console.log('GET /api/v1/billing/invoices status:', res.status);
  console.log('GET /api/v1/billing/invoices items count:', Array.isArray(res.body) ? res.body.length : res.body);
}
main();
