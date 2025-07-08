'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import TherapistRatings from '../../components/TherapistRatings';

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
      setPendingRequests(prev => [...prev, data]);
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
                <p><strong>Session Type:</strong> {activeSession?.sessionType || 'None'}</p>
                {webRTC && (
                  <>
                    <p><strong>WebRTC Active:</strong> {webRTC.isCallActive ? '✅' : '❌'}</p>
                    <p><strong>Connection State:</strong> {webRTC.connectionState}</p>
                  </>
                )}
                <p><strong>Camera Permission:</strong> {mediaPermissions.camera ? '✅' : '❌'}</p>
                <p><strong>Microphone Permission:</strong> {mediaPermissions.microphone ? '✅' : '❌'}</p>
              </div>
              
              {/* Media Permissions Button */}
              {!mediaPermissions.requested && (
                <button
                  onClick={requestMediaPermissions}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                >
                  🎥 Enable Camera & Microphone
                </button>
              )}
              
              {mediaPermissions.requested && (!mediaPermissions.camera || !mediaPermissions.microphone) && (
                <button
                  onClick={requestMediaPermissions}
                  className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                >
                  🔄 Retry Permissions
                </button>
              )}
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
                        <div>
                          <h4 className="font-medium text-gray-900">New Session Request</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              request.sessionType === 'video' ? 'bg-purple-100 text-purple-800' :
                              request.sessionType === 'audio' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.sessionType === 'video' && '📹 Video Call'}
                              {request.sessionType === 'audio' && '🎤 Voice Call'}
                              {request.sessionType === 'text' && '💬 Text Chat'}
                              {!request.sessionType && '💬 Text Chat'}
                            </span>
                          </div>
                        </div>
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
              <div className="space-y-6">
                {/* Session Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activeSession.sessionType === 'text' && '💬 Text Chat Session'}
                        {activeSession.sessionType === 'audio' && '🎤 Voice Call Session'}
                        {activeSession.sessionType === 'video' && '📹 Video Call Session'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Started {activeSession.startTime.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={handleEndSession}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      End Session
                    </button>
                  </div>
                </div>

                {/* WebRTC Video/Audio UI */}
                {(activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && webRTC && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="space-y-4">
                      {/* Video Elements */}
                      {activeSession.sessionType === 'video' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                            <video
                              ref={webRTC.localVideoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                              You (Therapist)
                            </div>
                          </div>
                          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                            <video
                              ref={webRTC.remoteVideoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                              User (Anonymized)
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Audio Elements */}
                      {activeSession.sessionType === 'audio' && (
                        <div className="flex justify-center">
                          <div className="bg-gray-900 rounded-lg p-8 text-center">
                            <div className="text-4xl mb-4">🎤</div>
                            <p className="text-white">Voice Call Active</p>
                            <p className="text-gray-300 text-sm">Clear audio and video</p>
                          </div>
                        </div>
                      )}

                      {/* Hidden audio element for remote audio playback */}
                      {(activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && (
                        <audio
                          ref={webRTC.remoteAudioRef}
                          autoPlay
                          playsInline
                          style={{ display: 'none' }}
                        />
                      )}

                      {/* Call Controls */}
                      <div className="flex justify-center space-x-4">
                        {/* Audio autoplay blocked warning */}
                        {webRTC.audioAutoplayBlocked && (
                          <button
                            onClick={() => webRTC.enableAudioPlayback()}
                            className="px-4 py-2 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                          >
                            🔊 Enable Audio
                          </button>
                        )}
                        
                        <button
                          onClick={() => webRTC.toggleMute()}
                          className={`px-4 py-2 rounded-full ${
                            webRTC.isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                          } text-white transition-colors`}
                        >
                          {webRTC.isMuted ? '🔇' : '🎤'}
                        </button>
                        
                        {activeSession.sessionType === 'video' && (
                          <button
                            onClick={() => webRTC.toggleVideo()}
                            className={`px-4 py-2 rounded-full ${
                              !webRTC.isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                            } text-white transition-colors`}
                          >
                            {!webRTC.isVideoEnabled ? '📹❌' : '📹'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => webRTC.endCall()}
                          className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          📞❌
                        </button>
                      </div>

                      {/* Connection Status */}
                      <div className="text-center text-sm text-gray-500">
                        Connection: {webRTC.connectionState || 'connecting...'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Interface (always available) */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">
                      {activeSession.sessionType === 'text' ? 'Chat' : 'Chat (supplementary)'}
                    </h4>
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
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400">
                  <div className="text-6xl mb-4">👩‍⚕️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
                  <p className="text-gray-500 mb-4">
                    {isOnline 
                      ? 'When a user requests a session, it will appear here.'
                      : 'Go online to start receiving session requests.'
                    }
                  </p>
                  <div className="text-sm text-gray-400">
                    Supports: Text Chat • Voice Calls • Video Sessions
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Therapist Ratings Section */}
        <div className="mt-8">
          <TherapistRatings therapistId={user?.id || 'demo_therapist_123'} />
        </div>
      </div>
    </div>
  );
}
