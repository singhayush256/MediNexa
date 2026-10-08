const speakeasy = require('speakeasy');

const BASE_URL = 'http://localhost:3001/api/v1';

async function runTests() {
  console.log('--- STARTING END-TO-END REGISTRATION & TOTP VERIFICATION TEST ---');

  const timestamp = Date.now();
  const testEmail = `test.patient.${timestamp}@medinexa.health`;
  const validPassword = 'SecurePatient#2026';

  // TEST 1: Password complexity validation
  console.log('\n[Test 1] Testing invalid password complexity...');
  const resInvalidPwd = await fetch(`${BASE_URL}/auth/register-setup-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'weak',
      confirmPassword: 'weak',
      firstName: 'Aarav',
      lastName: 'Patel',
      role: 'PATIENT',
    }),
  });
  const dataInvalidPwd = await resInvalidPwd.json();
  console.log('Status:', resInvalidPwd.status);
  console.log('Response:', dataInvalidPwd);
  if (resInvalidPwd.status !== 400) {
    throw new Error(`Expected 400 for invalid password, got ${resInvalidPwd.status}`);
  }
  console.log('✔ Password complexity validation passed.');

  // TEST 2: Valid Initiate TOTP Setup
  console.log('\n[Test 2] Testing valid POST /auth/register-setup-totp...');
  const resSetup = await fetch(`${BASE_URL}/auth/register-setup-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: validPassword,
      confirmPassword: validPassword,
      firstName: 'Aarav',
      lastName: 'Patel',
      role: 'PATIENT',
      phone: '+91 9876543210',
    }),
  });
  const dataSetup = await resSetup.json();
  console.log('Status:', resSetup.status);
  console.log('Has registrationToken:', !!dataSetup.registrationToken);
  console.log('Has qrCodeUrl:', !!dataSetup.qrCodeUrl);
  console.log('Has manualSetupKey:', !!dataSetup.manualSetupKey);
  console.log('Backup codes count:', dataSetup.backupCodes?.length || 0);

  if (resSetup.status !== 200 || !dataSetup.registrationToken || !dataSetup.manualSetupKey) {
    throw new Error(`Setup failed: ${JSON.stringify(dataSetup)}`);
  }
  console.log('✔ TOTP setup initiated successfully.');

  // TEST 3: Invalid 6-digit TOTP code verification
  console.log('\n[Test 3] Testing invalid TOTP code verification...');
  const resBadCode = await fetch(`${BASE_URL}/auth/register-verify-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationToken: dataSetup.registrationToken,
      code: '000000',
    }),
  });
  const dataBadCode = await resBadCode.json();
  console.log('Status:', resBadCode.status);
  console.log('Message:', dataBadCode.message);
  if (resBadCode.status !== 400) {
    throw new Error(`Expected 400 for invalid TOTP code, got ${resBadCode.status}`);
  }
  console.log('✔ Invalid TOTP code rejection passed.');

  // TEST 4: Valid TOTP code verification and account completion
  console.log('\n[Test 4] Testing valid TOTP verification & account creation...');
  const currentCode = speakeasy.totp({
    secret: dataSetup.manualSetupKey,
    encoding: 'base32',
  });
  console.log('Generated TOTP code:', currentCode);

  const resVerify = await fetch(`${BASE_URL}/auth/register-verify-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationToken: dataSetup.registrationToken,
      code: currentCode,
    }),
  });
  const dataVerify = await resVerify.json();
  console.log('Status:', resVerify.status);
  console.log('Has accessToken:', !!dataVerify.accessToken);
  console.log('User email:', dataVerify.user?.email);
  console.log('User role:', dataVerify.user?.role?.code || dataVerify.user?.role);
  console.log('User patientId:', dataVerify.user?.patientId);
  console.log('User medinexaPersonId:', dataVerify.user?.medinexaPersonId);

  if (resVerify.status !== 201 || !dataVerify.accessToken || !dataVerify.user) {
    throw new Error(`Account verification failed: ${JSON.stringify(dataVerify)}`);
  }
  console.log('✔ Account created and 2FA verified successfully.');

  // TEST 5: Duplicate email registration rejection
  console.log('\n[Test 5] Testing duplicate email registration prevention...');
  const resDup = await fetch(`${BASE_URL}/auth/register-setup-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: validPassword,
      confirmPassword: validPassword,
      firstName: 'Aarav',
      lastName: 'Patel',
      role: 'PATIENT',
    }),
  });
  const dataDup = await resDup.json();
  console.log('Status:', resDup.status);
  console.log('Message:', dataDup.message);
  if (resDup.status !== 409) {
    throw new Error(`Expected 409 for duplicate email, got ${resDup.status}`);
  }
  console.log('✔ Duplicate email correctly rejected with 409 Conflict.');

  // TEST 6: Login with credentials (triggers 2FA challenge)
  console.log('\n[Test 6] Testing Login flow...');
  const resLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: validPassword,
    }),
  });
  const dataLogin = await resLogin.json();
  console.log('Status:', resLogin.status);
  console.log('Requires 2FA:', dataLogin.requires2fa || dataLogin.is2faRequired);
  const challengeToken = dataLogin.challengeToken;
  console.log('Has challengeToken for 2FA challenge:', !!challengeToken);

  if (resLogin.status !== 200 || !dataLogin.requires2fa || !challengeToken) {
    throw new Error(`Login 2FA challenge failed: ${JSON.stringify(dataLogin)}`);
  }
  console.log('✔ Login initiated 2FA challenge successfully.');

  // TEST 7: Login 2FA Code Verification
  console.log('\n[Test 7] Testing login 2FA code verification...');
  const loginCode = speakeasy.totp({
    secret: dataSetup.manualSetupKey,
    encoding: 'base32',
  });
  const resLoginTotp = await fetch(`${BASE_URL}/auth/verify-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeToken: challengeToken,
      code: loginCode,
    }),
  });
  const dataLoginTotp = await resLoginTotp.json();
  console.log('Status:', resLoginTotp.status);
  console.log('Has Final accessToken:', !!dataLoginTotp.accessToken);
  console.log('User email:', dataLoginTotp.user?.email);

  if (resLoginTotp.status !== 200 || !dataLoginTotp.accessToken) {
    throw new Error(`Login 2FA verification failed: ${JSON.stringify(dataLoginTotp)}`);
  }
  console.log('✔ Login 2FA verification passed successfully.');

  console.log('\n============================================================');
  console.log('ALL 7 REGISTRATION & 2FA VERIFICATION TESTS PASSED CLEANLY!');
  console.log('============================================================');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
