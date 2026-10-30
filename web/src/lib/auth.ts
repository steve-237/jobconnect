/**
 * Authentication and Routing Helpers
 * Provides centralized token management, role validation, safe URL redirection,
 * and session state checks for JobConnect.
 */

export interface DecodedToken {
  sub?: string;
  id?: string;
  userId?: string;
  email?: string;
  role?: 'ADMIN' | 'EMPLOYER' | 'CANDIDATE' | string;
  exp?: number;
  iat?: number;
}

/**
 * Safely retrieve the JWT token from localStorage.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

/**
 * Remove the token and optional auth storage items.
 */
export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('jobconnect_auth_changed'));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Decode a JWT payload without external libraries.
 */
export function decodeToken(token?: string | null): DecodedToken | null {
  const jwt = token !== undefined ? token : getStoredToken();
  if (!jwt) return null;

  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      sub: parsed.sub || parsed.id || parsed.userId,
      id: parsed.id || parsed.sub || parsed.userId,
      userId: parsed.userId || parsed.id || parsed.sub,
      email: parsed.email || '',
      role: parsed.role || 'CANDIDATE',
      exp: parsed.exp,
      iat: parsed.iat,
    };
  } catch {
    return null;
  }
}

/**
 * Check if the stored or given token is expired.
 */
export function isTokenExpired(token?: string | null): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  if (!decoded.exp) return false; // If no exp field, assume active until rejected by API
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Validate whether the current user is authenticated with a valid token.
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Safely sanitize a redirect path to prevent Open Redirect attacks.
 * Disallows external URLs (e.g. //evil.com, https://..., javascript:...).
 */
export function sanitizeRedirectUrl(url?: string | null, fallback = '/dashboard'): string {
  if (!url || typeof url !== 'string') return fallback;

  const trimmed = url.trim();

  // Must start with a single slash, not double slashes or backslashes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Prevent protocol injection
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Extract clean display name from email address if first name is missing.
 */
export function getDisplayNameFromEmail(email: string): string {
  if (!email) return 'Utilisateur';
  const local = email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}
