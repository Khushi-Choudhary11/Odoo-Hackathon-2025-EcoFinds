/**
 * API utilities for making fetch requests with proper error handling
 */
import { getAuthHeader, isAuthenticated, removeToken } from './auth';

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Make an API request with proper error handling
 * @param {string} endpoint - The API endpoint
 * @param {object} options - Request options
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @param {function} onAuthError - Function to call on authentication error
 * @returns {Promise<object>} - The response data
 */
export async function apiRequest(endpoint, options = {}, requiresAuth = false, onAuthError = null) {
  // Add trailing slash to API_BASE_URL if necessary
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Build the full URL
  const url = `${baseUrl}${cleanEndpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authentication token if required
  if (requiresAuth) {
    if (!isAuthenticated()) {
      const error = new Error('Authentication required');
      error.code = 'AUTH_REQUIRED';
      throw error;
    }
    
    Object.assign(headers, getAuthHeader());
  }
  
  // Build the request options
  const requestOptions = {
    ...options,
    headers,
  };
  
  try {
    // Handle OPTIONS preflight specially
    if (requestOptions.method === 'OPTIONS') {
      console.log("Handling OPTIONS preflight request manually");
      return { success: true };
    }
    
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Log the response status for debugging
    console.log(`API ${requestOptions.method || 'GET'} ${url} response:`, response.status);
    
    // Parse the response body
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('Failed to parse response as JSON', e);
      data = { message: 'No response data available' };
    }
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 422) {
      console.error('Authentication error:', data);
      
      // Handle token errors
      if (data.msg === 'Subject must be a string' || 
          data.error === 'token_expired' ||
          data.msg?.includes('token')) {
        
        // Remove the invalid token
        removeToken();
        
        // Call the authentication error handler if provided
        if (onAuthError) {
          onAuthError(data);
          return { authError: true, ...data };
        }
        
        // Throw an authentication error
        const error = new Error(data.message || 'Authentication failed');
        error.code = 'AUTH_FAILED';
        error.status = response.status;
        error.data = data;
        throw error;
      }
    }
    
    // Handle other error responses
    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    // Return the response data
    return data;
  } catch (error) {
    // Re-throw fetch errors or our custom errors
    if (!error.status) {
      console.error('Network error:', error);
      error.message = 'Network error. Please check your connection.';
    }
    throw error;
  }
}

/**
 * Make a GET request
 * @param {string} endpoint - The API endpoint
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @param {function} onAuthError - Function to call on authentication error
 * @returns {Promise<object>} - The response data
 */
export function get(endpoint, requiresAuth = false, onAuthError = null) {
  return apiRequest(endpoint, { method: 'GET' }, requiresAuth, onAuthError);
}

/**
 * Make a POST request
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The request body data
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @param {function} onAuthError - Function to call on authentication error
 * @returns {Promise<object>} - The response data
 */
export function post(endpoint, data, requiresAuth = false, onAuthError = null) {
  return apiRequest(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    requiresAuth,
    onAuthError
  );
}

/**
 * Make a PUT request
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The request body data
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @param {function} onAuthError - Function to call on authentication error
 * @returns {Promise<object>} - The response data
 */
export function put(endpoint, data, requiresAuth = false, onAuthError = null) {
  return apiRequest(
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    requiresAuth,
    onAuthError
  );
}

/**
 * Make a DELETE request
 * @param {string} endpoint - The API endpoint
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @param {function} onAuthError - Function to call on authentication error
 * @returns {Promise<object>} - The response data
 */
export function del(endpoint, requiresAuth = false, onAuthError = null) {
  return apiRequest(endpoint, { method: 'DELETE' }, requiresAuth, onAuthError);
}