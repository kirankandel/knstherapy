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
    addEventListener,
    removeEventListener,
  } = useSocket();

  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [requestStatus, setRequestStatus] = useState(null); // 'sending', 'sent', 'failed'

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
    };

    addEventListener('request-sent', handleRequestSent);
    addEventListener('request-failed', handleRequestFailed);
    addEventListener('request-declined', handleRequestDeclined);
    addEventListener('session-started', handleSessionStarted);
    addEventListener('new-message', handleNewMessage);
    addEventListener('session-ended', handleSessionEnded);

    return () => {
      removeEventListener('request-sent');
      removeEventListener('request-failed');
      removeEventListener('request-declined');
      removeEventListener('session-started');
      removeEventListener('new-message');
      removeEventListener('session-ended');
    };
  }, [isConnected, addEventListener, removeEventListener]);

  const handleRequestSession = useCallback(() => {
    if (!therapistId.trim()) {
      alert('Please enter a therapist ID');
      return;
    }

    setRequestStatus('sending');
    requestSession(therapistId.trim(), 'I would like to start a therapy session.');
  }, [therapistId, requestSession]);

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
  }, [disconnect]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Anonymous Therapy Session</h1>
          <p className="text-gray-600">Connect with a qualified therapist anonymously</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Connected:</strong> {isConnected ? '✅' : '❌'}</p>
                <p><strong>Session ID:</strong> {sessionId || 'None'}</p>
                <p><strong>Request Status:</strong> {requestStatus || 'None'}</p>
                <p><strong>Active Session:</strong> {activeSession ? '✅' : '❌'}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md"
              >
                Disconnect
              </button>
            </div>

            {/* Request Session */}
            {!activeSession && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Session</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={therapistId}
                    onChange={(e) => setTherapistId(e.target.value)}
                    placeholder="Enter therapist ID (e.g., 686bc2ce9930b14692739fae)"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleRequestSession}
                    disabled={!isConnected || !therapistId.trim() || requestStatus === 'sending'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium"
                  >
                    {requestStatus === 'sending' ? 'Sending...' : 'Request Session'}
                  </button>
                  {requestStatus === 'sent' && (
                    <p className="text-green-600 text-sm">Request sent! Waiting for therapist response...</p>
                  )}
                  {requestStatus === 'failed' && (
                    <p className="text-red-600 text-sm">Request failed. Please try again.</p>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
                  <strong>How to test:</strong><br/>
                  1. Open therapist dashboard in another tab<br/>
                  2. Login as a therapist<br/>
                  3. Copy the therapist ID from the debug info<br/>
                  4. Paste it here and request session
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            {activeSession ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Chat Session</h3>
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
                  <p className="text-gray-500">
                    Enter a therapist ID and request a session to start chatting.
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
