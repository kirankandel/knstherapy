import { useEffect, useRef, useState } from 'react';
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
      timeout: 10000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Session event handlers
    socket.on('session-created', (data) => {
      console.log('Session created:', data.sessionId);
      setSessionId(data.sessionId);
    });

    socket.on('session-matched', (data) => {
      console.log('Session matched:', data);
    });

    socket.on('session-ended', (data) => {
      console.log('Session ended:', data);
      setSessionId(null);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Socket action functions
  const connect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  };

  const joinAsUser = (preferences = {}) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-as-user', { preferences });
    }
  };

  const joinAsTherapist = (therapistData = {}) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-as-therapist', therapistData);
    }
  };

  const sendMessage = (sessionId, content, messageType = 'text') => {
    if (socketRef.current && isConnected && sessionId) {
      socketRef.current.emit('send-message', {
        sessionId,
        content,
        messageType
      });
    }
  };

  const startTyping = () => {
    if (socketRef.current && isConnected && sessionId) {
      socketRef.current.emit('typing-start', { sessionId });
    }
  };

  const stopTyping = () => {
    if (socketRef.current && isConnected && sessionId) {
      socketRef.current.emit('typing-stop', { sessionId });
    }
  };

  const endSession = () => {
    if (socketRef.current && isConnected && sessionId) {
      socketRef.current.emit('end-session', { sessionId });
    }
  };

  // Event listener registration functions
  const onMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
  };

  const onTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback);
    }
  };

  const onSessionMatched = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('session-matched', callback);
    }
  };

  const onWaitingForTherapist = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('waiting-for-therapist', callback);
    }
  };

  const onParticipantDisconnected = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('participant-disconnected', callback);
    }
  };

  const onSessionEnded = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('session-ended', callback);
    }
  };

  // Remove event listeners
  const offMessage = () => {
    if (socketRef.current) {
      socketRef.current.off('new-message');
    }
  };

  const offTyping = () => {
    if (socketRef.current) {
      socketRef.current.off('user-typing');
    }
  };

  const offSessionMatched = () => {
    if (socketRef.current) {
      socketRef.current.off('session-matched');
    }
  };

  const offWaitingForTherapist = () => {
    if (socketRef.current) {
      socketRef.current.off('waiting-for-therapist');
    }
  };

  const offParticipantDisconnected = () => {
    if (socketRef.current) {
      socketRef.current.off('participant-disconnected');
    }
  };

  const offSessionEnded = () => {
    if (socketRef.current) {
      socketRef.current.off('session-ended');
    }
  };

  return {
    isConnected,
    sessionId,
    connectionError,
    connect,
    disconnect,
    joinAsUser,
    joinAsTherapist,
    sendMessage,
    startTyping,
    stopTyping,
    endSession,
    onMessage,
    onTyping,
    onSessionMatched,
    onWaitingForTherapist,
    onParticipantDisconnected,
    onSessionEnded,
    offMessage,
    offTyping,
    offSessionMatched,
    offWaitingForTherapist,
    offParticipantDisconnected,
    offSessionEnded,
  };
};
