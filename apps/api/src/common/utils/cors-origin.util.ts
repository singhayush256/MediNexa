/**
 * Shared CORS Origin Whitelist Validator for Production and Staging
 */
export function isAllowedCorsOrigin(origin?: string): boolean {
  if (!origin) {
    return true; // Allow non-browser callers (curl, server-to-server, health probes)
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Check against explicit CORS_ORIGIN if set
  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
    const allowed = process.env.CORS_ORIGIN.split(',').map((o) => o.trim().toLowerCase());
    if (allowed.includes(origin.toLowerCase())) {
      return true;
    }
  }

  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();

    // Trusted production origins
    if (
      host === 'medinexa.com' ||
      host.endsWith('.medinexa.com') ||
      host.endsWith('.medinexa.health') ||
      host.endsWith('.vercel.app') ||
      host.endsWith('.onrender.com')
    ) {
      return true;
    }

    // Development-only origins
    if (!isProduction && (host === 'localhost' || host === '127.0.0.1')) {
      return true;
    }

    // In non-production, if CORS_ORIGIN is wildcard, permit for local debugging
    if (!isProduction && (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*')) {
      return true;
    }
  } catch {
    // Malformed origin
    return false;
  }

  return !isProduction;
}
