'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const {
    isConnected,
    sessionId,
    connect,
    disconnect,
    joinAsTherapist,
    sendHeartbeat,
    acceptRequest,
    declineRequest,
    sendMessage,
    endSession,
    addEventListener,
    removeEventListener,
  } = useSocket();

  const [isOnline, setIsOnline] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Connect when component mounts
  useEffect(() => {
    if (user?.userType === 'therapist') {
      connect();
    }
  }, [user, connect]);

  // Join as therapist when connected
  useEffect(() => {
    if (isConnected && user?.userType === 'therapist' && !isOnline) {
      joinAsTherapist({
        therapistId: user.id,
        name: user.name || 'Anonymous Therapist',
        specialties: user.therapistProfile?.specialties || ['general'],
        experience: user.therapistProfile?.experience || 'Professional therapist',
        bio: user.therapistProfile?.bio || `Hi! I'm ${user.name || 'a professional therapist'} and I'm here to help you.`
      });
      setIsOnline(true);
    }
  }, [isConnected, user, joinAsTherapist, isOnline]);

  // Send heartbeat every 30 seconds
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => {
        sendHeartbeat(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isOnline, sendHeartbeat]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleSessionRequest = (data) => {
      console.log('🔔 New session request:', data);
      setPendingRequests(prev => [...prev, data]);
    };

    const handleSessionStarted = (data) => {
      console.log('✅ Session started:', data);
      setActiveSession({ sessionId: data.sessionId, startTime: new Date() });
      setMessages([{
        id: 'system-1',
        content: 'Session started! You are now connected with a user.',
        senderType: 'system',
        timestamp: new Date()
      }]);
    };

    const handleNewMessage = (message) => {
      console.log('💬 New message:', message);
      setMessages(prev => [...prev, message]);
    };

    const handleSessionEnded = (data) => {
      console.log('🔚 Session ended:', data);
      setActiveSession(null);
      setMessages([]);
    };

    addEventListener('session-request', handleSessionRequest);
    addEventListener('session-started', handleSessionStarted);
    addEventListener('new-message', handleNewMessage);
    addEventListener('session-ended', handleSessionEnded);

    return () => {
      removeEventListener('session-request');
      removeEventListener('session-started');
      removeEventListener('new-message');
      removeEventListener('session-ended');
    };
  }, [isConnected, addEventListener, removeEventListener]);

  const handleAcceptRequest = useCallback((request) => {
    acceptRequest(request.requestId);
    setPendingRequests(prev => prev.filter(r => r.requestId !== request.requestId));
  }, [acceptRequest]);

  const handleDeclineRequest = useCallback((request) => {
    declineRequest(request.requestId, 'I am not available at this time.');
    setPendingRequests(prev => prev.filter(r => r.requestId !== request.requestId));
  }, [declineRequest]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && activeSession) {
      sendMessage(activeSession.sessionId, newMessage.trim());
      setNewMessage('');
    }
  }, [newMessage, activeSession, sendMessage]);

  const handleEndSession = useCallback(() => {
    if (activeSession) {
      endSession(activeSession.sessionId);
    }
  }, [activeSession, endSession]);

  const handleGoOffline = useCallback(() => {
    setIsOnline(false);
    sendHeartbeat(false);
    disconnect();
  }, [sendHeartbeat, disconnect]);

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Therapist Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '🟢 Online' : '🔴 Offline'}
            </div>
            <button
              onClick={handleGoOffline}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Go Offline
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Status & Requests */}
          <div className="space-y-6">
            {/* Debug Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Info</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Connected:</strong> {isConnected ? '✅' : '❌'}</p>
                <p><strong>Session ID:</strong> {sessionId || 'None'}</p>
                <p><strong>Therapist ID:</strong> {user?.id}</p>
                <p><strong>Pending Requests:</strong> {pendingRequests.length}</p>
                <p><strong>Active Session:</strong> {activeSession ? '✅' : '❌'}</p>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Session Requests ({pendingRequests.length})
              </h3>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {isOnline ? 'Waiting for session requests...' : 'Go online to receive requests'}
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.requestId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">New Session Request</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(request.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{request.message}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Active Session */}
          <div>
            {activeSession ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Session</h3>
                  <button
                    onClick={handleEndSession}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    End Session
                  </button>
                </div>
                
                {/* Messages */}
                <div className="h-96 border rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-3 ${
                        message.senderType === 'therapist' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                          message.senderType === 'therapist'
                            ? 'bg-blue-600 text-white'
                            : message.senderType === 'system'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
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
