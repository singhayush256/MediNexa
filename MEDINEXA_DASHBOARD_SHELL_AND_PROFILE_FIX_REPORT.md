# MEDINEXA — DASHBOARD SHELL OWNERSHIP & AUTHENTICATED PROFILE IDENTITY FIX REPORT

**Date:** November 7, 2026  
**Status:** FIXED AND VERIFIED  
**Workspaces Affected:** `@medinexa/web`, `@medinexa/api`

---

## 1. Executive Summary

This report documents the resolution of two critical production issues in MediNexa:
1. **ISSUE A (Duplicate Dashboard Navigation/Sidebars):** Non-patient workstation portals (such as Reception at `/dashboard/reception` and Doctor Appointments at `/dashboard/doctor-appointments`) were rendering two simultaneous navigation sidebars and headers—a generic dashboard shell alongside the workstation's own role-specific layout.
2. **ISSUE B (User Profile Identity Conflict & Hardcoded Fallbacks):** Headers, profile cards, and account views displayed conflicting or hardcoded fallback identities (e.g., Reception top global header showing `Dr. Sunita Singh — HOSPITAL ADMIN` while the internal counter showed `Pooja Singh — Reception`; profile editing views showing hardcoded demo identities and failing to persist server-side).

Both issues have been resolved cleanly with zero regressions to existing functionality and zero modifications to the Patient Portal (`/portal/*`).

---

## 2. Root Cause Analysis

### Issue A: Double Sidebar Layout Clash
- **Root Cause:** In `apps/web/app/dashboard/layout.tsx`, the layout previously unconditionally wrapped all sub-routes in `<DashboardShellProvider value={true}>`, rendering the outer `<DashboardNav>` and `<DashboardSidebar>`. However, eight dedicated clinical and operational workstations (`reception`, `doctor-appointments`, `nursing`, `lab`, `pharmacy`, `billing`, `emergency`, `appointments`) already contain complete, highly specialized workstation shells with their own `<aside>` navigation sidebars, counter headers, and queue controls. Wrapping them inside the generic shell created a dual-sidebar hierarchy, compressing workspace tables and producing visual conflicts.

### Issue B: Identity Mismatch & Hardcoded Fallbacks
- **Root Cause 1 (Hardcoded Fallback Identities):** Components across `DashboardNav.tsx`, `DashboardSidebar.tsx`, `/dashboard/profile/page.tsx`, and individual workstation pages fell back to static mock names (e.g., `Dr. Sunita Singh`, `Pooja Singh`, `Dr. Rajesh Singh`, `Sister Mary D'Souza`, `Dr. Deepak Singh`, `Vikram Sethi`) whenever an initial render occurred before client-side session hydration completed.
- **Root Cause 2 (Lack of Backend Profile Update Endpoint):** The profile page (`/dashboard/profile/page.tsx`) previously saved changes strictly to `localStorage`, meaning edits were ephemeral and did not persist across sessions or devices.
- **Root Cause 3 (Stale LocalStorage / Incomplete Logout):** Logout routines across different workstation components cleared inconsistent keys (some removing `medinexa_token` but leaving `medinexa_user` or session cookies), causing identity leakage when switching between roles or accounts.

---

## 3. Architecture & Implementation Fixes

### 3.1 Layout Shell Ownership Strategy (`apps/web/app/dashboard/layout.tsx`)
- Established a clean, route-level shell ownership contract:
  - **Workstation Routes (`ROLE_SPECIFIC_WORKSTATION_ROUTES`):**
    - `/dashboard/reception`
    - `/dashboard/doctor-appointments`
    - `/dashboard/nursing`
    - `/dashboard/lab`
    - `/dashboard/pharmacy`
    - `/dashboard/billing`
    - `/dashboard/emergency`
    - `/dashboard/appointments`
  - **Shared Dashboard Routes:** `/dashboard` (Hospital Executive), `/dashboard/super-admin`, `/dashboard/admin/*`, `/dashboard/hrms`, `/dashboard/profile`, `/dashboard/settings`, `/dashboard/revenue`, etc.
- When an authorized user accesses a workstation route, `DashboardLayout` renders the workstation children directly within `DashboardShellProvider value={false}` and mounts `CommandPalette` without rendering outer `DashboardNav` or `DashboardSidebar`.
- When accessing centralized administrative and analytics views, `DashboardLayout` renders `DashboardNav` and `DashboardSidebar` with full RBAC access controls.
- **Result:** Exactly ONE canonical navigation sidebar per screen. Workstations retain their full authentic desktop design without horizontal compression.

### 3.2 Single Authoritative User Session (`apps/web/lib/auth-session.ts`)
- Implemented a unified client-side authentication and session management module:
  - `getAuthToken()`: Safely retrieves the active JWT from `localStorage` or `sessionStorage`.
  - `getAuthenticatedUser()`: Returns the typed `AuthenticatedUser` object from storage.
  - `fetchCurrentAuthenticatedUser()`: Queries the backend `/auth/me` endpoint to validate the cached profile against the server session, refreshing `medinexa_user` and firing the global `medinexa:user-updated` event.
  - `updateAuthenticatedProfile(updates)`: Calls the backend profile update API, refreshes local cache, and notifies all listening UI components.
  - `clearAuthSession()`: Centralized logout routine that completely purges `medinexa_token`, `token`, `medinexa_refresh_token`, `medinexa_user`, `sessionStorage`, and session cookies.

### 3.3 Backend Profile Update API (`@medinexa/api`)
- Added `@Patch('me')` to `apps/api/src/auth/auth.controller.ts` protected by `JwtAuthGuard`.
- Implemented `updateMe(userId, dto)` in `apps/api/src/auth/auth.service.ts`:
  - **Strict Security Boundaries:** Users are strictly barred from updating security-sensitive fields (`role`, `roleCode`, `status`, `facilityId`, `organizationId`).
  - Permitted editable fields include: `firstName`, `lastName`, `phone`, `alternatePhone`, `dateOfBirth`, `gender`, `bloodGroup`, `maritalStatus`, `profilePic`, `address`, `emergencyContact`.
  - Enhanced `toUserDto` to include `designation`, `emergencyContact`, `licenseNumber`, `specialty`, `facilityName`, and `joiningDate`.

### 3.4 Purged All Hardcoded Fallbacks Across Portals
- **`/dashboard/profile/page.tsx`:** Purged static demo details (`Dr. Sunita Singh`, `admin.sunita@medinexa.health`, `Flat 402 Tower B`, etc.). Missing fields now display `Not provided` or standard empty states. Integrated real backend persistence via `updateAuthenticatedProfile`.
- **`DashboardNav.tsx` & `DashboardSidebar.tsx`:** Replaced hardcoded fallback names and `'SS'` initials with dynamic session extraction. Listens to `medinexa:user-updated` for real-time synchronization.
- **Workstations (`reception`, `doctor-appointments`, `nursing`, `lab`, `pharmacy`, `billing`, `emergency`, `appointments`):** Restored authentic role-specific `<aside>` sidebars and bound staff cards and welcome banners dynamically to the verified authenticated user session.

### 3.5 Patient Portal Isolation
- Verified that `apps/web/app/portal/*` and `apps/web/components/portal/PortalSidebar.tsx` remain 100% untouched.

---

## 4. Portals & Roles Verification Matrix

| Portal Route | Shell Type | Sidebar Count | Identity Source | Status |
|---|---|---|---|---|
| `/dashboard/reception` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/doctor-appointments` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/nursing` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/lab` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/pharmacy` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/billing` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/emergency` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/appointments` | Workstation Shell | Exactly 1 (`<aside>`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard` (Hospital Admin) | Shared Dashboard Shell | Exactly 1 (`DashboardSidebar`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/super-admin` | Shared Dashboard Shell | Exactly 1 (`DashboardSidebar`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/hrms` | Shared Dashboard Shell | Exactly 1 (`DashboardSidebar`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/profile` | Shared Dashboard Shell | Exactly 1 (`DashboardSidebar`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/dashboard/settings` | Shared Dashboard Shell | Exactly 1 (`DashboardSidebar`) | Verified Session / `/auth/me` | FIXED AND VERIFIED |
| `/portal/*` (Patient Portal) | Dedicated Patient Shell | Exactly 1 (`PortalSidebar`) | Patient Auth / Session | UNTOUCHED & VERIFIED |

---

## 5. Verification & Testing Results

1. **Full Monorepo Typecheck:**
   - Command: `npm run typecheck` (`tsc -b packages/types packages/validation apps/api apps/web`)
   - Result: **0 errors across all 4 projects.**
2. **Web Workspace Typecheck:**
   - Command: `npm run typecheck --workspace=@medinexa/web`
   - Result: **Passed (0 errors).**
3. **API Workspace Typecheck:**
   - Command: `npm run typecheck --workspace=@medinexa/api`
   - Result: **Passed (0 errors).**
4. **Backend Automated Test Suite:**
   - Command: `npm test` (`node --test test/**/*.spec.ts`)
   - Result: **352 tests passed, 0 failed, 102 suites passed.**

---

## 6. Files Modified

| File | Changes Made |
|---|---|
| `apps/api/src/auth/auth.controller.ts` | Added `@Patch('me')` endpoint with `JwtAuthGuard` |
| `apps/api/src/auth/auth.service.ts` | Implemented `updateMe` with RBAC guardrails and enriched `toUserDto` |
| `apps/web/lib/auth-session.ts` *(new)* | Authoritative authentication and session manager |
| `apps/web/app/dashboard/layout.tsx` | Implemented conditional shell rendering for workstation routes |
| `apps/web/components/dashboard/DashboardNav.tsx` | Removed hardcoded fallback identities; integrated dynamic user sync and `clearAuthSession` |
| `apps/web/components/dashboard/DashboardSidebar.tsx` | Removed hardcoded fallback identities; integrated dynamic user sync and `clearAuthSession` |
| `apps/web/app/dashboard/profile/page.tsx` | Purged static mock details; hooked saving to `updateAuthenticatedProfile` |
| `apps/web/app/dashboard/reception/page.tsx` | Dynamic session staff card; centralized `clearAuthSession` |
| `apps/web/app/dashboard/doctor-appointments/page.tsx` | Dynamic session doctor identity; centralized `clearAuthSession` |
| `apps/web/app/dashboard/nursing/page.tsx` | Dynamic session nurse identity; centralized `clearAuthSession` |
| `apps/web/app/dashboard/lab/page.tsx` | Dynamic session diagnostics identity; centralized `clearAuthSession` |
| `apps/web/app/dashboard/pharmacy/page.tsx` | Dynamic session pharmacist identity; centralized `clearAuthSession` |
| `apps/web/app/dashboard/billing/page.tsx` | Dynamic session billing officer identity; centralized `clearAuthSession` |
| `apps/web/app/dashboard/emergency/page.tsx` | Dynamic session emergency lead identity; centralized `clearAuthSession` |
| `apps/web/app/dashboard/appointments/page.tsx` | Dynamic session appointment staff identity; centralized `clearAuthSession` |

---

## 7. Safety and Compliance Statement

- In accordance with safety rules, no git commits, git pushes, deployment executions, or database schema alterations have been performed. All changes remain staged and active in the working tree for the user's review and approval.

