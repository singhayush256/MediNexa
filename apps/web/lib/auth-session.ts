import { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl, fetchWithTimeout } from './api-config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  roleCode?: string;
  role?: {
    code: string;
    name: string;
  };
  staffId?: string;
  patientId?: string;
  uhid?: string;
  hospitalIdentity?: string;
  hospitalId?: string;
  department?: string;
  designation?: string;
  specialty?: string;
  licenseNumber?: string;
  facility?: {
    id: string;
    name: string;
    code: string;
  };
  permissions?: string[];
  [key: string]: any;
}

const USER_STORAGE_KEY = 'medinexa_user';
const TOKEN_STORAGE_KEY = 'medinexa_token';
const USER_UPDATE_EVENT = 'medinexa:user-updated';

/**
 * Retrieve user synchronously from localStorage
 */
export function getStoredUser(): AuthenticatedUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Persist user to localStorage and dispatch event to notify all components
 */
export function setStoredUser(user: AuthenticatedUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(USER_UPDATE_EVENT, { detail: user }));
  } catch (e) {
    console.error('Failed to update local user session:', e);
  }
}

/**
 * Fetch authoritative user from the backend /auth/me endpoint
 */
export async function fetchAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
  if (!token) return getStoredUser();

  try {
    const apiUrl = getApiBaseUrl();
    const res = await fetchWithTimeout(
      `${apiUrl}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      6000,
    );

    if (res.ok) {
      const user = await res.json();
      setStoredUser(user);
      return user;
    }
  } catch {
    // Backend offline or cold-starting; gracefully fallback to stored session
  }

  return getStoredUser();
}

/**
 * Update authenticated user profile details on the backend
 */
export async function updateUserProfile(payload: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: string;
  gender?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  address?: any;
  emergencyContact?: any;
  qualifications?: string;
  specialty?: string;
  department?: string;
}): Promise<{ ok: boolean; user?: AuthenticatedUser; message?: string }> {
  if (typeof window === 'undefined') return { ok: false, message: 'Browser only' };

  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
  if (!token) return { ok: false, message: 'Unauthenticated' };

  try {
    const apiUrl = getApiBaseUrl();
    const res = await fetchWithTimeout(
      `${apiUrl}/auth/me`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      8000,
    );

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.user) {
      setStoredUser(data.user);
      return { ok: true, user: data.user, message: data.message };
    }
    return { ok: false, message: data.message || 'Failed to update profile.' };
  } catch (e: any) {
    return { ok: false, message: e.message || 'Network error updating profile.' };
  }
}

/**
 * Upload profile photograph using backend Storage Provider
 */
export async function uploadProfilePhoto(
  file: File,
): Promise<{ ok: boolean; avatarUrl?: string; user?: AuthenticatedUser; message?: string }> {
  if (typeof window === 'undefined') return { ok: false, message: 'Browser only' };

  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
  if (!token) return { ok: false, message: 'Unauthenticated' };

  try {
    const apiUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetchWithTimeout(
      `${apiUrl}/auth/me/photo`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
      15000,
    );

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.user) {
      setStoredUser(data.user);
      return { ok: true, avatarUrl: data.avatarUrl, user: data.user, message: data.message };
    }
    return { ok: false, message: data.message || 'Failed to upload photo.' };
  } catch (e: any) {
    return { ok: false, message: e.message || 'Network error uploading photo.' };
  }
}

/**
 * Delete profile photo
 */
export async function deleteProfilePhoto(): Promise<{ ok: boolean; user?: AuthenticatedUser; message?: string }> {
  if (typeof window === 'undefined') return { ok: false, message: 'Browser only' };

  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
  if (!token) return { ok: false, message: 'Unauthenticated' };

  try {
    const apiUrl = getApiBaseUrl();
    const res = await fetchWithTimeout(
      `${apiUrl}/auth/me/photo`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      8000,
    );

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.user) {
      setStoredUser(data.user);
      return { ok: true, user: data.user, message: data.message };
    }
    return { ok: false, message: data.message || 'Failed to remove photo.' };
  } catch (e: any) {
    return { ok: false, message: e.message || 'Network error removing photo.' };
  }
}

/**
 * Fetch settings from backend
 */
export async function getUserSettings(): Promise<{ ok: boolean; settings?: any; message?: string }> {
  if (typeof window === 'undefined') return { ok: false };

  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
  if (!token) return { ok: false };

  try {
    const apiUrl = getApiBaseUrl();
    const res = await fetchWithTimeout(
      `${apiUrl}/auth/me/settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      6000,
    );

    if (res.ok) {
      const data = await res.json();
      return { ok: true, settings: data };
    }
  } catch {}

  return { ok: false };
}

/**
 * Update user settings on backend
 */
export async function updateUserSettings(payload: any): Promise<{ ok: boolean; settings?: any; message?: string }> {
  if (typeof window === 'undefined') return { ok: false };

  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
  if (!token) return { ok: false };

  try {
    const apiUrl = getApiBaseUrl();
    const res = await fetchWithTimeout(
      `${apiUrl}/auth/me/settings`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      8000,
    );

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { ok: true, settings: data.settings, message: data.message };
    }
    return { ok: false, message: data.message };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
}

/**
 * React hook for accessing and automatically syncing the current authenticated user
 */
export function useAuthenticatedUser() {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const u = await fetchAuthenticatedUser();
    setUser(u);
    setLoading(false);
    return u;
  }, []);

  useEffect(() => {
    refreshUser();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_STORAGE_KEY && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener(USER_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(USER_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshUser]);

  return { user, loading, refreshUser };
}

/**
 * Resolves the single authorized workspace URL for a given role code.
 * Ensures strict role-to-portal isolation.
 */
export function getAuthorizedDashboardForRole(roleCode?: string): string {
  const code = (roleCode || 'PATIENT').toUpperCase();
  if (code.includes('PATIENT')) return '/portal';
  if (code.includes('SUPER_ADMIN') || code.includes('MEDINEXA_ADMIN')) return '/super-admin';
  if (code.includes('DOCTOR')) return '/dashboard/doctor-appointments';
  if (code.includes('RECEPTION')) return '/dashboard/reception';
  if (code.includes('NURSE')) return '/dashboard/nursing';
  if (code.includes('BILLING')) return '/dashboard/billing';
  if (code.includes('PHARMAC')) return '/dashboard/pharmacy';
  if (code.includes('LAB') || code.includes('RADIOLOG')) return '/dashboard/lab';
  if (code.includes('EMERGENCY') || code.includes('EMS')) return '/dashboard/emergency';
  if (code.includes('AMBULANCE')) return '/dashboard/emergency-ambulance';
  if (code.includes('MANAGER') || code.includes('HR')) return '/dashboard/manager';
  if (code.includes('ADMIN') || code.includes('EXECUTIVE')) return '/dashboard/admin';
  return '/dashboard/admin';
}

/**
 * Canonical logout handler across all MediNexa portals.
 * Clears authentication tokens, authenticated user objects, cookies, session storage,
 * and user-specific states while preserving harmless theme preferences, and
 * performs an immediate hard redirect to the public homepage (/).
 */
export function logoutUser(redirectTo = '/'): void {
  if (typeof window === 'undefined') return;

  try {
    // Preserve harmless user theme preference
    const savedTheme = localStorage.getItem('medinexa_theme') || localStorage.getItem('theme');

    // 1. Clear authentication tokens & user state
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('medinexa_active_hospital_id');
    localStorage.removeItem('medinexa_demo_mode');
    localStorage.removeItem('medinexa_clean_patient_session');

    // 2. Clear session storage
    sessionStorage.clear();

    // 3. Clear cookie
    document.cookie = 'medinexa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // 4. Restore theme preference
    if (savedTheme) {
      localStorage.setItem('medinexa_theme', savedTheme);
    }

    // 5. Notify any active listeners in memory
    window.dispatchEvent(new CustomEvent(USER_UPDATE_EVENT, { detail: null }));

    // 6. Hard redirect with replace to prevent browser history back into protected workspace
    window.location.replace(redirectTo);
  } catch (err) {
    console.error('Logout error:', err);
    window.location.replace(redirectTo);
  }
}

