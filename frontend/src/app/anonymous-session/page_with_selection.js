'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';

export default function AnonymousSession() {
  const {
    isConnected,
    sessionId,
    connect,
    disconnect,
    joinAsUser,
    requestSession,
    sendMessage,
    endSession,
    getAvailableTherapists,
    addEventListener,
    removeEventListener,
  } = useSocket();

  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState(null); // 'sending', 'sent', 'failed'
  const [availableTherapists, setAvailableTherapists] = useState([]);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showTherapistList, setShowTherapistList] = useState(false);

  // Connect when component mounts
  useEffect(() => {
    connect();
  }, [connect]);

  // Join as user when connected
  useEffect(() => {
    if (isConnected && !sessionId) {
      joinAsUser();
    }
  }, [isConnected, sessionId, joinAsUser]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleRequestSent = (data) => {
      console.log('✅ Request sent:', data);
      setRequestStatus('sent');
    };

    const handleRequestFailed = (data) => {
      console.log('❌ Request failed:', data);
      setRequestStatus('failed');
      alert(`Request failed: ${data.message}`);
    };

    const handleRequestDeclined = (data) => {
      console.log('❌ Request declined:', data);
      setRequestStatus('failed');
      alert(`Request declined: ${data.message}`);
    };

    const handleSessionStarted = (data) => {
      console.log('✅ Session started:', data);
      setActiveSession({ sessionId: data.sessionId, startTime: new Date() });
      setRequestStatus(null);
      setShowTherapistList(false);
      setMessages([{
        id: 'system-1',
        content: data.message,
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
      setRequestStatus(null);
      setSelectedTherapist(null);
    };

    const handleAvailableTherapists = (data) => {
      console.log('👥 Available therapists:', data.therapists);
      setAvailableTherapists(data.therapists);
      setLoadingTherapists(false);
    };

    addEventListener('request-sent', handleRequestSent);
    addEventListener('request-failed', handleRequestFailed);
    addEventListener('request-declined', handleRequestDeclined);
    addEventListener('session-started', handleSessionStarted);
    addEventListener('new-message', handleNewMessage);
    addEventListener('session-ended', handleSessionEnded);
    addEventListener('available-therapists', handleAvailableTherapists);

    return () => {
      removeEventListener('request-sent');
      removeEventListener('request-failed');
      removeEventListener('request-declined');
      removeEventListener('session-started');
      removeEventListener('new-message');
      removeEventListener('session-ended');
      removeEventListener('available-therapists');
    };
  }, [isConnected, addEventListener, removeEventListener]);

  const handleLoadTherapists = useCallback(() => {
    setLoadingTherapists(true);
    setShowTherapistList(true);
    getAvailableTherapists();
  }, [getAvailableTherapists]);

  const handleSelectTherapist = useCallback((therapist) => {
    setSelectedTherapist(therapist);
    setRequestStatus('sending');
    setShowTherapistList(false);
    
    const message = `Hello ${therapist.name}, I would like to start a therapy session with you.`;
    requestSession(therapist.therapistId, message);
  }, [requestSession]);

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

  const handleDisconnect = useCallback(() => {
    disconnect();
    setActiveSession(null);
    setMessages([]);
    setRequestStatus(null);
    setSelectedTherapist(null);
    setShowTherapistList(false);
  }, [disconnect]);

  const formatLastSeen = (timestamp) => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'More than 24h ago';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Anonymous Therapy Session</h1>
          <p className="text-gray-600">Connect with a qualified therapist anonymously and securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Session ID:</strong> {sessionId || 'None'}</p>
                <p><strong>Active Session:</strong> {activeSession ? '✅ Yes' : '❌ No'}</p>
                {selectedTherapist && (
                  <p><strong>Selected:</strong> {selectedTherapist.name}</p>
                )}
                {requestStatus && (
                  <p><strong>Request Status:</strong> 
                    <span className={`ml-1 ${
                      requestStatus === 'sent' ? 'text-blue-600' :
                      requestStatus === 'sending' ? 'text-yellow-600' :
                      requestStatus === 'failed' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {requestStatus}
                    </span>
                  </p>
                )}
              </div>
              {connectionError && (
                <div className="mt-3 text-red-600 text-sm">{connectionError}</div>
              )}
              <button
                onClick={handleDisconnect}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md w-full"
              >
                Disconnect
              </button>
            </div>

            {/* Therapist Selection */}
            {!activeSession && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Find a Therapist</h3>
                
                {!showTherapistList ? (
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm">
                      Choose from available therapists currently online
                    </p>
                    <button
                      onClick={handleLoadTherapists}
                      disabled={!isConnected || loadingTherapists}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium"
                    >
                      {loadingTherapists ? 'Loading...' : 'Show Available Therapists'}
                    </button>
                    
                    {requestStatus === 'sent' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-800 text-sm">
                          ⏳ Request sent to {selectedTherapist?.name}. Waiting for response...
                        </p>
                      </div>
                    )}
                    
                    {requestStatus === 'failed' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">
                          ❌ Request failed. Please try selecting another therapist.
                        </p>
                        <button
                          onClick={() => {
                            setRequestStatus(null);
                            setSelectedTherapist(null);
                            handleLoadTherapists();
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Available Therapists</h4>
                      <button
                        onClick={() => setShowTherapistList(false)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        ✕ Close
                      </button>
                    </div>
                    
                    {availableTherapists.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm">No therapists are currently online.</p>
                        <button
                          onClick={handleLoadTherapists}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          Refresh
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {availableTherapists.map((therapist) => (
                          <div
                            key={therapist.therapistId}
                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleSelectTherapist(therapist)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{therapist.name}</h5>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                  Online now
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Last active: {formatLastSeen(therapist.lastHeartbeat)}
                                </p>
                              </div>
                              <div className="text-right">
                                <button
                                  disabled={requestStatus === 'sending'}
                                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs"
                                >
                                  {requestStatus === 'sending' ? 'Sending...' : 'Select'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={handleLoadTherapists}
                      className="w-full text-blue-600 hover:text-blue-700 text-sm py-2 border border-blue-200 rounded-md"
                    >
                      🔄 Refresh List
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            {activeSession ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Chat Session</h3>
                    {selectedTherapist && (
                      <p className="text-sm text-gray-600">With {selectedTherapist.name}</p>
                    )}
                  </div>
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
                        message.senderType === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                          message.senderType === 'user'
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
                  <p className="text-gray-500 mb-4">
                    Select an available therapist to start a private, anonymous chat session.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm">
                    <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Click &ldquo;Show Available Therapists&rdquo; to see who&apos;s online</li>
                      <li>Select a therapist to send them a session request</li>
                      <li>Wait for them to accept your request</li>
                      <li>Start your anonymous, secure chat session</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
