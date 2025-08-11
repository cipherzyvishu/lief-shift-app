/**
 * Auth0 Session Reset Utility
 * 
 * This utility helps reset Auth0 sessions when encountering JWE errors.
 * 
 * To fix JWE errors, you can:
 * 1. Clear browser cookies/localStorage
 * 2. Restart the development server
 * 3. Visit /api/auth/logout then /api/auth/login
 */

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies (client-side only)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('Auth session cleared. Redirecting to login...');
    window.location.href = '/api/auth/login';
  }
}

// Export for use in components
export default clearAuthSession;
