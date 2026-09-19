/**
 * Zero Trust Client-Side Security Sanitizer & Masking Utilities
 * MediNexa v3.0 Enterprise Architecture
 */

/**
 * Escapes characters with special HTML meaning to prevent Cross-Site Scripting (XSS).
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return input.replace(/[&<>"'`=/]/g, (char) => map[char] || char);
}

/**
 * Strips dangerous HTML tags, inline scripts, event handlers, and protocol URIs.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/javascript:[^\s"'>]*/gi, '')
    .replace(/data:text\/html[^\s"'>]*/gi, '')
    .replace(/\0/g, '')
    .trim();
}

/**
 * Client-side deterministic PHI/PII masking for ABHA, Aadhaar, Phone, and Email.
 */
export function maskSensitivePhi(
  val: string | null | undefined,
  type: 'ABHA' | 'PHONE' | 'EMAIL' | 'GENERIC' = 'GENERIC',
): string {
  if (!val) return '—';
  const clean = val.trim();

  switch (type) {
    case 'ABHA': {
      // Input like 14-digit number or ABHA ID
      const digits = clean.replace(/\D/g, '');
      if (digits.length >= 12) {
        return `•••• •••• ${digits.slice(-4)}`;
      }
      return `${clean.slice(0, 2)}••••${clean.slice(-2)}`;
    }

    case 'PHONE': {
      const digits = clean.replace(/\D/g, '');
      if (digits.length >= 10) {
        return `+91 ••••• ••${digits.slice(-4)}`;
      }
      return `••••${clean.slice(-4)}`;
    }

    case 'EMAIL': {
      const parts = clean.split('@');
      if (parts.length === 2) {
        const username = parts[0];
        const domain = parts[1];
        const visibleLen = Math.min(2, username.length);
        return `${username.slice(0, visibleLen)}••••@${domain}`;
      }
      return '••••@medinexa.in';
    }

    case 'GENERIC':
    default: {
      if (clean.length <= 4) return '••••';
      return `${clean.slice(0, 2)}••••${clean.slice(-2)}`;
    }
  }
}

/**
 * Validates password complexity against Enterprise Zero Trust policy:
 * Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character.
 */
export function validateSecurePassword(password: string): {
  isValid: boolean;
  score: number; // 0 to 100
  errors: string[];
} {
  const errors: string[] = [];
  let score = 0;

  if (!password) {
    return { isValid: false, score: 0, errors: ['Password cannot be empty'] };
  }

  if (password.length >= 8) {
    score += 25;
  } else {
    errors.push('At least 8 characters required');
  }

  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    errors.push('At least one uppercase letter (A-Z) required');
  }

  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    errors.push('At least one lowercase letter (a-z) required');
  }

  if (/\d/.test(password)) {
    score += 15;
  } else {
    errors.push('At least one numerical digit (0-9) required');
  }

  if (/[!@#$%^&*(),.?":{}|<>_\-~`+=]/.test(password)) {
    score += 15;
  } else {
    errors.push('At least one special character required');
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(100, score),
    errors,
  };
}
