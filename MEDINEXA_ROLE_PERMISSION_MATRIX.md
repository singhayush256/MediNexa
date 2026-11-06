# MEDINEXA ROLE & PERMISSION MATRIX

**Document Version:** 1.0.0  
**Enforcement Level:** Backend Route Guards, Prisma Database Constraints, and Service-Layer Checks  
**Architecture:** Multi-Tenant Healthcare Operating System  

---

## 1. Comprehensive Role Hierarchy Matrix

| Capability / Operational Domain | Super Admin | Hospital Admin | Manager | Doctor | Nurse | Receptionist | Lab Staff | Pharmacist | Patient |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Platform Administration** | | | | | | | | | |
| Provision New Hospital Facility | **YES** | NO | NO | NO | NO | NO | NO | NO | NO |
| Activate / Suspend Hospital | **YES** | NO | NO | NO | NO | NO | NO | NO | NO |
| Global Cross-Hospital Oversight | **YES** | NO | NO | NO | NO | NO | NO | NO | NO |
| System-Wide Audit Event Inspection | **YES** | NO | NO | NO | NO | NO | NO | NO | NO |
| **Hospital Facility Management** | | | | | | | | | |
| Manage Facility Profile & Services | Platform-wide | Assigned Hospital | View Only | View Only | View Only | View Only | View Only | View Only | Public Overview |
| Configure Departments & Wards | Platform-wide | Assigned Hospital | View Only | View Only | View Only | View Only | View Only | View Only | NO |
| Update Hospital Bed Availability | Platform-wide | Assigned Hospital | Assigned Hospital | Assigned Hospital | Assigned Ward | View / Status Sync | NO | NO | Public Read-Only |
| **Workforce & Onboarding Hierarchy** | | | | | | | | | |
| Provision Initial Hospital Admin | **YES** | NO | NO | NO | NO | NO | NO | NO | NO |
| Create / Invite Operations Manager | NO | **YES** | NO | NO | NO | NO | NO | NO | NO |
| Grant / Revoke Manager Onboarding Delegation | NO | **YES** | NO | NO | NO | NO | NO | NO | NO |
| Invite Operational Staff (Doc, Nurse, etc.) | NO | **YES** | **Only with explicit grant** (Default: Disabled) | NO | NO | NO | NO | NO | NO |
| Self-Register into Staff Role | NO | NO | NO | NO | NO | NO | NO | NO | NO |
| Public Self-Registration | NO | NO | NO | NO | NO | NO | NO | NO | **YES** |
| Accept Single-Use Invitation Code | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | N/A |
| **Clinical Care & Encounters** | | | | | | | | | |
| Create / View Clinical Encounters | NO | Scoped Audit | NO | **YES** | **YES** | **BLOCKED** | NO | NO | Own Summary |
| Write Doctor SOAP Notes | NO | NO | NO | **YES** | NO | **BLOCKED** | NO | NO | NO |
| Issue Digital Prescriptions | NO | NO | NO | **YES** | NO | **BLOCKED** | NO | NO | View Own |
| Inpatient Vitals & Medication Admin | NO | NO | NO | **YES** | **YES** | NO | NO | NO | View Own |
| Pathology & Imaging Diagnostics | NO | NO | NO | Order / View | Order / View | NO | **Execute & Report** | NO | View Own |
| Dispense Medications from Pharmacy | NO | NO | NO | Prescribe Only | NO | NO | NO | **Dispense & Verify** | Purchase Only |
| **Front-Desk & Intake Operations** | | | | | | | | | |
| View Hospital Doctor Schedules | Platform-wide | Assigned Hospital | Assigned Hospital | Assigned Hospital | Assigned Hospital | **YES** | NO | NO | Public Slots |
| Book OPD Appointments | Platform-wide | Assigned Hospital | Assigned Hospital | Assigned Hospital | Assigned Hospital | **YES** | NO | NO | **YES** |
| Manage Intake Check-in & Queue Tokens | NO | Assigned Hospital | Assigned Hospital | Assigned Queue | Assigned Ward | **YES** | Queue View | Queue View | Own Token |
| **Patient Health OS** | | | | | | | | | |
| View Own Longitudinal Medical Records | NO | NO | NO | Assigned Patients | Assigned Patients | NO | NO | NO | **YES** |
| Add Family Members & Emergency SOS | NO | NO | NO | NO | NO | NO | NO | NO | **YES** |
| Select Preferred Family Doctor | NO | NO | NO | NO | NO | NO | NO | NO | **YES** |

---

## 2. Delegation & Role Creation Constraints

```text
Super Admin  ──(Can Invite)──> Hospital Admin
Hospital Admin ──(Can Invite)──> Manager, Doctor, Nurse, Receptionist, Lab Staff, Pharmacist, Billing Staff
Manager       ──(Can Invite)──> Doctor, Nurse, Receptionist, Lab Staff, Pharmacist, Billing Staff, Ward Staff
Doctor        ──(Can Invite)──> [NONE - FORBIDDEN]
Nurse         ──(Can Invite)──> [NONE - FORBIDDEN]
Receptionist  ──(Can Invite)──> [NONE - FORBIDDEN]
Lab Staff     ──(Can Invite)──> [NONE - FORBIDDEN]
Pharmacist    ──(Can Invite)──> [NONE - FORBIDDEN]
Patient       ──(Can Invite)──> [NONE - FORBIDDEN]
```

### Prohibited Transitions:
- **No Role Escalation:** A Manager cannot invite an Admin or another Manager.
- **No Self-Creation:** No user can create or elevate their own role.
- **Tenant Lockdown:** Hospital Admins and Managers cannot invite staff into a facility other than their own `facilityId`.

