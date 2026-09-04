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
  const claimsRes = await req('/api/v1/insurance/claims', token);
  const policiesRes = await req('/api/v1/insurance/policies', token);
  const providersRes = await req('/api/v1/insurance/providers', token);
  const analRes = await req('/api/v1/insurance/analytics', token);
  console.log('GET /insurance/claims:', claimsRes.status, 'Count:', Array.isArray(claimsRes.body) ? claimsRes.body.length : claimsRes.body);
  console.log('GET /insurance/policies:', policiesRes.status, 'Count:', Array.isArray(policiesRes.body) ? policiesRes.body.length : policiesRes.body);
  console.log('GET /insurance/providers:', providersRes.status, 'Count:', Array.isArray(providersRes.body) ? providersRes.body.length : providersRes.body);
  console.log('GET /insurance/analytics:', analRes.status, analRes.body);
}
main();
