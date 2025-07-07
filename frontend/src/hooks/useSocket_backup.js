import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/v1', '') || 'http://localhost:3001';

// Function to check if backend is reachable
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/v1/docs`, { 
      method: 'GET',
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export const useSocket = () => {
  const socketRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const connectTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false); // Add ref to track connection state
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [userType, setUserType] = useState(null); // 'user' | 'therapist'
  const [therapistId, setTherapistId] = useState(null);

  // Note: Heartbeat is handled by AuthContext heartbeatService for therapists
  // Socket-level heartbeat removed to prevent duplication
  // The AuthContext already handles API heartbeats every 60s for authenticated therapists

  useEffect(() => {
    // Initialize socket connection with multiple transport fallbacks
    socketRef.current = io(BACKEND_URL, {
      autoConnect: false,
      timeout: 20000, // Increased timeout
      reconnection: true,
      reconnectionDelay: 2000, // Wait 2 seconds before reconnection
      reconnectionDelayMax: 10000, // Max 10 seconds between attempts
      maxReconnectionAttempts: 3, // Reduced attempts to avoid spam
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      upgrade: true, // Allow upgrade to websocket
      forceNew: true, // Force new connection
      withCredentials: false // Disable credentials for CORS
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server at:', BACKEND_URL);
      console.log('🔌 Setting isConnected to true');
      setIsConnected(true);
      isConnectedRef.current = true; // Keep ref in sync
      setConnectionError(null);
      // Note: Heartbeat handled by AuthContext, not here
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server, reason:', reason);
      console.log('🔌 Setting isConnected to false');
      setIsConnected(false);
      isConnectedRef.current = false; // Keep ref in sync
      // Note: Heartbeat cleanup handled by AuthContext
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      console.error('Backend URL:', BACKEND_URL);
      console.error('Error type:', error.type);
      console.error('Error description:', error.description);
      
      let errorMessage = 'Connection failed';
      if (error.type === 'TransportError' || error.description?.includes('xhr poll error')) {
        errorMessage = 'Backend server is not running. Please start the backend server on port 3001.';
      } else if (error.type === 'NetworkError') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `${error.type || 'Connection failed'}: ${error.description || error.message || 'Unknown error'}`;
      }
      
      setConnectionError(errorMessage);
      setIsConnected(false);
    });

    // Session event handlers
    socket.on('session-created', (data) => {
      console.log('Session created:', data.sessionId);
      setSessionId(data.sessionId);
    });

    socket.on('therapist-registered', (data) => {
      console.log('Therapist registered:', data.therapistId);
      setTherapistId(data.therapistId);
    });

    socket.on('session-matched', (data) => {
      console.log('Session matched:', data);
    });

    socket.on('session-ended', (data) => {
      console.log('Session ended:', data);
      setSessionId(null);
    });

    // Heartbeat acknowledgment
    socket.on('heartbeat-ack', (data) => {
      console.log('Heartbeat acknowledged:', data);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, []); // Removed heartbeat dependencies

  // Socket action functions with debouncing
  const connect = async () => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }
    
    // First check if backend is reachable
    console.log('Checking backend health at:', BACKEND_URL);
    const isBackendHealthy = await checkBackendHealth();
    
    if (!isBackendHealthy) {
      console.error('Backend is not reachable at:', BACKEND_URL);
      setConnectionError('Backend server is not running. Please start the backend server on port 3001.');
      return;
    }
    
    console.log('Backend is reachable, attempting socket connection...');
    
    connectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && !isConnected) {
        console.log('Attempting to connect to socket at:', BACKEND_URL);
        socketRef.current.connect();
      }
    }, 100); // Small delay to prevent rapid connections
  };

  const disconnect = () => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }
    
    if (socketRef.current && isConnected) {
      console.log('Disconnecting from socket...');
      socketRef.current.disconnect();
    }
  };

  const joinAsUser = (preferences = {}) => {
    if (socketRef.current && isConnectedRef.current) {
      console.log('👤 Joining as user with preferences:', preferences);
      setUserType('user');
      socketRef.current.emit('join-as-user', { preferences });
      console.log('✅ join-as-user event emitted');
    } else {
      console.error('❌ Cannot join as user - socket not connected');
      console.error('  - Socket exists:', !!socketRef.current);
      console.error('  - Is connected (ref):', isConnectedRef.current);
      console.error('  - Is connected (state):', isConnected);
    }
  };

  const joinAsTherapist = (therapistData = {}) => {
    if (socketRef.current && isConnectedRef.current) {
      setUserType('therapist');
      // Use the provided therapistId or fallback to generating one
      const therapistId = therapistData.therapistId || `therapist_${Math.random().toString(36).substr(2, 9)}`;
      setTherapistId(therapistId);
      socketRef.current.emit('join-as-therapist', {
        ...therapistData,
        therapistId: therapistId
      });
    }
  };

  const sendMessage = (sessionId, content, messageType = 'text') => {
    if (socketRef.current && isConnectedRef.current && sessionId) {
      socketRef.current.emit('send-message', {
        sessionId,
        content,
        messageType
      });
    }
  };

  const startTyping = () => {
    if (socketRef.current && isConnectedRef.current && sessionId) {
      socketRef.current.emit('typing-start', { sessionId });
    }
  };

  const stopTyping = () => {
    if (socketRef.current && isConnectedRef.current && sessionId) {
      socketRef.current.emit('typing-stop', { sessionId });
    }
  };

  const endSession = () => {
    if (socketRef.current && isConnectedRef.current && sessionId) {
      socketRef.current.emit('end-session', { sessionId });
    }
  };

  // Session request functions
  const requestSession = (therapistId, sessionType = 'text', message = '', preferences = {}) => {
    if (socketRef.current && isConnectedRef.current) {
      console.log('📤 Sending session request via socket:', {
        therapistId,
        sessionType,
        message,
        preferences
      });
      console.log('🔗 Socket is connected (ref):', isConnectedRef.current);
      console.log('� Socket is connected (state):', isConnected);
      console.log('�📡 Socket instance exists:', !!socketRef.current);
      socketRef.current.emit('request-session', {
        therapistId,
        sessionType,
        message,
        preferences
      });
      console.log('✅ request-session event emitted');
    } else {
      console.error('❌ Cannot send session request - socket not connected');
      console.error('  - Socket exists:', !!socketRef.current);
      console.error('  - Is connected (ref):', isConnectedRef.current);
      console.error('  - Is connected (state):', isConnected);
    }
  };

  const acceptRequest = (requestId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('accept-request', { requestId });
    }
  };

  const declineRequest = (requestId, reason = 'The therapist is not available at this time.') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('decline-request', { requestId, reason });
    }
  };

  // Event listener registration functions
  const onMessage = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
  }, []);

  const onTyping = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback);
    }
  }, []);

  const onSessionMatched = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('session-matched', callback);
    }
  }, []);

  const onWaitingForTherapist = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('waiting-for-therapist', callback);
    }
  }, []);

  const onParticipantDisconnected = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('participant-disconnected', callback);
    }
  }, []);

  const onSessionEnded = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('session-ended', callback);
    }
  }, []);

  // Session request event listeners
  const onSessionRequest = useCallback((callback) => {
    if (socketRef.current) {
      console.log('🎧 Setting up session-request event listener');
      socketRef.current.on('session-request', callback);
    } else {
      console.warn('⚠️ Cannot set up session-request listener - socket not available');
    }
  }, []);

  const onRequestSent = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('request-sent', callback);
    }
  }, []);

  const onRequestFailed = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('request-failed', callback);
    }
  }, []);

  const onRequestDeclined = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('request-declined', callback);
    }
  }, []);

  // Remove event listeners
  const offMessage = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('new-message');
    }
  }, []);

  const offTyping = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('user-typing');
    }
  }, []);

  const offSessionMatched = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('session-matched');
    }
  }, []);

  const offWaitingForTherapist = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('waiting-for-therapist');
    }
  }, []);

  const offParticipantDisconnected = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('participant-disconnected');
    }
  }, []);

  const offSessionEnded = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('session-ended');
    }
  }, []);

  // Session request event cleanup
  const offSessionRequest = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('session-request');
    }
  }, []);

  const offRequestSent = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('request-sent');
    }
  }, []);

  const offRequestFailed = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('request-failed');
    }
  }, []);

  const offRequestDeclined = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('request-declined');
    }
  }, []);

  return {
    isConnected,
    sessionId,
    connectionError,
    userType,
    therapistId,
    connect,
    disconnect,
    joinAsUser,
    joinAsTherapist,
    sendMessage,
    startTyping,
    stopTyping,
    endSession,
    // Session request functions
    requestSession,
    acceptRequest,
    declineRequest,
    // Event listeners
    onMessage,
    onTyping,
    onSessionMatched,
    onWaitingForTherapist,
    onParticipantDisconnected,
    onSessionEnded,
    onSessionRequest,
    onRequestSent,
    onRequestFailed,
    onRequestDeclined,
    // Event cleanup
    offMessage,
    offTyping,
    offSessionMatched,
    offWaitingForTherapist,
    offParticipantDisconnected,
    offSessionEnded,
    offSessionRequest,
    offRequestSent,
    offRequestFailed,
    offRequestDeclined,
  };
};
