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

async function runHrmsE2ETests() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA ENTERPRISE HRMS & WORKFORCE OPERATIONS E2E TEST');
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

    // 3. Authenticate Attending Doctor
    const docAuth = await login('doc.reminder@medinexa.local', 'Password123!');
    assert(!!docAuth.token, 'Attending Physician authenticated successfully');
    const docToken = docAuth.token;

    // 4. Authenticate Patient
    const patientAuth = await login('patient.doe@medinexa.local', 'Password123!');
    assert(!!patientAuth.token, 'Patient authenticated successfully');
    const patientToken = patientAuth.token;

    console.log('\n--- Step 1: Strict RBAC Security Guards ---');
    // 5. Patient blocked from registering employees
    const patEmpRes = await fetch(`${BASE_URL}/hrms/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ fullName: 'Unauthorized Emp', designation: 'Nurse', department: 'ICU' }),
    });
    assert(patEmpRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from registering employees');

    // 6. Patient blocked from shift assignment
    const patShiftRes = await fetch(`${BASE_URL}/hrms/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ employeeId: 'some-id', shiftName: 'NIGHT', startTime: new Date().toISOString(), endTime: new Date().toISOString() }),
    });
    assert(patShiftRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from creating shifts');

    // 7. Patient blocked from generating payroll
    const patPayRes = await fetch(`${BASE_URL}/hrms/payroll/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ payrollMonth: '2026-08' }),
    });
    assert(patPayRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from generating payroll');

    // 8. Patient blocked from performance reviews
    const patPerfRes = await fetch(`${BASE_URL}/hrms/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ employeeId: 'some-id', reviewPeriod: '2026-Q3', rating: 5, strengths: 'Good', improvements: 'None', comments: 'Great' }),
    });
    assert(patPerfRes.status === 403, 'RBAC Guard: Patient blocked with HTTP 403 Forbidden from submitting performance reviews');

    console.log('\n--- Step 2: Employee Lifecycle (Onboarding & Profile) ---');
    // 9. Register Hospital Employee (Senior ICU Intensivist)
    const empCode = `EMP-HR-${Date.now().toString().slice(-4)}`;
    const createEmpRes = await fetch(`${BASE_URL}/hrms/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        fullName: 'Dr. Siddharth Mukherjee, MD',
        department: 'Critical Care & ICU',
        designation: 'Senior Intensivist',
        employeeCode: empCode,
        phone: '+91-98765-43210',
        email: `siddharth.${Date.now().toString().slice(-4)}@medinexa.local`,
        emergencyContact: '+91-98765-00000 (Spouse)',
        joiningDate: new Date('2023-04-01').toISOString(),
        employeeStatus: 'ACTIVE',
        basicSalary: 120000.0,
        allowances: 35000.0,
        deductions: 18000.0,
      }),
    });
    const empData = await createEmpRes.json();
    assert(createEmpRes.status === 201 || createEmpRes.status === 200, 'POST /hrms/employees returned HTTP 201/200');
    assert(empData.id && empData.employeeCode === empCode, `Employee Profile created with Code #${empCode}`);
    assert(empData.department === 'Critical Care & ICU', 'Department assigned as Critical Care & ICU');
    assert(empData.employeeStatus === 'ACTIVE', 'Initial status set to ACTIVE');
    const employeeId = empData.id;

    // 10. Query Employee by ID
    const getEmpRes = await fetch(`${BASE_URL}/hrms/employees/${employeeId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const fetchedEmp = await getEmpRes.json();
    assert(getEmpRes.status === 200, 'GET /hrms/employees/:id returned HTTP 200 OK');
    assert(fetchedEmp.id === employeeId, 'Employee profile matches ID');
    assert(fetchedEmp.payrollRecords && fetchedEmp.payrollRecords.length > 0, 'Auto-generated initial salary structure present');

    // 11. Query Employee List
    const listEmpRes = await fetch(`${BASE_URL}/hrms/employees?department=Critical Care & ICU`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const empList = await listEmpRes.json();
    assert(listEmpRes.status === 200, 'GET /hrms/employees returned HTTP 200 OK');
    assert(Array.isArray(empList) && empList.some((e) => e.id === employeeId), 'Employee listed in department roster');

    // 12. Update Employee Profile
    const updateEmpRes = await fetch(`${BASE_URL}/hrms/employees/${employeeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({ designation: 'Lead Intensivist & ICU Director' }),
    });
    const updatedEmp = await updateEmpRes.json();
    assert(updateEmpRes.status === 200, 'PATCH /hrms/employees/:id returned HTTP 200 OK');
    assert(updatedEmp.designation === 'Lead Intensivist & ICU Director', 'Designation updated to Lead Intensivist & ICU Director');

    console.log('\n--- Step 3: Biometric Attendance Tracking (Check-In / Check-Out) ---');
    // 13. Clock In
    const clockInRes = await fetch(`${BASE_URL}/hrms/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        checkInTime: new Date(Date.now() - 8.5 * 3600 * 1000).toISOString(),
      }),
    });
    const clockInData = await clockInRes.json();
    assert(clockInRes.status === 201 || clockInRes.status === 200, 'POST /hrms/attendance/check-in returned HTTP 201/200');
    assert(clockInData.attendanceStatus === 'PRESENT', 'Attendance status marked as PRESENT');
    assert(!!clockInData.checkInTime, 'Clock-in timestamp recorded');

    // 14. Clock Out
    const clockOutRes = await fetch(`${BASE_URL}/hrms/attendance/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        checkOutTime: new Date().toISOString(),
      }),
    });
    const clockOutData = await clockOutRes.json();
    assert(clockOutRes.status === 201 || clockOutRes.status === 200, 'POST /hrms/attendance/check-out returned HTTP 201/200');
    assert(clockOutData.workingHours >= 8.0, `Calculated working hours: ${clockOutData.workingHours} hrs`);

    // 15. Query Attendance Records
    const getAttRes = await fetch(`${BASE_URL}/hrms/attendance?employeeId=${employeeId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const attList = await getAttRes.json();
    assert(getAttRes.status === 200, 'GET /hrms/attendance returned HTTP 200 OK');
    assert(Array.isArray(attList) && attList.length > 0, 'Attendance history log verified');

    console.log('\n--- Step 4: Shift Scheduling & Overlap Prevention Guard ---');
    // 16. Create Shift Schedule
    const shiftStart = new Date(Date.now() + 24 * 3600 * 1000);
    const shiftEnd = new Date(Date.now() + 32 * 3600 * 1000);
    const createShiftRes = await fetch(`${BASE_URL}/hrms/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        shiftName: 'ICU_NIGHT_STAT',
        department: 'Critical Care & ICU',
        startTime: shiftStart.toISOString(),
        endTime: shiftEnd.toISOString(),
      }),
    });
    const shiftData = await createShiftRes.json();
    assert(createShiftRes.status === 201 || createShiftRes.status === 200, 'POST /hrms/shifts returned HTTP 201/200');
    assert(shiftData.shiftName === 'ICU_NIGHT_STAT', 'Shift name assigned as ICU_NIGHT_STAT');
    const shiftId = shiftData.id;

    // 17. Shift Overlap Guard
    const overlapShiftRes = await fetch(`${BASE_URL}/hrms/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        shiftName: 'ICU_DAY',
        department: 'Critical Care & ICU',
        startTime: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 30 * 3600 * 1000).toISOString(),
      }),
    });
    assert(overlapShiftRes.status === 400, 'Shift Guard: Overlapping shift schedule rejected with HTTP 400 Bad Request');

    // 18. Query Shift Roster
    const getShiftsRes = await fetch(`${BASE_URL}/hrms/shifts?employeeId=${employeeId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const shiftList = await getShiftsRes.json();
    assert(getShiftsRes.status === 200, 'GET /hrms/shifts returned HTTP 200 OK');
    assert(Array.isArray(shiftList) && shiftList.some((s) => s.id === shiftId), 'Shift confirmed in facility master roster');

    console.log('\n--- Step 5: Leave Management (Request, Approve, Reject) ---');
    // 19. Submit Leave Request
    const createLeaveRes = await fetch(`${BASE_URL}/hrms/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        leaveType: 'EARNED',
        startDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 13 * 24 * 3600 * 1000).toISOString(),
        reason: 'Attending International Critical Care Congress (Speaker)',
      }),
    });
    const leaveData = await createLeaveRes.json();
    assert(createLeaveRes.status === 201 || createLeaveRes.status === 200, 'POST /hrms/leave returned HTTP 201/200');
    assert(leaveData.leaveStatus === 'PENDING', 'Leave request created in PENDING status');
    const leaveId = leaveData.id;

    // 20. Approve Leave Request
    const approveLeaveRes = await fetch(`${BASE_URL}/hrms/leave/${leaveId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const approvedLeave = await approveLeaveRes.json();
    assert(approveLeaveRes.status === 200, 'PATCH /hrms/leave/:id/approve returned HTTP 200 OK');
    assert(approvedLeave.leaveStatus === 'APPROVED', 'Leave request status transitioned to APPROVED');
    assert(!!approvedLeave.approvedAt, 'Approval timestamp recorded');

    // 21. Rejection Flow
    const createLeave2Res = await fetch(`${BASE_URL}/hrms/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        leaveType: 'CASUAL',
        startDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
        reason: 'Personal errand',
      }),
    });
    const leave2Data = await createLeave2Res.json();
    const rejectLeaveRes = await fetch(`${BASE_URL}/hrms/leave/${leave2Data.id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const rejectedLeave = await rejectLeaveRes.json();
    assert(rejectLeaveRes.status === 200, 'PATCH /hrms/leave/:id/reject returned HTTP 200 OK');
    assert(rejectedLeave.leaveStatus === 'REJECTED', 'Leave request status transitioned to REJECTED');

    console.log('\n--- Step 6: Payroll Calculation, Generation & Disbursement ---');
    // 22. Generate Monthly Payroll Record
    const currentMonth = '2026-09';
    const genPayRes = await fetch(`${BASE_URL}/hrms/payroll/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        payrollMonth: currentMonth,
        basicSalary: 120000.0,
        allowances: 35000.0,
        deductions: 18000.0,
      }),
    });
    const payData = await genPayRes.json();
    assert(genPayRes.status === 201 || genPayRes.status === 200, 'POST /hrms/payroll/generate returned HTTP 201/200');
    assert(payData.netSalary === 137000.0, `Payroll Engine: Net Salary ($137,000) = Basic ($120,000) + Allowances ($35,000) - Deductions ($18,000)`);
    assert(payData.payrollStatus === 'GENERATED', 'Payroll status is GENERATED');
    const payrollId = payData.id;

    // 23. Disburse Payroll Payment
    const payRes = await fetch(`${BASE_URL}/hrms/payroll/${payrollId}/pay`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const paidPayData = await payRes.json();
    assert(payRes.status === 200, 'PATCH /hrms/payroll/:id/pay returned HTTP 200 OK');
    assert(paidPayData.payrollStatus === 'PAID', 'Payroll status transitioned to PAID');
    assert(!!paidPayData.paidAt, 'Disbursement paidAt timestamp recorded');

    // 24. Query Payroll Register
    const getPayListRes = await fetch(`${BASE_URL}/hrms/payroll?month=${currentMonth}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const payList = await getPayListRes.json();
    assert(getPayListRes.status === 200, 'GET /hrms/payroll returned HTTP 200 OK');
    assert(Array.isArray(payList) && payList.some((p) => p.id === payrollId), 'Paid record present in monthly payroll ledger');

    console.log('\n--- Step 7: Staff Credentialing & License Expiry Monitoring ---');
    // 25. Register Medical Board License (Expiring in 45 days)
    const expDate = new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString();
    const createCredRes = await fetch(`${BASE_URL}/hrms/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        credentialType: 'Medical License',
        licenseNumber: 'MCI-REG-2018-44921',
        issueDate: new Date('2018-05-15').toISOString(),
        expiryDate: expDate,
        verificationStatus: 'VERIFIED',
      }),
    });
    const credData = await createCredRes.json();
    assert(createCredRes.status === 201 || createCredRes.status === 200, 'POST /hrms/credentials returned HTTP 201/200');
    assert(credData.licenseNumber === 'MCI-REG-2018-44921', 'Medical license recorded with MCI registration number');
    assert(credData.verificationStatus === 'VERIFIED', 'Verification status verified');
    const credId = credData.id;

    // 26. Query All Staff Credentials
    const getCredsRes = await fetch(`${BASE_URL}/hrms/credentials?employeeId=${employeeId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const credList = await getCredsRes.json();
    assert(getCredsRes.status === 200, 'GET /hrms/credentials returned HTTP 200 OK');
    assert(Array.isArray(credList) && credList.some((c) => c.id === credId), 'Credential found in staff compliance dossier');

    // 27. Query Expiring Credentials Queue (<= 90 days)
    const getExpCredsRes = await fetch(`${BASE_URL}/hrms/credentials/expiring?days=90`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const expList = await getExpCredsRes.json();
    assert(getExpCredsRes.status === 200, 'GET /hrms/credentials/expiring returned HTTP 200 OK');
    assert(Array.isArray(expList) && expList.some((c) => c.id === credId), 'Credential detected in 90-day license expiration audit queue');

    console.log('\n--- Step 8: Staff Performance Reviews & Appraisals ---');
    // 28. Submit Performance Review
    const createRevRes = await fetch(`${BASE_URL}/hrms/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAToken}` },
      body: JSON.stringify({
        employeeId,
        reviewPeriod: '2026-Q3',
        rating: 4.8,
        strengths: 'Outstanding ICU resuscitation protocol adherence; exceptional intensivist leadership during Code Blue events.',
        improvements: 'Organize quarterly simulation workshops for junior residents.',
        comments: 'Consistently ranks in top 5% of critical care attending physicians.',
      }),
    });
    const revData = await createRevRes.json();
    assert(createRevRes.status === 201 || createRevRes.status === 200, 'POST /hrms/performance returned HTTP 201/200');
    assert(revData.rating === 4.8, 'Performance rating recorded as 4.8 / 5.0');
    assert(revData.reviewPeriod === '2026-Q3', 'Review period recorded as 2026-Q3');

    // 29. Query Performance Reviews
    const getRevsRes = await fetch(`${BASE_URL}/hrms/performance?employeeId=${employeeId}`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const revList = await getRevsRes.json();
    assert(getRevsRes.status === 200, 'GET /hrms/performance returned HTTP 200 OK');
    assert(Array.isArray(revList) && revList.some((r) => r.id === revData.id), 'Appraisal verified in staff performance history');

    console.log('\n--- Step 9: Workforce Analytics Dashboard ---');
    // 30. Query HRMS Analytics
    const getAnalyticsRes = await fetch(`${BASE_URL}/hrms/analytics`, {
      headers: { Authorization: `Bearer ${adminAToken}` },
    });
    const analytics = await getAnalyticsRes.json();
    assert(getAnalyticsRes.status === 200, 'GET /hrms/analytics returned HTTP 200 OK');
    assert(typeof analytics.totalEmployees === 'number', `Analytics: Total Employees: ${analytics.totalEmployees}`);
    assert(typeof analytics.activeEmployees === 'number', `Analytics: Active Staff: ${analytics.activeEmployees}`);
    assert(typeof analytics.attendancePercentage === 'number', `Analytics: Attendance Compliance: ${analytics.attendancePercentage}%`);
    assert(typeof analytics.payrollCost === 'number', `Analytics: Monthly Payroll Cost: $${analytics.payrollCost?.toLocaleString()}`);
    assert(typeof analytics.expiringLicenses === 'number', `Analytics: Expiring Licenses Tracked: ${analytics.expiringLicenses}`);
    assert(Array.isArray(analytics.departmentUtilization), 'Analytics: Department staffing utilization matrix computed');

    console.log('\n--- Step 10: Multi-Hospital Isolation Guard ---');
    // 37. Hospital B Admin blocked from accessing Hospital A Employee Profile
    const crossEmpRes = await fetch(`${BASE_URL}/hrms/employees/${employeeId}`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossEmpRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A employee profile');

    // 38. Hospital B Admin blocked from accessing Hospital A HRMS Analytics
    const crossAnalyticsRes = await fetch(`${BASE_URL}/hrms/analytics?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossAnalyticsRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A workforce analytics');

    // 39. Hospital B Admin blocked from accessing Hospital A Attendance Records
    const crossAttRes = await fetch(`${BASE_URL}/hrms/attendance?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossAttRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A attendance logs');

    // 40. Hospital B Admin blocked from accessing Hospital A Employee Roster
    const crossListRes = await fetch(`${BASE_URL}/hrms/employees?facilityId=95001a7a-3a65-4fb4-85ad-c0cf7e7d2fa8`, {
      headers: { Authorization: `Bearer ${adminBToken}` },
    });
    assert(crossListRes.status === 403, 'Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from accessing Hospital A staff roster');

    console.log('\n==================================================');
    console.log(`🏥 HRMS & WORKFORCE OPERATIONS RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during HRMS E2E test:', err);
    process.exit(1);
  }
}

runHrmsE2ETests();
