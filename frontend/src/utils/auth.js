/**
 * Authentication utility functions for the EcoFinds app
 */

// Store authentication token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Get the authentication token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Remove the authentication token (logout)
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Get the authorization header for API requests
export const getAuthHeader = () => {
  const token = getToken();
  if (!token) return {};
  
  // Ensure token has proper Bearer prefix
  const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return { 'Authorization': authToken };
};

// Parse JWT token payload (without validation)
export const parseJwt = (token) => {
  if (!token) return null;
  
  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  try {
    const base64Url = tokenValue.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT token:", e);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    
    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();
    
    return currentDate > expirationDate;
  } catch (e) {
    console.error("Error checking token expiration:", e);
    return true;
  }
};