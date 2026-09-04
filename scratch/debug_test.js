const http = require('http');

function req(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : '';
    const r = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: `/api/v1${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(d) });
          } catch {
            resolve({ status: res.statusCode, body: d });
          }
        });
      }
    );
    if (postData) r.write(postData);
    r.end();
  });
}

async function debug() {
  console.log('1. register-initiate:');
  const reg = await req('/auth/register-initiate', 'POST', {
    firstName: 'Ayush',
    lastName: 'Verma',
    email: `ayush.${Date.now()}@gmail.com`,
    phone: '+91 98101 99999',
    password: 'Medinexa@2026',
    role: 'PATIENT',
  });
  console.log('Register Res:', reg);

  console.log('\n2. login admin:');
  const login = await req('/auth/login', 'POST', {
    email: 'admin@medinexa.in',
    password: 'Medinexa@2026',
  });
  console.log('Login Res:', login);

  console.log('\n3. super-admin/overview:');
  const sup = await req('/super-admin/overview');
  console.log('Super admin Res:', sup);

  console.log('\n4. backup/create:');
  const bkp = await req('/backup/create', 'POST', { type: 'MANUAL' });
  console.log('Backup Res:', bkp);
}

debug();
