/**
 * MediNexa Authoritative Client Authentication & Session Manager
 * Resolves single verified user profile across all dashboards, headers, sidebars, and workstations.
 */

import { getApiBaseUrl, fetchWithTimeout } from './api-config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  profilePic?: string;
  avatar?: string;
  roleId?: string;
  roleCode?: string;
  role?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    code: string;
  };
  facilityId?: string;
  facilityName?: string;
  facility?: {
    id: string;
    name: string;
    code: string;
    address?: string;
    phone?: string;
  };
  staffId?: string;
  employeeId?: string;
  uhid?: string;
  department?: string;
  designation?: string;
  emergencyContact?: any;
  licenseNumber?: string;
  specialty?: string;
  joiningDate?: string;
  address?: any;
  customFields?: Array<{
    id: string;
    label: string;
    value: string;
    category: string;
  }>;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('medinexa_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('medinexa_token') ||
    null
  );
}

export function getAuthenticatedUser(): AuthenticatedUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('medinexa_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('medinexa_token');
  localStorage.removeItem('token');
  localStorage.removeItem('medinexa_refresh_token');
  localStorage.removeItem('medinexa_user');
  sessionStorage.removeItem('medinexa_token');
  if (typeof document !== 'undefined') {
    document.cookie = 'medinexa_token=; Max-Age=0; path=/;';
    document.cookie = 'refreshToken=; Max-Age=0; path=/;';
  }
  window.dispatchEvent(new CustomEvent('medinexa:auth-logged-out'));
}

export async function fetchCurrentAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const token = getAuthToken();
  if (!token) return null;

  const apiUrl = getApiBaseUrl();
  try {
    const res = await fetchWithTimeout(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 15000);

    if (res.ok) {
      const serverUser = await res.json();
      const existing = getAuthenticatedUser();
      
      // Preserve any client-side customizations (e.g. uploaded profile pic or custom details)
      const merged: AuthenticatedUser = {
        ...serverUser,
        profilePic: existing?.profilePic || serverUser.profilePic,
        avatar: existing?.avatar || serverUser.avatar || existing?.profilePic,
        customFields: existing?.customFields || serverUser.customFields,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_user', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('medinexa:user-updated', { detail: merged }));
      }
      return merged;
    } else if (res.status === 401) {
      clearAuthSession();
    }
  } catch (err) {
    console.warn('[auth-session] fetchCurrentAuthenticatedUser failed, falling back to local cache:', err);
  }

  return getAuthenticatedUser();
}

export async function updateAuthenticatedProfile(
  updates: Partial<AuthenticatedUser>
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: 'Authentication session expired. Please log in again.' };
  }

  const apiUrl = getApiBaseUrl();
  try {
    const res = await fetchWithTimeout(`${apiUrl}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    }, 15000);

    if (res.ok) {
      const serverUser = await res.json();
      const existing = getAuthenticatedUser() || {};
      const merged: AuthenticatedUser = {
        ...existing,
        ...serverUser,
        ...updates,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('medinexa_user', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('medinexa:user-updated', { detail: merged }));
      }
      return { success: true, user: merged };
    } else {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.message || `Server returned status ${res.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network connection failed. Could not reach MediNexa backend.',
    };
  }
}
