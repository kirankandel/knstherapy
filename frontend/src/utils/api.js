// API configuration utility
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/v1',
  SOCKET_URL: process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/v1', '') || 'http://localhost:3001',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER_COMMUNITY: '/auth/register/community',
    REGISTER_THERAPIST: '/auth/register/therapist',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    
    // Session endpoints
    CREATE_SESSION: '/sessions/create',
    JOIN_SESSION: '/sessions/join',
    END_SESSION: '/sessions/end',
    
    // Community endpoints
    POSTS: '/community/posts',
    COMMENTS: '/community/comments',
    
    // Chatbot endpoints
    CHAT: '/chatbot/message',
    
    // Crisis resources
    CRISIS: '/crisis/resources',
  }
};

// Utility function to make API calls with timeout
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
  };

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    console.error('API call failed:', error);
    throw error;
  }
};

// Utility function for authenticated API calls
export const authenticatedApiCall = async (endpoint, token, options = {}) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Utility function to check if API is available
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default API_CONFIG;
