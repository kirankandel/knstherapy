import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/v1', '') || 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(BACKEND_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to server');
      setIsConnected(false);
    });

    // Session handlers
    socket.on('session-created', (data) => {
      console.log('Session created:', data.sessionId);
      setSessionId(data.sessionId);
    });

    socket.on('therapist-joined', (data) => {
      console.log('Therapist joined:', data);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Connection functions
  const connect = useCallback(() => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  }, [isConnected]);

  // Join functions
  const joinAsUser = useCallback(() => {
    if (socketRef.current && isConnected) {
      console.log('👤 Joining as user');
      socketRef.current.emit('join-as-user', {});
    }
  }, [isConnected]);

  const joinAsTherapist = useCallback((therapistData) => {
    if (socketRef.current && isConnected) {
      console.log('👨‍⚕️ Joining as therapist:', therapistData);
      socketRef.current.emit('join-as-therapist', therapistData);
    }
  }, [isConnected]);

  // Heartbeat for therapists
  const sendHeartbeat = useCallback((isAvailable = true) => {
    if (socketRef.current && isConnected) {
      console.log('💓 Sending heartbeat, available:', isAvailable);
      socketRef.current.emit('therapist-heartbeat', { isAvailable });
    }
  }, [isConnected]);

  // Session requests
  const requestSession = useCallback((therapistId, message = '') => {
    if (socketRef.current && isConnected) {
      console.log('📤 Requesting session with therapist:', therapistId);
      socketRef.current.emit('request-session', { therapistId, message });
    }
  }, [isConnected]);

  const acceptRequest = useCallback((requestId) => {
    if (socketRef.current && isConnected) {
      console.log('✅ Accepting request:', requestId);
      socketRef.current.emit('accept-request', { requestId });
    }
  }, [isConnected]);

  const declineRequest = useCallback((requestId, reason = '') => {
    if (socketRef.current && isConnected) {
      console.log('❌ Declining request:', requestId);
      socketRef.current.emit('decline-request', { requestId, reason });
    }
  }, [isConnected]);

  // Chat functions
  const sendMessage = useCallback((sessionId, content) => {
    if (socketRef.current && isConnected) {
      console.log('💬 Sending message:', content);
      socketRef.current.emit('send-message', { sessionId, content });
    }
  }, [isConnected]);

  const endSession = useCallback((sessionId) => {
    if (socketRef.current && isConnected) {
      console.log('🔚 Ending session:', sessionId);
      socketRef.current.emit('end-session', { sessionId });
    }
  }, [isConnected]);

  // Get available therapists with callback
  const getAvailableTherapists = useCallback((callback) => {
    if (socketRef.current && isConnected) {
      console.log('📋 Requesting available therapists');
      
      // Set up one-time listener for the response
      const handleResponse = (data) => {
        console.log('📋 Received available therapists:', data);
        if (callback) callback(data.therapists || []);
        // Remove the listener after handling
        socketRef.current.off('available-therapists', handleResponse);
      };
      
      socketRef.current.on('available-therapists', handleResponse);
      socketRef.current.emit('get-available-therapists');
    } else if (callback) {
      callback([]);
    }
  }, [isConnected]);

  // Event listeners
  const addEventListener = useCallback((event, callback) => {
    if (socketRef.current) {
      console.log(`🎧 Adding listener for: ${event}`);
      socketRef.current.on(event, callback);
    }
  }, []);

  const removeEventListener = useCallback((event, callback) => {
    if (socketRef.current) {
      console.log(`🎧 Removing listener for: ${event}`);
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  return {
    isConnected,
    sessionId,
    connectionError,
    connect,
    disconnect,
    joinAsUser,
    joinAsTherapist,
    sendHeartbeat,
    requestSession,
    acceptRequest,
    declineRequest,
    sendMessage,
    endSession,
    getAvailableTherapists,
    addEventListener,
    removeEventListener,
  };
};
