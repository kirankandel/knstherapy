'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  RatingDistributionChart,
  SessionTypeChart,
  RatingsOverTimeChart,
  DailyActivityChart,
} from '../../components/Charts';
import {
  MetricCard,
  RecentFeedbackCard,
  StatsOverview,
  SessionTypeBreakdown,
  LoadingSpinner,
  ErrorMessage,
} from '../../components/DashboardComponents';

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
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendICECandidate,
    endCall,
    addEventListener,
    removeEventListener,
  } = useSocket();

  const [isOnline, setIsOnline] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: false,
    microphone: false,
    requested: false
  });
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'session', 'analytics'

  // Demo therapist ID for analytics
  const therapistId = user?.id || 'demo_therapist_123';

  // Analytics hook
  const { 
    analytics, 
    loading: analyticsLoading, 
    error: analyticsError, 
    dateRange, 
    refreshAnalytics, 
    changeDateRange 
  } = useAnalytics(therapistId);

  // WebRTC hook for audio/video calls
  const webRTC = useWebRTC({
    sessionId,
    sessionType: activeSession?.sessionType || 'text',
    userType: 'therapist',
    onOffer: (offer) => {
      if (sessionId) {
        sendWebRTCOffer(sessionId, offer, 'user');
      }
    },
    onAnswer: (answer) => {
      if (sessionId) {
        sendWebRTCAnswer(sessionId, answer, 'user');
      }
    },
    onICECandidate: (candidate) => {
      if (sessionId) {
        sendICECandidate(sessionId, candidate, 'user');
      }
    },
  });

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
        bio: user.therapistProfile?.bio || `Hi! I'm ${user.name || 'a professional therapist'} and I'm here to help you.`,
        supportedSessionTypes: ['text', 'audio', 'video'] // Support all session types
      });
      setIsOnline(true);
    }
  }, [isConnected, user, joinAsTherapist, isOnline]);

  // Start WebRTC call when session becomes active for audio/video
  useEffect(() => {
    if (activeSession && (activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && webRTC) {
      console.log('🎥 Session is active with type:', activeSession.sessionType);
      console.log('WebRTC object available:', !!webRTC);
      console.log('WebRTC startCall function:', typeof webRTC.startCall);
      
      // Small delay to ensure WebRTC hook has updated with new session type
      setTimeout(() => {
        try {
          console.log('Calling webRTC.startCall() for', activeSession.sessionType, 'session');
          webRTC.startCall().then(() => {
            console.log('✅ WebRTC call started successfully');
          }).catch((error) => {
            console.error('❌ Failed to start WebRTC call:', error);
            alert('Failed to start call: ' + error.message);
          });
        } catch (error) {
          console.error('❌ Error calling webRTC.startCall():', error);
          alert('Error starting call: ' + error.message);
        }
      }, 1000);
    }
  }, [activeSession, webRTC]);

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
      // Ensure the request has proper structure
      const request = {
        requestId: data.requestId,
        sessionId: data.sessionId,
        sessionType: data.sessionType,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        // Add id as fallback for compatibility
        id: data.requestId
      };
      setPendingRequests(prev => [...prev, request]);
    };

    const handleSessionStarted = (data) => {
      console.log('✅ Session started:', data);
      setActiveSession({ 
        sessionId: data.sessionId, 
        sessionType: data.sessionType || 'text',
        startTime: new Date() 
      });
      setMessages([{
        id: 'system-1',
        content: 'Session started! You are now connected with a user.',
        senderType: 'system',
        timestamp: new Date()
      }]);

      // Automatically switch to session view
      setCurrentView('session');

      // WebRTC call will be initiated by useEffect when activeSession changes
    };

    const handleNewMessage = (message) => {
      console.log('💬 New message:', message);
      setMessages(prev => [...prev, message]);
    };

    const handleSessionEnded = (data) => {
      console.log('🔚 Session ended:', data);
      // End WebRTC call if active
      if ((activeSession?.sessionType === 'audio' || activeSession?.sessionType === 'video') && webRTC) {
        webRTC.endCall();
      }
      setActiveSession(null);
      setMessages([]);
    };

    // WebRTC event handlers
    const handleWebRTCOffer = (data) => {
      console.log('📞 Received WebRTC offer:', data);
      if (webRTC && data.targetId === 'therapist') {
        webRTC.answerCall(data.offer);
      }
    };

    const handleWebRTCAnswer = (data) => {
      console.log('📞 Received WebRTC answer:', data);
      if (webRTC && data.targetId === 'therapist') {
        webRTC.handleAnswer(data.answer);
      }
    };

    const handleICECandidate = (data) => {
      console.log('📞 Received ICE candidate:', data);
      if (webRTC && data.targetId === 'therapist') {
        webRTC.handleICECandidate(data.candidate);
      }
    };

    const handleCallEnded = (data) => {
      console.log('📞 Call ended:', data);
      if (webRTC) {
        webRTC.endCall();
      }
    };

    addEventListener('session-request', handleSessionRequest);
    addEventListener('session-started', handleSessionStarted);
    addEventListener('new-message', handleNewMessage);
    addEventListener('session-ended', handleSessionEnded);
    addEventListener('webrtc-offer', handleWebRTCOffer);
    addEventListener('webrtc-answer', handleWebRTCAnswer);
    addEventListener('ice-candidate', handleICECandidate);
    addEventListener('call-ended', handleCallEnded);

    return () => {
      removeEventListener('session-request');
      removeEventListener('session-started');
      removeEventListener('new-message');
      removeEventListener('session-ended');
      removeEventListener('webrtc-offer');
      removeEventListener('webrtc-answer');
      removeEventListener('ice-candidate');
      removeEventListener('call-ended');
    };
  }, [isConnected, addEventListener, removeEventListener, activeSession?.sessionType, webRTC]);

  const handleAcceptRequest = useCallback((request) => {
    console.log('✅ Accepting request:', request);
    acceptRequest(request.requestId);
    setPendingRequests(prev => prev.filter(r => r.requestId !== request.requestId));
  }, [acceptRequest]);

  const handleDeclineRequest = useCallback((request) => {
    console.log('❌ Declining request:', request);
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
      // End WebRTC call if active
      if ((activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && webRTC) {
        webRTC.endCall();
      }
      endSession(activeSession.sessionId);
    }
  }, [activeSession, endSession, webRTC]);

  const handleGoOffline = useCallback(() => {
    setIsOnline(false);
    sendHeartbeat(false);
    disconnect();
  }, [sendHeartbeat, disconnect]);

  // Handle PDF report generation
  const handleCreateReport = useCallback(async () => {
    try {
      console.log('🔄 Generating PDF report for therapist:', therapistId);
      
      // Make API call to backend
      const response = await fetch(`/api/pdf/therapist-report/${therapistId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `therapist_report_${therapistId}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF report downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  }, [therapistId]);

  // Request media permissions proactively
  const requestMediaPermissions = useCallback(async () => {
    try {
      console.log('🎥 Requesting camera and microphone permissions...');
      setMediaPermissions(prev => ({ ...prev, requested: true }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      console.log('✅ Media permissions granted');
      setMediaPermissions({
        camera: true,
        microphone: true,
        requested: true
      });
      
      // Stop the stream immediately - we just needed permissions
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('❌ Failed to get media permissions:', error);
      
      // Try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaPermissions({
          camera: false,
          microphone: true,
          requested: true
        });
        audioStream.getTracks().forEach(track => track.stop());
      } catch (audioError) {
        console.error('❌ Failed to get audio permission:', audioError);
        setMediaPermissions({
          camera: false,
          microphone: false,
          requested: true
        });
      }
    }
  }, []);

  // Request media permissions on mount
  useEffect(() => {
    requestMediaPermissions();
  }, [requestMediaPermissions]);

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
              onClick={handleCreateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              📄 Create Report
            </button>
            <button
              onClick={handleGoOffline}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Go Offline
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Analytics
              </button>
              {activeSession && (
                <button
                  onClick={() => setCurrentView('session')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    currentView === 'session'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💬 Active Session
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats Overview */}
            {analytics && <StatsOverview analytics={analytics} />}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Management */}
              <div className="space-y-6">
                {/* Connection Status Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isConnected ? '🟢 Online' : '🔴 Offline'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Therapist ID:</span>
                      <span className="font-mono">{user?.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Session ID:</span>
                      <span className="font-mono">{sessionId || 'None'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Camera:</span>
                      <span>{mediaPermissions.camera ? '✅ Ready' : '❌ Not ready'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Microphone:</span>
                      <span>{mediaPermissions.microphone ? '✅ Ready' : '❌ Not ready'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending Count:</span>
                      <span>{pendingRequests.length}</span>
                    </div>
                    {pendingRequests.length > 0 && (
                      <div className="text-xs">
                        <strong>Request IDs:</strong>
                        <ul className="mt-1">
                          {pendingRequests.map((req, idx) => (
                            <li key={idx} className="font-mono">
                              {req.requestId || req.id || 'No ID'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {!mediaPermissions.requested && (
                    <button
                      onClick={requestMediaPermissions}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                    >
                      🎥 Enable Camera & Microphone
                    </button>
                  )}
                </div>

                {/* Pending Requests */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pending Requests ({pendingRequests.length})
                  </h3>
                  
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-3">
                      {pendingRequests.map((request) => (
                        <div key={request.requestId || request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  request.sessionType === 'text' ? 'bg-blue-100 text-blue-800' :
                                  request.sessionType === 'audio' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {request.sessionType === 'text' && '💬 Text Chat'}
                                  {request.sessionType === 'audio' && '🎤 Voice Call'}
                                  {request.sessionType === 'video' && '📹 Video Call'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Request ID: {request.requestId || request.id}
                              </p>
                              {request.message && (
                                <p className="text-sm text-gray-700 mt-1">
                                  Message: {request.message}
                                </p>
                              )}
                            </div>
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">⏳</div>
                      <p>No pending requests</p>
                      <p className="text-xs">You&apos;ll see new session requests here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Analytics Preview */}
              <div className="space-y-6">
                {analytics ? (
                  <>
                    <SessionTypeBreakdown sessionTypeStats={analytics.sessionTypeStats} />
                    <RecentFeedbackCard feedback={analytics.recentFeedback} />
                  </>
                ) : (
                  <LoadingSpinner />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Analytics Period</h3>
                <div className="flex space-x-2">
                  {['7d', '30d', '3m', '6m', '1y'].map((period) => (
                    <button
                      key={period}
                      onClick={() => changeDateRange(period)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        dateRange === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period === '7d' && 'Last 7 days'}
                      {period === '30d' && 'Last 30 days'}
                      {period === '3m' && 'Last 3 months'}
                      {period === '6m' && 'Last 6 months'}
                      {period === '1y' && 'Last year'}
                    </button>
                  ))}
                  <button
                    onClick={refreshAnalytics}
                    className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {analyticsLoading ? (
              <LoadingSpinner />
            ) : analyticsError ? (
              <ErrorMessage message={analyticsError} onRetry={refreshAnalytics} />
            ) : analytics ? (
              <>
                {/* Performance Metrics */}
                <StatsOverview analytics={analytics} />

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rating Distribution */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <RatingDistributionChart data={analytics.ratingDistribution} />
                  </div>

                  {/* Session Types */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <SessionTypeChart data={analytics.sessionTypeStats} />
                  </div>

                  {/* Ratings Over Time */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
                    <RatingsOverTimeChart data={analytics.ratingsOverTime} />
                  </div>

                  {/* Daily Activity */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <DailyActivityChart data={analytics.dailyActivity} />
                  </div>

                  {/* Recent Feedback */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <RecentFeedbackCard feedback={analytics.recentFeedback} />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600">No analytics data available</p>
              </div>
            )}
          </div>
        )}

        {/* Session View */}
        {currentView === 'session' && activeSession && (
          <div className="space-y-6">
            {/* Session Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    {activeSession.sessionType === 'text' && '💬 Text Session'}
                    {activeSession.sessionType === 'audio' && '🎤 Voice Session'}
                    {activeSession.sessionType === 'video' && '📹 Video Session'}
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Active
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Session ID: {activeSession.sessionId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Started: {activeSession.startTime?.toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={handleEndSession}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Session Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Area */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Messages</h4>
                  
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div key={message.id || Date.now()} className="mb-3">
                          <div className={`flex ${message.senderType === 'therapist' ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderType === 'therapist'
                                  ? 'bg-blue-500 text-white'
                                  : message.senderType === 'system'
                                  ? 'bg-gray-300 text-gray-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {message.senderType === 'system' && (
                                <div className="text-xs font-semibold mb-1">System</div>
                              )}
                              {message.senderType === 'user' && (
                                <div className="text-xs font-semibold mb-1">User</div>
                              )}
                              {message.senderType === 'therapist' && (
                                <div className="text-xs font-semibold mb-1">You</div>
                              )}
                              <div>{message.content}</div>
                              <div className="text-xs opacity-75 mt-1">
                                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-2xl mb-2">💬</div>
                        <p>No messages yet</p>
                        <p className="text-xs">Messages will appear here when you or the user sends them</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Video/Audio Controls */}
              <div className="space-y-6">
                {/* WebRTC Controls for Audio/Video Sessions */}
                {(activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      {activeSession.sessionType === 'audio' ? '🎤 Voice Call' : '📹 Video Call'}
                    </h4>
                    
                    {/* WebRTC Status */}
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Call Status:</span>
                        <span className={`font-medium ${
                          webRTC?.isCallActive 
                            ? 'text-green-600' 
                            : webRTC?.isConnecting 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}>
                          {webRTC?.isCallActive ? '✅ Connected' : 
                           webRTC?.isConnecting ? '🔄 Connecting...' : '❌ Not connected'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Local Stream:</span>
                        <span>{webRTC?.localStream ? '✅ Active' : '❌ None'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remote Stream:</span>
                        <span>{webRTC?.remoteStream ? '✅ Active' : '❌ None'}</span>
                      </div>
                    </div>

                    {/* Video Elements */}
                    {activeSession.sessionType === 'video' && (
                      <div className="space-y-4">
                        {/* Local Video */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Your Video:</h5>
                          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '120px' }}>
                            <video
                              ref={webRTC?.localVideoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            {!webRTC?.localStream && (
                              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                                No video
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remote Video */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">User&apos;s Video:</h5>
                          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '120px' }}>
                            <video
                              ref={webRTC?.remoteVideoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            {!webRTC?.remoteStream && (
                              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                                Waiting for user...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Audio Elements (Hidden) */}
                    {activeSession.sessionType === 'audio' && (
                      <div className="space-y-2">
                        <audio ref={webRTC?.localAudioRef} autoPlay muted />
                        <audio ref={webRTC?.remoteAudioRef} autoPlay />
                        <div className="text-center py-8">
                          <div className="text-4xl mb-2">🎤</div>
                          <p className="text-sm text-gray-600">Voice call active</p>
                          {webRTC?.remoteStream && (
                            <p className="text-xs text-green-600">Connected to user</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Call Controls */}
                    <div className="flex justify-center space-x-2 mt-4">
                      {webRTC?.isMuted !== undefined && (
                        <button
                          onClick={webRTC.toggleMute}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            webRTC.isMuted
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {webRTC.isMuted ? '🔇 Unmute' : '🎤 Mute'}
                        </button>
                      )}
                      
                      {activeSession.sessionType === 'video' && webRTC?.isVideoOff !== undefined && (
                        <button
                          onClick={webRTC.toggleVideo}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            webRTC.isVideoOff
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {webRTC.isVideoOff ? '📹 Enable Video' : '🚫 Disable Video'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (webRTC) {
                            webRTC.endCall();
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        📞 End Call
                      </button>
                    </div>

                    {/* Debug Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                      <div><strong>Debug:</strong></div>
                      <div>Session Type: {activeSession.sessionType}</div>
                      <div>WebRTC Available: {webRTC ? 'Yes' : 'No'}</div>
                      <div>Call Active: {webRTC?.isCallActive ? 'Yes' : 'No'}</div>
                      <div>Connecting: {webRTC?.isConnecting ? 'Yes' : 'No'}</div>
                      <div>Local Stream: {webRTC?.localStream ? 'Yes' : 'No'}</div>
                      <div>Remote Stream: {webRTC?.remoteStream ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}

                {/* Session Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Session Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{activeSession.sessionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {activeSession.startTime ? 
                          Math.floor((new Date() - activeSession.startTime) / 1000 / 60) + ' min' 
                          : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Messages:</span>
                      <span className="font-medium">{messages.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Active Session Message for Session View */}
        {currentView === 'session' && !activeSession && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Session</h3>
            <p className="text-gray-600 mb-4">You don&apos;t have an active session right now.</p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
