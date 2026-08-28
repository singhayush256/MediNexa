const API_BASE = 'http://localhost:3001/api/v1';

async function runAttachmentUploadE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA MEDICAL DOCUMENT & DIAGNOSTIC VAULT E2E TEST');
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
    // 1. Authenticate Hospital Admin A (Facility A)
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, 'Hospital Admin A authenticated successfully');

    // 2. Authenticate Hospital Admin B (Facility B)
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, 'Hospital Admin B authenticated successfully');

    // 3. Get target patient
    const patientsRes = await fetch(`${API_BASE}/patients`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const patients = await patientsRes.json();
    const targetPatient = patients[0];
    assert(targetPatient && targetPatient.id, `Loaded target patient profile #${targetPatient.id}`);

    // 4. Upload mock X-Ray PDF document
    console.log('\n--- Step 1: Upload Diagnostic Image Attachment ---');
    const mockFileBuffer = Buffer.from('%PDF-1.4 Mock Chest X-Ray Diagnostic Report Data');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="patientId"\r\n\r\n${targetPatient.id}\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="category"\r\n\r\nXRAY\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="chest_xray_scan_2026.pdf"\r\n`;
    body += `Content-Type: application/pdf\r\n\r\n`;

    const payloadBuffer = Buffer.concat([
      Buffer.from(body, 'utf8'),
      mockFileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'),
    ]);

    const uploadRes = await fetch(`${API_BASE}/attachments/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: payloadBuffer,
    });

    assert(uploadRes.status === 201 || uploadRes.status === 200, 'POST /attachments/upload returned HTTP 201 Created');
    const attachment = await uploadRes.json();
    assert(attachment.id && attachment.fileName === 'chest_xray_scan_2026.pdf', `Attachment #${attachment.id} created with category ${attachment.category}`);

    // 5. Query attachments list
    console.log('\n--- Step 2: List Facility Document Attachments ---');
    const listRes = await fetch(`${API_BASE}/attachments`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const attachments = await listRes.json();
    assert(Array.isArray(attachments) && attachments.length > 0, `Listed ${attachments.length} document attachments for Facility A`);

    // 6. Download file stream
    console.log('\n--- Step 3: Stream File Attachment Download ---');
    const downloadRes = await fetch(`${API_BASE}/attachments/${attachment.id}/download`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(downloadRes.status === 200, `GET /attachments/${attachment.id}/download returned HTTP 200 OK`);
    const streamBuffer = await downloadRes.arrayBuffer();
    assert(streamBuffer.byteLength > 0, `Streamed ${streamBuffer.byteLength} bytes of file payload`);

    // 7. Multi-Hospital Isolation Guard (Hospital B Admin attempt)
    console.log('\n--- Step 4: Multi-Hospital Isolation Security Guard ---');
    const isoRes = await fetch(`${API_BASE}/attachments/${attachment.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden');

    // 8. Delete document attachment
    console.log('\n--- Step 5: Delete Document Attachment ---');
    const delRes = await fetch(`${API_BASE}/attachments/${attachment.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delRes.status === 200, `DELETE /attachments/${attachment.id} returned HTTP 200 OK`);

    console.log('\n==================================================');
    console.log(`📊 DOCUMENT VAULT E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during attachment vault E2E test:', err);
    process.exit(1);
  }
}

runAttachmentUploadE2ETest();
