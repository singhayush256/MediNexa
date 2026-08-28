const API_BASE = 'http://localhost:3001/api/v1';

async function runHrmsWorkforceE2ETest() {
  console.log('==================================================');
  console.log('🏥 MEDINEXA HRMS, WORKFORCE & PAYROLL E2E TEST');
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
    // 1. Authenticate Doctor
    const docRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doc.reminder@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenDoc } = await docRes.json();
    assert(tokenDoc, '1. Attending Doctor authenticated successfully');

    // 2. Authenticate Hospital Admin A
    const adminARes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospa@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenA } = await adminARes.json();
    assert(tokenA, '2. Hospital Admin A authenticated successfully');

    // 3. Authenticate Hospital Admin B
    const adminBRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin.hospb@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenB } = await adminBRes.json();
    assert(tokenB, '3. Hospital Admin B authenticated successfully');

    // 4. Authenticate Nurse (Nurse Joy)
    const nurseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse.joy@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenNurse } = await nurseRes.json();
    assert(tokenNurse, '4. Nurse authenticated successfully');

    // 5. Authenticate Receptionist
    const recepRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception.a@medinexa.local', password: 'Password123!' }),
    });
    const { accessToken: tokenRecep } = await recepRes.json();
    assert(tokenRecep, '5. Receptionist authenticated successfully');

    // Load hospital departments via doctors directory
    const doctorsRes = await fetch(`${API_BASE}/doctors`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(doctorsRes) && doctorsRes.length > 0, '6. Hospital doctors/departments loaded');
    const targetDeptId = doctorsRes[0].departmentId;

    // --- Step 1: Employee Registration & Salary Structure ---
    console.log('\n--- Step 1: Employee Registration & Salary Structure ---');
    const createEmp1Res = await fetch(`${API_BASE}/hrms/employees`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: `Dr. Sarah Connor, MD ${Date.now()}`,
        departmentId: targetDeptId,
        designation: 'Senior Critical Care Intensivist',
        employmentType: 'FULL_TIME',
        basicSalary: 95000.0,
        hra: 38000.0,
        allowances: 15000.0,
      }),
    });
    assert(createEmp1Res.status === 201 || createEmp1Res.status === 200, '7. POST /hrms/employees (Staff 1) returned HTTP 201/200');
    const emp1 = await createEmp1Res.json();
    assert(emp1.id && emp1.employeeCode.startsWith('EMP-'), `8. Employee #${emp1.employeeCode} registered (${emp1.fullName})`);
    assert(emp1.salaryStructure?.netSalary > 0, `9. Compensation & Salary Structure calculated (Net: $${emp1.salaryStructure?.netSalary})`);

    const createEmp2Res = await fetch(`${API_BASE}/hrms/employees`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: `Nurse James Miller, RN ${Date.now()}`,
        departmentId: targetDeptId,
        designation: 'ICU Charge Nurse',
        employmentType: 'FULL_TIME',
        basicSalary: 52000.0,
        hra: 20800.0,
        allowances: 6000.0,
      }),
    });
    const emp2 = await createEmp2Res.json();
    assert(emp2.id, `10. Employee #${emp2.employeeCode} registered (${emp2.fullName})`);

    // List Employees
    const listEmpRes = await fetch(`${API_BASE}/hrms/employees`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listEmpRes) && listEmpRes.length >= 2, '11. Hospital Employees Directory listed');

    // --- Step 2: Biometric Attendance (Clock-In / Clock-Out) ---
    console.log('\n--- Step 2: Biometric Attendance (Clock-In / Clock-Out) ---');
    const checkInRes = await fetch(`${API_BASE}/hrms/attendance/checkin`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: emp1.id }),
    });
    assert(checkInRes.status === 201 || checkInRes.status === 200, '12. POST /hrms/attendance/checkin returned HTTP 201/200');
    const attRecord = await checkInRes.json();
    assert(attRecord.attendanceStatus === 'PRESENT', '13. Employee clock-in recorded with status PRESENT');

    const checkOutRes = await fetch(`${API_BASE}/hrms/attendance/checkout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: emp1.id }),
    });
    assert(checkOutRes.status === 201 || checkOutRes.status === 200, '14. POST /hrms/attendance/checkout returned HTTP 201/200');
    const updatedAtt = await checkOutRes.json();
    assert(updatedAtt.checkOutTime !== null && updatedAtt.totalHours > 0, `15. Clock-out completed (Total shift hours: ${updatedAtt.totalHours} hrs)`);

    const listAttRes = await fetch(`${API_BASE}/hrms/attendance`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listAttRes) && listAttRes.length >= 1, '16. Attendance records roster loaded');

    // --- Step 3: Shift Scheduling & Overlap Prevention Guard ---
    console.log('\n--- Step 3: Shift Scheduling & Overlap Prevention Guard ---');
    const shift1Start = new Date(Date.now() + 86400000).toISOString(); // Tomorrow 8am
    const shift1End = new Date(Date.now() + 86400000 + 28800000).toISOString(); // Tomorrow 4pm

    const createShiftRes = await fetch(`${API_BASE}/hrms/shifts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: emp2.id,
        departmentId: targetDeptId,
        shiftType: 'MORNING',
        startTime: shift1Start,
        endTime: shift1End,
      }),
    });
    assert(createShiftRes.status === 201 || createShiftRes.status === 200, '17. POST /hrms/shifts returned HTTP 201/200');
    const shift1 = await createShiftRes.json();
    assert(shift1.id && shift1.shiftType === 'MORNING', '18. Shift schedule assigned to ICU Charge Nurse');

    // Overlap Prevention Guard: Assigning overlapping shift time rejected
    const overlapShiftRes = await fetch(`${API_BASE}/hrms/shifts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: emp2.id,
        departmentId: targetDeptId,
        shiftType: 'EVENING',
        startTime: shift1Start,
        endTime: shift1End,
      }),
    });
    assert(overlapShiftRes.status === 400, '19. Overlap Guard: Overlapping shift for same staff rejected with HTTP 400 Bad Request');

    const listShiftsRes = await fetch(`${API_BASE}/hrms/shifts`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listShiftsRes) && listShiftsRes.length >= 1, '20. Shift assignments roster loaded');

    // --- Step 4: Leave Application & Approval Workflows ---
    console.log('\n--- Step 4: Leave Application & Approval Workflows ---');
    const createLeaveRes = await fetch(`${API_BASE}/hrms/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: emp2.id,
        leaveType: 'CASUAL',
        startDate: new Date(Date.now() + 172800000).toISOString(),
        endDate: new Date(Date.now() + 259200000).toISOString(),
        reason: 'Annual family medical leave',
      }),
    });
    assert(createLeaveRes.status === 201 || createLeaveRes.status === 200, '21. POST /hrms/leave returned HTTP 201/200');
    const leaveData = await createLeaveRes.json();
    assert(leaveData.id && leaveData.approvalStatus === 'PENDING', '22. Leave request filed with status PENDING');

    // Approve Leave
    const approveLeaveRes = await fetch(`${API_BASE}/hrms/leave/${leaveData.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(approveLeaveRes.status === 200, '23. PATCH /hrms/leave/:id/approve returned HTTP 200 OK');
    const approvedLeave = await approveLeaveRes.json();
    assert(approvedLeave.approvalStatus === 'APPROVED', '24. Leave request approved by HR Admin');

    // --- Step 5: Monthly Payroll Disbursement & Payslips ---
    console.log('\n--- Step 5: Monthly Payroll Disbursement & Payslips ---');
    const payrollRunRes = await fetch(`${API_BASE}/hrms/payroll/run`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payrollMonth: '2026-08',
      }),
    });
    assert(payrollRunRes.status === 201 || payrollRunRes.status === 200, '25. POST /hrms/payroll/run returned HTTP 201/200');
    const payrollRun = await payrollRunRes.json();
    assert(payrollRun.status === 'COMPLETED' && payrollRun.totalEmployees >= 2, `26. Payroll Run completed for ${payrollRun.totalEmployees} staff members (Total: $${payrollRun.totalPayrollAmount})`);
    assert(payrollRun.payslips.length >= 2, '27. Individual payslips generated with PDF links');

    // Query Payroll Runs
    const listPayrollRes = await fetch(`${API_BASE}/hrms/payroll`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(listPayrollRes) && listPayrollRes.length >= 1, '28. Payroll history roster loaded');

    // Query Employee Payslips
    const payslipsRes = await fetch(`${API_BASE}/hrms/payslips/${emp1.id}`, { headers: { Authorization: `Bearer ${tokenA}` } }).then((r) => r.json());
    assert(Array.isArray(payslipsRes) && payslipsRes.length >= 1, `29. Payslips retrieved for Employee #${emp1.employeeCode}`);

    // --- Step 6: HRMS Analytics & Multi-Tenant Security Guards ---
    console.log('\n--- Step 6: HRMS Analytics & Multi-Tenant Security Guards ---');
    const analyticsRes = await fetch(`${API_BASE}/hrms/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert(analyticsRes.status === 200, '30. GET /hrms/analytics returned HTTP 200 OK');
    const analytics = await analyticsRes.json();
    assert(analytics.totalEmployees >= 2 && analytics.attendancePercentage > 0, `31. Analytics returned totalEmployees: ${analytics.totalEmployees}, attendance: ${analytics.attendancePercentage}%`);

    // Multi-Hospital Isolation Guard: Hospital B Admin blocked from Hospital A employee records
    const isoRes = await fetch(`${API_BASE}/hrms/payslips/${emp1.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(isoRes.status === 403, '32. Multi-Hospital Isolation Guard: Hospital B Admin blocked with HTTP 403 Forbidden from Hospital A employee payslips');

    console.log('\n==================================================');
    console.log(`📊 HRMS, WORKFORCE & PAYROLL RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during HRMS E2E test:', err);
    process.exit(1);
  }
}

runHrmsWorkforceE2ETest();
