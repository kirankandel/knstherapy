"use client";

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import heartbeatService from '../services/heartbeat';

const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.tokens.access.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored auth data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('kns_user');
    const storedToken = localStorage.getItem('kns_token');

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user,
            tokens: { access: { token: storedToken } }
          }
        });
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('kns_user');
        localStorage.removeItem('kns_token');
      }
    }
  }, []);

  // Start/stop heartbeat service based on authentication status
  useEffect(() => {
    if (state.isAuthenticated && state.token && state.user) {
      // Start heartbeat service only for therapists
      if (state.user.role === 'therapist') {
        heartbeatService.start(state.token, state.user.role);
      }
    } else {
      // Stop heartbeat service when user logs out
      heartbeatService.stop();
    }

    // Cleanup on unmount
    return () => {
      heartbeatService.stop();
    };
  }, [state.isAuthenticated, state.token, state.user]);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/v1';

  // Auth functions
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store auth data
      localStorage.setItem('kns_user', JSON.stringify(data.user));
      localStorage.setItem('kns_token', data.tokens.access.token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  const registerCommunityUser = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await fetch(`${API_BASE}/auth/register/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth data
      localStorage.setItem('kns_user', JSON.stringify(data.user));
      localStorage.setItem('kns_token', data.tokens.access.token);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  const registerTherapist = async (therapistData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await fetch(`${API_BASE}/auth/register/therapist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(therapistData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth data
      localStorage.setItem('kns_user', JSON.stringify(data.user));
      localStorage.setItem('kns_token', data.tokens.access.token);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (state.token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`,
          },
          body: JSON.stringify({ refreshToken: localStorage.getItem('kns_refresh_token') }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('kns_user');
      localStorage.removeItem('kns_token');
      localStorage.removeItem('kns_refresh_token');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    registerCommunityUser,
    registerTherapist,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
