'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';

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
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendICECandidate,
    endCall,
    getAvailableTherapists,
    addEventListener,
    removeEventListener,
  } = useSocket();

  const [activeSession, setActiveSession] = useState(null);
  const [sessionType, setSessionType] = useState('text'); // 'text', 'audio', 'video'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [availableTherapists, setAvailableTherapists] = useState([]);
  const [requestStatus, setRequestStatus] = useState(null); // 'sending', 'sent', 'failed'
  const [showTherapistList, setShowTherapistList] = useState(false);
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: false,
    microphone: false,
    requested: false
  });

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

  // WebRTC hook for audio/video calls
  const webRTC = useWebRTC({
    sessionId,
    sessionType: activeSession?.sessionType || sessionType,
    userType: 'user',
    onOffer: (offer) => {
      if (sessionId) {
        sendWebRTCOffer(sessionId, offer, 'therapist');
      }
    },
    onAnswer: (answer) => {
      if (sessionId) {
        sendWebRTCAnswer(sessionId, answer, 'therapist');
      }
    },
    onICECandidate: (candidate) => {
      if (sessionId) {
        sendICECandidate(sessionId, candidate, 'therapist');
      }
    },
  });

  // Connect when component mounts
  useEffect(() => {
    connect();
  }, [connect]);

  const loadAvailableTherapists = useCallback(async () => {
    try {
      const therapists = await getAvailableTherapists();
      console.log('📋 Loaded therapists:', therapists);
      setAvailableTherapists(therapists);
    } catch (error) {
      console.error('Failed to load therapists:', error);
    }
  }, [getAvailableTherapists]);

  // Load available therapists when connected
  useEffect(() => {
    if (isConnected) {
      loadAvailableTherapists();
    }
  }, [isConnected, loadAvailableTherapists]);

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
      setActiveSession({ 
        sessionId: data.sessionId, 
        sessionType: data.sessionType || sessionType,
        startTime: new Date() 
      });
      setRequestStatus(null);
      setMessages([{
        id: 'system-1',
        content: data.message,
        senderType: 'system',
        timestamp: new Date()
      }]);

      // User side: Don't start call, wait for therapist's offer
      console.log('📱 User session started with type:', data.sessionType);
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
      setRequestStatus(null);
    };

    // WebRTC event handlers
    const handleWebRTCOffer = (data) => {
      console.log('📞 Received WebRTC offer:', data);
      if (webRTC && data.targetId === 'user') {
        webRTC.answerCall(data.offer);
      }
    };

    const handleWebRTCAnswer = (data) => {
      console.log('📞 Received WebRTC answer:', data);
      if (webRTC && data.targetId === 'user') {
        webRTC.handleAnswer(data.answer);
      }
    };

    const handleICECandidate = (data) => {
      console.log('📞 Received ICE candidate:', data);
      if (webRTC && data.targetId === 'user') {
        webRTC.handleICECandidate(data.candidate);
      }
    };

    const handleCallEnded = (data) => {
      console.log('📞 Call ended:', data);
      if (webRTC) {
        webRTC.endCall();
      }
    };

    addEventListener('request-sent', handleRequestSent);
    addEventListener('request-failed', handleRequestFailed);
    addEventListener('request-declined', handleRequestDeclined);
    addEventListener('session-started', handleSessionStarted);
    addEventListener('new-message', handleNewMessage);
    addEventListener('session-ended', handleSessionEnded);
    addEventListener('webrtc-offer', handleWebRTCOffer);
    addEventListener('webrtc-answer', handleWebRTCAnswer);
    addEventListener('ice-candidate', handleICECandidate);
    addEventListener('call-ended', handleCallEnded);

    return () => {
      removeEventListener('request-sent');
      removeEventListener('request-failed');
      removeEventListener('request-declined');
      removeEventListener('session-started');
      removeEventListener('new-message');
      removeEventListener('session-ended');
      removeEventListener('webrtc-offer');
      removeEventListener('webrtc-answer');
      removeEventListener('ice-candidate');
      removeEventListener('call-ended');
    };
  }, [isConnected, addEventListener, removeEventListener, sessionType, webRTC, activeSession?.sessionType]);

  const handleRequestSession = useCallback(() => {
    if (!selectedTherapist) {
      alert('Please select a therapist');
      return;
    }

    console.log('🔍 Selected therapist:', selectedTherapist);
    console.log('🔍 Therapist ID:', selectedTherapist.therapistId);
    console.log('🔍 Session type:', sessionType);

    setRequestStatus('sending');
    requestSession(selectedTherapist.therapistId, 'I would like to start a therapy session.', sessionType);
  }, [selectedTherapist, requestSession, sessionType]);

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
                <p><strong>Session Type:</strong> {activeSession?.sessionType || sessionType}</p>
                <p><strong>Camera Permission:</strong> {mediaPermissions.camera ? '✅' : '❌'}</p>
                <p><strong>Microphone Permission:</strong> {mediaPermissions.microphone ? '✅' : '❌'}</p>
              </div>
              
              {/* Media Permissions Button */}
              {(sessionType === 'audio' || sessionType === 'video') && !mediaPermissions.requested && (
                <button
                  onClick={requestMediaPermissions}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                >
                  🎥 Enable {sessionType === 'video' ? 'Camera & Microphone' : 'Microphone'}
                </button>
              )}
              
              {(sessionType === 'audio' || sessionType === 'video') && mediaPermissions.requested && 
               ((sessionType === 'video' && !mediaPermissions.camera) || !mediaPermissions.microphone) && (
                <button
                  onClick={requestMediaPermissions}
                  className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                >
                  🔄 Retry Permissions
                </button>
              )}
              
              <button
                onClick={handleDisconnect}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md"
              >
                Disconnect
              </button>
            </div>

            {/* Session Type Selection */}
            {!activeSession && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Type</h3>
                <div className="space-y-3">
                  {[
                    { id: 'text', label: 'Text Chat', icon: '💬', desc: 'Anonymous text messaging' },
                    { id: 'audio', label: 'Voice Call', icon: '🎤', desc: 'Voice-masked audio call' },
                    { id: 'video', label: 'Video Call', icon: '📹', desc: 'Anonymized video session' }
                  ].map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        sessionType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sessionType"
                        value={type.id}
                        checked={sessionType === type.id}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setSessionType(newType);
                          // Auto-request permissions for audio/video
                          if ((newType === 'audio' || newType === 'video') && !mediaPermissions.requested) {
                            setTimeout(() => requestMediaPermissions(), 100);
                          }
                        }}
                        className="hidden"
                      />
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Therapist Selection */}
            {!activeSession && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select Therapist</h3>
                  <button
                    onClick={() => setShowTherapistList(!showTherapistList)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showTherapistList ? 'Hide' : 'Show'} Available ({availableTherapists.length})
                  </button>
                </div>

                {selectedTherapist && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-900">{selectedTherapist.name}</div>
                    <div className="text-sm text-blue-700">
                      {selectedTherapist.specialties?.join(', ') || 'General Practice'}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {typeof selectedTherapist.experience === 'object' 
                        ? `${selectedTherapist.experience?.yearsOfPractice || 0} years` 
                        : `${selectedTherapist.experience || 0} years`} • 
                      Supports: {selectedTherapist.supportedSessionTypes?.join(', ') || 'text'}
                    </div>
                  </div>
                )}

                {showTherapistList && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableTherapists.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-2xl mb-2">👩‍⚕️</div>
                        <p>No therapists online</p>
                        <button
                          onClick={loadAvailableTherapists}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Refresh
                        </button>
                      </div>
                    ) : (
                      availableTherapists.map((therapist) => (
                        <div
                          key={therapist.therapistId}
                          onClick={() => {
                            setSelectedTherapist(therapist);
                            setShowTherapistList(false);
                          }}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTherapist?.therapistId === therapist.therapistId
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{therapist.name}</div>
                          <div className="text-sm text-gray-600">
                            {therapist.specialties?.join(', ') || 'General Practice'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {typeof therapist.experience === 'object' 
                              ? `${therapist.experience?.yearsOfPractice || 0} years experience` 
                              : `${therapist.experience || 0} years experience`}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Supports: {therapist.supportedSessionTypes?.join(', ') || 'text'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <button
                  onClick={handleRequestSession}
                  disabled={!isConnected || !selectedTherapist || requestStatus === 'sending'}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  {requestStatus === 'sending' ? 'Sending...' : `Request ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`}
                </button>
                
                {requestStatus === 'sent' && (
                  <p className="text-green-600 text-sm mt-2">Request sent! Waiting for therapist response...</p>
                )}
                {requestStatus === 'failed' && (
                  <p className="text-red-600 text-sm mt-2">Request failed. Please try again.</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Session Content */}
          <div className="lg:col-span-2">
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
                              You
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
                              Therapist
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
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400">
                  <div className="text-6xl mb-4">
                    {sessionType === 'text' && '💬'}
                    {sessionType === 'audio' && '🎤'}
                    {sessionType === 'video' && '📹'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
                  <p className="text-gray-500 mb-4">
                    Select a therapist and request a {sessionType} session to get started.
                  </p>
                  <div className="text-sm text-gray-400">
                    {sessionType === 'text' && 'Anonymous text messaging with end-to-end encryption'}
                    {sessionType === 'audio' && 'Voice-masked audio call for complete anonymity'}
                    {sessionType === 'video' && 'Video session with identity protection features'}
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
