# MediNexa — Strict Portal Access Isolation, Account Security & Sidebar Account Menu Report

## Executive Summary
This document provides a comprehensive report of the security, role-based access control (RBAC), and layout architecture corrections performed on the MediNexa Connected Healthcare Platform. 

Prior to this implementation:
1. **Cross-Portal Impersonation / Leakage**: Administrative and Super Admin roles had universal bypass flags in `apps/web/app/dashboard/layout.tsx`, and sidebar menus exposed doctor consultation and reception console links to administrators. This allowed Hospital Admins to open Dr. Rajesh Singh's OPD consultation room or Pooja Singh's Front Desk command console directly. Furthermore, interactive role switchers (`RoleSwitcherModal` and `PatientDemoSwitcherModal`) allowed authenticated sessions to jump between roles dynamically.
2. **Duplicate Sidebar & Layout Rendering**: Workstations under `/dashboard` (such as `/dashboard/doctor-appointments` and `/dashboard/reception`) rendered their own role-tailored sidebars and operational consoles while also being wrapped by parent dashboard layout navigation.
3. **Scattered / Duplicate Account Actions**: Header bars and workstation sub-headers rendered disparate "Logout" buttons, user profile links, and inconsistent modal triggers.
4. **Logout Behavior**: Incomplete logout sequences left cookies or session storage keys intact, and failed to enforce a hard redirect to the public homepage (`/`).

All issues have been resolved across both frontend and backend layers with **0 TypeScript errors**.

---

## 1. Portal Access Isolation & RBAC Rules Matrix

Every user role is now strictly isolated to its single authorized workstation and portal. Universal clearance bypasses have been completely removed. If an authenticated user attempts to access an unauthorized route prefix or URL, they are immediately redirected to their own single authorized portal.

| Portal | Canonical Route | Permitted Roles (Strict Whitelist) | Unauthorized Access Behavior |
| :--- | :--- | :--- | :--- |
| **Super Admin Platform** | `/super-admin`, `/dashboard/super-admin` | `SUPER_ADMIN`, `MEDINEXA_ADMIN` | Auto-redirect to authorized portal |
| **Hospital Admin Console** | `/dashboard/admin`, `/dashboard` | `HOSPITAL_ADMIN`, `ADMIN`, `EXECUTIVE` | Auto-redirect to authorized portal |
| **Doctor Consultations & OPD** | `/dashboard/doctor-appointments` | `DOCTOR` | Auto-redirect to authorized portal |
| **Reception & Front Desk** | `/dashboard/reception`, `/dashboard/appointments` | `RECEPTIONIST` | Auto-redirect to authorized portal |
| **Nursing Stations & MAR** | `/dashboard/nursing`, `/dashboard/nursing/mar` | `NURSE` | Auto-redirect to authorized portal |
| **Billing & Claims** | `/dashboard/billing`, `/dashboard/insurance` | `BILLING_STAFF` | Auto-redirect to authorized portal |
| **Laboratory & Pathology** | `/dashboard/lab`, `/dashboard/laboratory` | `LAB_STAFF`, `LAB_TECH`, `LAB_TECHNICIAN` | Auto-redirect to authorized portal |
| **Radiology & PACS** | `/dashboard/radiology` | `RADIOLOGIST` | Auto-redirect to authorized portal |
| **Pharmacy & Dispensing** | `/dashboard/pharmacy`, `/dashboard/inventory` | `PHARMACY_STAFF`, `PHARMACIST` | Auto-redirect to authorized portal |
| **Emergency & Trauma Center** | `/dashboard/emergency` | `EMERGENCY_STAFF`, `EMS_OPERATOR` | Auto-redirect to authorized portal |
| **Fleet & Ambulance** | `/dashboard/emergency-ambulance` | `AMBULANCE_DRIVER`, `EMS_OPERATOR` | Auto-redirect to authorized portal |
| **Manager & HR Operations** | `/dashboard/manager`, `/dashboard/hrms` | `MANAGER`, `HR_MANAGER`, `WARD_MANAGER` | Auto-redirect to authorized portal |
| **Patient Portal** | `/portal` | `PATIENT` | Auto-redirect to `/portal` |

### Key Route Protection Enforcement in `apps/web/app/dashboard/layout.tsx`:
- Removed `SUPER_ADMIN` universal clearance across hospital and department screens (lines 185–189).
- Replaced route access denial with automatic role-to-dashboard resolution via `getAuthorizedDashboardForRole(normalizedRole)`.
- Enforced strict role whitelists preventing administrative access to operational clinical workstations.

---

## 2. Zero User Impersonation & Account-Switching Elimination

All unauthorized impersonation and account-switching mechanisms have been eradicated:

1. **Dashboard Top Navigation (`apps/web/components/dashboard/DashboardNav.tsx`)**:
   - Removed `RoleSwitcherModal` import and modal rendering.
   - Removed the "Switch Role" button.
   - Removed header Logout button.
   - Converted the header user badge to a non-interactive display indicator (`<div>`), eliminating clickable profile triggers in the top bar.

2. **Dashboard Primary Sidebar (`apps/web/components/dashboard/DashboardSidebar.tsx`)**:
   - Restricted `Doctor Consultations` strictly to `['DOCTOR']`.
   - Restricted `Reception & Front Desk` strictly to `['RECEPTIONIST']`.
   - Restricted `Nursing Stations` strictly to `['NURSE']`.
   - Removed `if (isAdmin) return true;` and `if (isSuperAdmin) return true;` overrides in `visibleSections`, ensuring administrators only see administrative menus.

3. **Patient Portal (`apps/web/components/portal/PortalSidebar.tsx` & `apps/web/app/portal/page.tsx`)**:
   - Removed `PatientDemoSwitcherModal` and the "Switch Patient (10 Demos)" button from the sidebar footer.
   - Removed "Switch Demo Patient (10 Accounts)" button and modal from the portal dashboard page.

4. **Backend Security Guard (`apps/api/src/auth/auth.service.ts`)**:
   - Maintained production block (`ForbiddenException('Demo persona switching is strictly disabled in production environments.')`).

---

## 3. Single Sidebar Architecture & Elimination of Duplicate Navigation

Prior screenshots highlighted that workstations rendered two adjacent sidebars (a generic sidebar and a workstation sidebar).

1. **Root Cause**:
   Workstation pages (`/dashboard/doctor-appointments`, `/dashboard/reception`, `/dashboard/billing`, `/dashboard/nursing`, `/dashboard/lab`, `/dashboard/pharmacy`, `/dashboard/emergency`, `/dashboard/appointments`) implement their own complete, self-contained layouts including operational headers, category sidebars, command palettes, and action bars. When accessed by an Admin whose sidebar listed these workstations, the route was rendered within administrative navigation contexts.
2. **Resolution**:
   - By isolating route permissions, Hospital Admins no longer navigate into employee workstations.
   - Workstation pages are strictly accessible only to their respective staff roles (`DOCTOR`, `RECEPTIONIST`, `NURSE`, etc.).
   - Each workstation renders exactly **ONE** dedicated, responsive left sidebar with its department tools.

---

## 4. Strict Sidebar Bottom Account Menu Standard

In accordance with the prompt specification:
- **No clickable Profile or Logout in Top Headers**: All duplicate logout buttons in top headers across all workstations (`doctor-appointments`, `billing`, `nursing`, `lab`, `pharmacy`, `emergency`, `appointments`, and `DashboardNav`) have been removed.
- **Single Canonical Account Section**: For every portal and workstation, `My Profile`, `Settings`, and `Logout` are permanently anchored at the bottom of the left sidebar:

### A. General Dashboard Sidebar (`DashboardSidebar.tsx`)
- `My Profile` (`/dashboard/admin/hospital-profile` or `/dashboard/manager/profile`)
- `Settings` (`/dashboard/admin/settings` or `/dashboard/manager/settings`)
- `Logout` (`logoutUser('/')`)

### B. Super Admin Portal (`apps/web/app/super-admin/layout.tsx`)
- Status banner ("Platform Operational")
- `My Profile` (`/super-admin/profile`)
- `Settings` (`/super-admin/settings`)
- `Logout` (`logoutUser('/')`)

### C. Manager Portal (`apps/web/components/manager/ManagerSidebar.tsx`)
- `My Profile` (`/dashboard/manager/profile`)
- `Settings` (`/dashboard/manager/settings`)
- `Logout` (`logoutUser('/')`)
- Moved `Notifications` into upper `COMMAND CENTER` items.

### D. Patient Portal (`apps/web/components/portal/PortalSidebar.tsx`)
- Authenticated user identity card (Name, Email, Avatar)
- `My Profile` (`/portal/profile`)
- `Settings` (`/portal/settings`)
- `Logout` (`logoutUser('/')`)

### E. Workstations (`doctor-appointments`, `reception`, `billing`, `nursing`, `lab`, `pharmacy`, `emergency`, `appointments`)
- Theme Toggle
- `My Profile` (opens canonical `WorkstationProfileModal` with dynamic photo uploader: Gallery, File, Camera)
- `Settings` / `Station Settings` (opens canonical `WorkstationSettingsModal`)
- `Logout` / `Sign Out Station` (calls `logoutUser('/')`)

---

## 5. Canonical Logout Implementation (`apps/web/lib/auth-session.ts`)

The centralized `logoutUser(redirectTo = '/')` function guarantees:
1. **Preservation**: Retains user theme preference (`medinexa_theme`, `theme`).
2. **Token Cleansing**: Removes `medinexa_token`, `token`, `medinexa_user`, `medinexa_active_hospital_id`, `medinexa_demo_mode`, `medinexa_clean_patient_session`, `medinexa_patient_persona`.
3. **Session Cleansing**: Executes `sessionStorage.clear()`.
4. **Cookie Invalidation**: Sets `medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`.
5. **Memory Notification**: Dispatches `USER_UPDATE_EVENT` with `null`.
6. **Hard Redirection**: Executes `window.location.replace('/')` to replace browser history state and prevent backward navigation from restoring authenticated UI.

---

## 6. TypeScript Compilation Verification

Both workspaces were validated with strict compiler checks:

```powershell
# Web Application Check
npx tsc --noEmit -p apps/web/tsconfig.json
# Result: Exit code 0 (0 errors)

# API Backend Check
npx tsc --noEmit -p apps/api/tsconfig.json
# Result: Exit code 0 (0 errors)
```

## 7. Versioning Alignment
- Confirmed version is `v1.0` / `V1.0` across landing, marketing, and dashboard headers as requested. (Only medical ECG lead identifiers such as `V3-V5` remain untouched).

---

## 8. Compliance & Non-Commit Guarantee
- **Git Commit / Push**: In strict compliance with guidelines, no `git add`, `git commit`, or `git push` commands were executed. All changes reside in the local working directory ready for inspection.

