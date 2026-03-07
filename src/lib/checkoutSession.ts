// Get or create a checkout session ID
// Persists across steps and product selection
const SESSION_STORAGE_KEY = 'checkout_session_id';

export const getCheckoutSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!sessionId) {
    // Generate a unique session ID using crypto API if available
    // Fallback to timestamp + random string
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID();
    } else {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }

  return sessionId;
};

// Clear the session ID (e.g., after checkout completion)
export const clearCheckoutSessionId = (): void => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};
