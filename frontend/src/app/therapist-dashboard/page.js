'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import SessionRequestCard from '../../components/SessionRequestCard';
import ActiveSessionCard from '../../components/ActiveSessionCard';
import TherapistStatusCard from '../../components/TherapistStatusCard';
import TherapistAPI from '../../services/therapistApi';

export default function TherapistDashboard() {
  const { user, token } = useAuth();
  const {
    isConnected,
    connect,
    disconnect,
    joinAsTherapist,
    onSessionMatched,
    onWaitingForTherapist,
    onMessage,
    onSessionRequest,
    sendMessage,
    startTyping,
    stopTyping,
    endSession,
    acceptRequest,
    declineRequest,
    offSessionRequest,
    sessionId,
    therapistId
  } = useSocket();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [apiService, setApiService] = useState(null);

  // Initialize API service
  useEffect(() => {
    if (token) {
      setApiService(new TherapistAPI(token));
    }
  }, [token]);

  // Initialize therapist connection (only once)
  useEffect(() => {
    if (user && user.userType === 'therapist' && token && !isConnected) {
      console.log('Therapist dashboard: Attempting to connect to Socket.IO');
      connect();
    }
  }, [user, token, connect, isConnected]);

  // Join as therapist when connected (only once per connection)
  useEffect(() => {
    if (isConnected && user && user.userType === 'therapist' && !therapistId) {
      console.log('Therapist dashboard: Joining as therapist with ID:', user.id);
      joinAsTherapist({
        therapistId: user.id,
        specialties: user.therapistProfile?.specialties || [],
        name: user.name
      });
      setIsOnline(true);
      
      // Note: Initial heartbeat is handled by AuthContext heartbeatService
      // No need to send additional heartbeat here to avoid duplication
    }
  }, [isConnected, user, joinAsTherapist, therapistId]); // Removed apiService from deps

  // Handle session matching (set up once)
  useEffect(() => {
    const handleSessionMatched = (data) => {
      console.log('Session matched:', data);
      setActiveSession({
        sessionId: data.sessionId,
        startTime: new Date(),
        status: 'active'
      });
      setMessages([{
        id: 'welcome',
        content: 'You have been connected with a user. This conversation is completely anonymous.',
        senderType: 'system',
        timestamp: new Date()
      }]);
    };

    const handleWaitingForTherapist = (data) => {
      console.log('User waiting for therapist:', data);
      // This could show a notification or add to pending requests
    };

    const handleSessionRequest = (data) => {
      console.log('🔔 Therapist dashboard: Received session request:', data);
      const newRequest = {
        id: data.requestId,
        sessionId: data.sessionId,
        sessionType: data.sessionType,
        message: data.message,
        preferences: data.preferences,
        timestamp: new Date(data.timestamp),
        status: 'pending'
      };
      
      console.log('📝 Adding request to pending list:', newRequest);
      setPendingRequests(prev => {
        const updated = [...prev, newRequest];
        console.log('📋 Updated pending requests:', updated);
        return updated;
      });
    };

    console.log('🔌 Setting up socket listeners. Connected:', isConnected);
    if (isConnected) {
      console.log('✅ Registering session request listener');
      onSessionMatched(handleSessionMatched);
      onWaitingForTherapist(handleWaitingForTherapist);
      onSessionRequest(handleSessionRequest);
    }

    // Cleanup function
    return () => {
      offSessionRequest();
    };
  }, [isConnected, onSessionMatched, onWaitingForTherapist, onSessionRequest, offSessionRequest]);

  // Handle incoming messages (set up once)
  useEffect(() => {
    const handleMessage = (message) => {
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }]);
    };

    if (isConnected) {
      onMessage(handleMessage);
    }

    return () => {
      // Cleanup
    };
  }, [isConnected, onMessage]);

  const handleSendMessage = () => {
    if (newMessage.trim() && activeSession) {
      const message = {
        content: newMessage.trim(),
        messageType: 'text'
      };
      
      sendMessage(activeSession.sessionId, message.content, message.messageType);
      
      // Add to local messages immediately
      setMessages(prev => [...prev, {
        id: `temp_${Date.now()}`,
        content: message.content,
        messageType: message.messageType,
        senderType: 'therapist',
        senderId: user.id,
        timestamp: new Date(),
        sessionId: activeSession.sessionId
      }]);
      
      setNewMessage('');
    }
  };

  const handleEndSession = useCallback(() => {
    if (activeSession) {
      endSession();
      setActiveSession(null);
      setMessages([]);
    }
  }, [activeSession, endSession]);

  const handleAcceptRequest = useCallback((requestId) => {
    console.log('Accepting request:', requestId);
    
    // Find the request
    const request = pendingRequests.find(req => req.id === requestId);
    if (!request) {
      console.error('Request not found:', requestId);
      return;
    }
    
    // Send accept to backend
    acceptRequest(requestId);
    
    // Remove from pending requests
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    
    // Set up active session
    setActiveSession({
      sessionId: request.sessionId,
      startTime: new Date(),
      status: 'active',
      requestId: requestId
    });
    
    // Add welcome message
    setMessages([{
      id: 'welcome',
      content: 'You have accepted the session request. You are now connected with a user.',
      senderType: 'system',
      timestamp: new Date()
    }]);
  }, [pendingRequests, acceptRequest]);

  const handleDeclineRequest = useCallback((requestId, reason = 'I am not available at this time.') => {
    console.log('Declining request:', requestId, 'Reason:', reason);
    
    // Send decline to backend
    declineRequest(requestId, reason);
    
    // Remove from pending requests
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  }, [declineRequest]);

  const handleGoOnline = useCallback(async () => {
    try {
      if (!isConnected) {
        connect();
      }
      setIsOnline(true);
      
      // Note: Heartbeat is handled by AuthContext heartbeatService
      // No need to send additional heartbeat here
      
      // Update availability via REST API if needed
      if (apiService) {
        await apiService.sendHeartbeat(true);
      }
    } catch (error) {
      console.error('Error going online:', error);
    }
  }, [isConnected, connect, apiService]);

  const handleGoOffline = useCallback(async () => {
    try {
      setIsOnline(false);
      
      // End active session if any
      if (activeSession) {
        endSession();
        setActiveSession(null);
        setMessages([]);
      }
      
      // Update availability via API
      if (apiService) {
        await apiService.sendHeartbeat(false);
      }
      
      disconnect();
    } catch (error) {
      console.error('Error going offline:', error);
    }
  }, [activeSession, apiService, disconnect, endSession]);

  // Note: Periodic heartbeat is handled by AuthContext heartbeatService
  // No need for additional heartbeat interval here to avoid duplication
  // The heartbeatService in AuthContext already sends heartbeats every 60s for therapists

  // Redirect if not therapist
  if (!user || user.userType !== 'therapist') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This dashboard is only available to verified therapists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Therapist Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <TherapistStatusCard
              isOnline={isOnline}
              isConnected={isConnected}
              activeSession={activeSession}
              onGoOnline={handleGoOnline}
              onGoOffline={handleGoOffline}
              therapistId={therapistId}
            />

            {/* Debug Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Debug Info
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Therapist ID:</strong> {therapistId || 'Not set'}</p>
                <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
                <p><strong>Session ID:</strong> {sessionId || 'None'}</p>
                <p><strong>Online Status:</strong> {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
                <p><strong>Pending Requests:</strong> {pendingRequests.length}</p>
              </div>
              <button
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('isConnected:', isConnected);
                  console.log('therapistId:', therapistId);
                  console.log('user.id:', user?.id);
                  console.log('sessionId:', sessionId);
                  console.log('pendingRequests:', pendingRequests);
                  console.log('=================');
                }}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
              >
                Log Debug Info
              </button>
              <button
                onClick={() => {
                  // Simulate a session request for testing
                  const testRequest = {
                    id: 'test-' + Date.now(),
                    sessionId: 'test-session',
                    sessionType: 'text',
                    message: 'Test session request',
                    preferences: {},
                    timestamp: new Date(),
                    status: 'pending'
                  };
                  console.log('Adding test request:', testRequest);
                  setPendingRequests(prev => [...prev, testRequest]);
                }}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
              >
                Add Test Request
              </button>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Session Requests
              </h3>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {isOnline ? 'Waiting for session requests...' : 'Go online to receive session requests'}
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <SessionRequestCard
                      key={request.id}
                      request={request}
                      onAccept={(req) => handleAcceptRequest(req.id)}
                      onDecline={(req) => handleDeclineRequest(req.id, 'I am not available at this time.')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Active Session */}
          <div className="lg:col-span-2">
            {activeSession ? (
              <ActiveSessionCard
                session={activeSession}
                messages={messages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                onEndSession={handleEndSession}
                isTyping={isTyping}
                userType="therapist"
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.459L3 21l2.459-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
                  <p className="text-gray-500">
                    {isOnline 
                      ? 'When a user requests a session, it will appear here.'
                      : 'Go online to start receiving session requests.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
