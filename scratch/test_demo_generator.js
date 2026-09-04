const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(rawData) });
          } catch (e) {
            resolve({ status: res.statusCode, body: rawData });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('1. Checking /api/v1/demo/status...');
  const statusRes = await makeRequest('/api/v1/demo/status');
  console.log('Status Response:', statusRes);

  console.log('\n2. Calling /api/v1/demo/generate-indian-dataset...');
  const genRes = await makeRequest('/api/v1/demo/generate-indian-dataset', 'POST');
  console.log('Generate Response:', genRes);
}

run().catch(console.error);
