/**
 * Decodes a base64url string to a JSON object
 */
const base64UrlToJSON = (base64Url) => {
  try {
    // Add removed at end '='
    const padLength = (4 - (base64Url.length % 4)) % 4;
    base64Url += '='.repeat(padLength);
    
    // Convert base64url to base64
    base64Url = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64
    const jsonPayload = decodeURIComponent(window.atob(base64Url).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Decodes a JWT string into its components
 * @param {string} token - The JWT token string
 * @returns {Object|null} The decoded components or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token || typeof token !== 'string') return null;

  // Remove whitespace
  const cleanToken = token.trim();
  const parts = cleanToken.split('.');

  if (parts.length !== 3) return null;

  const header = base64UrlToJSON(parts[0]);
  const payload = base64UrlToJSON(parts[1]);

  if (!header || !payload) return null;

  // Determine expiration status
  let isExpired = false;
  let expiresAt = null;

  if (payload.exp) {
    expiresAt = new Date(payload.exp * 1000);
    isExpired = Date.now() >= expiresAt.getTime();
  }

  return {
    parts: {
      header: parts[0],
      payload: parts[1],
      signature: parts[2]
    },
    header,
    payload,
    isExpired,
    expiresAt,
    isValidFormat: true
  };
};
