/**
 * MediNexa Backend Centralized Domain & Origin Configuration
 * Defines authoritative production domains for frontend routing, CORS, and notification links.
 */

export const OFFICIAL_PRODUCTION_FRONTEND_URL = 'https://medinexa-medicalweb.vercel.app';
export const OFFICIAL_PRODUCTION_BACKEND_URL = 'https://medinexa-duplicate-api.onrender.com/api/v1';

/**
 * Resolves the frontend base URL for server-generated notification links (Email, SMS, WhatsApp).
 * Respects FRONTEND_URL or APP_URL in environment, falls back to the official production URL in production,
 * and http://localhost:3000 in local development.
 */
export function getFrontendBaseUrl(): string {
  const envUrl = process.env.FRONTEND_URL || process.env.APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    return OFFICIAL_PRODUCTION_FRONTEND_URL;
  }
  return 'http://localhost:3000';
}

