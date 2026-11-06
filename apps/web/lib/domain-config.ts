/**
 * MediNexa Official Frontend Domain & URL Configuration
 * Centralized authority for public application domains, metadata canonicals, and API gateways.
 */

export const OFFICIAL_PRODUCTION_FRONTEND_URL = 'https://medinexa-medicalweb.vercel.app';
export const OFFICIAL_PRODUCTION_BACKEND_URL = 'https://medinexa-duplicate-api.onrender.com/api/v1';

/**
 * Resolves the public frontend base URL with environment awareness:
 * 1. NEXT_PUBLIC_APP_URL environment variable if explicitly configured.
 * 2. In browser environments: window.location.origin (supports preview deployments and local development).
 * 3. Server-side Vercel Preview deployments: process.env.VERCEL_URL (prepended with https://).
 * 4. Production fallback: https://medinexa-medicalweb.vercel.app.
 * 5. Non-production development fallback: http://localhost:3000.
 */
export function getAppBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side Vercel Preview URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  if (process.env.NODE_ENV === 'production') {
    return OFFICIAL_PRODUCTION_FRONTEND_URL;
  }

  return 'http://localhost:3000';
}

