'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import RatingModal from '../../components/RatingModal';

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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sessionToRate, setSessionToRate] = useState(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

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
        therapistId: data.therapistId || selectedTherapist?.therapistId,
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
  }, [isConnected, addEventListener, removeEventListener, sessionType, webRTC, activeSession?.sessionType, selectedTherapist?.therapistId]);

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
      // Save session data for rating
      setSessionToRate({
        sessionId: activeSession.sessionId,
        therapistId: activeSession.therapistId,
        clientId: activeSession.clientId || 'anonymous_user',
        sessionType: activeSession.sessionType
      });
      
      // End WebRTC call if active
      if ((activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && webRTC) {
        webRTC.endCall();
      }
      endSession(activeSession.sessionId);
      
      // Show rating modal after a brief delay
      setTimeout(() => {
        setShowRatingModal(true);
      }, 1000);
    }
  }, [activeSession, endSession, webRTC]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setActiveSession(null);
    setMessages([]);
    setRequestStatus(null);
    setShowRatingModal(false);
    setSessionToRate(null);
  }, [disconnect]);

  const handleRatingSubmit = useCallback(async (ratingData) => {
    setIsSubmittingRating(true);
    try {
      console.log('📤 Submitting rating data:', ratingData);
      
      const response = await fetch('http://localhost:3001/v1/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      const responseData = await response.json();
      console.log('📥 Response:', responseData);

      if (response.ok) {
        console.log('✅ Rating submitted successfully');
        setShowRatingModal(false);
        setSessionToRate(null);
        // Show success message
        alert('Thank you for your feedback!');
      } else {
        console.error('❌ Failed to submit rating:', response.status, responseData);
        alert(`Failed to submit rating: ${responseData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  }, []);

  const handleRatingClose = useCallback(() => {
    setShowRatingModal(false);
    setSessionToRate(null);
  }, []);

  return (
  <div className="min-h-screen bg-gray-50 text-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Anonymous Therapy Session</h1>
        <p className="mt-2 text-lg text-gray-600">Connect securely and privately with a licensed therapist.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Controls */}
        <div className="space-y-6">

          {/* Connection Status */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Connection Status</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Connected:</strong> {isConnected ? '✅' : '❌'}</li>
              <li><strong>Session ID:</strong> {sessionId || 'None'}</li>
              <li><strong>Request Status:</strong> {requestStatus || 'None'}</li>
              <li><strong>Active Session:</strong> {activeSession ? '✅' : '❌'}</li>
              <li><strong>Session Type:</strong> {activeSession?.sessionType || sessionType}</li>
              <li><strong>Camera:</strong> {mediaPermissions.camera ? '✅' : '❌'}</li>
              <li><strong>Microphone:</strong> {mediaPermissions.microphone ? '✅' : '❌'}</li>
            </ul>
            {(sessionType === 'audio' || sessionType === 'video') && (
              <button
                onClick={requestMediaPermissions}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm"
              >
                {mediaPermissions.requested ? '🔄 Retry Permissions' : `🎥 Enable ${sessionType === 'video' ? 'Camera & Mic' : 'Microphone'}`}
              </button>
            )}
            <button
              onClick={handleDisconnect}
              className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm"
            >
              Disconnect
            </button>
          </div>

          {/* Session Type */}
          {!activeSession && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Session Type</h3>
              {[
                { id: 'text', label: 'Text Chat 💬', desc: 'Private anonymous messages' },
                { id: 'audio', label: 'Voice Call 🎤', desc: 'Voice-anonymized session' },
                { id: 'video', label: 'Video Call 📹', desc: 'Secure masked video call' }
              ].map((type) => (
                <label key={type.id} className={`block p-4 border rounded-md cursor-pointer transition ${sessionType === type.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="sessionType"
                    value={type.id}
                    checked={sessionType === type.id}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setSessionType(newType);
                      if ((newType === 'audio' || newType === 'video') && !mediaPermissions.requested) {
                        setTimeout(() => requestMediaPermissions(), 100);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="font-medium text-gray-800">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.desc}</div>
                </label>
              ))}
            </div>
          )}

          {/* Therapist List */}
          {!activeSession && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Therapists</h3>
                <button
                  onClick={() => setShowTherapistList(!showTherapistList)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {showTherapistList ? 'Hide' : 'Show'} ({availableTherapists.length})
                </button>
              </div>

              {selectedTherapist && (
                <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-indigo-900">{selectedTherapist.name}</div>
                  <div className="text-indigo-700">{selectedTherapist.specialties?.join(', ') || 'General Practice'}</div>
                  <div className="text-indigo-600 mt-1 text-xs">
                    {typeof selectedTherapist.experience === 'object'
                      ? `${selectedTherapist.experience?.yearsOfPractice || 0} yrs`
                      : `${selectedTherapist.experience || 0} yrs`} • Supports: {selectedTherapist.supportedSessionTypes?.join(', ') || 'text'}
                  </div>
                </div>
              )}

              {showTherapistList && (
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {availableTherapists.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>No therapists online.</p>
                      <button onClick={loadAvailableTherapists} className="mt-2 text-sm text-indigo-600 hover:underline">
                        Refresh
                      </button>
                    </div>
                  ) : (
                    availableTherapists.map((t) => (
                      <div
                        key={t.therapistId}
                        onClick={() => {
                          setSelectedTherapist(t);
                          setShowTherapistList(false);
                        }}
                        className={`p-3 rounded-md cursor-pointer border transition ${
                          selectedTherapist?.therapistId === t.therapistId ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-sm text-gray-600">{t.specialties?.join(', ') || 'Generalist'}</div>
                        <div className="text-xs text-gray-500">{t.experience?.yearsOfPractice || t.experience || 0} yrs • Supports: {t.supportedSessionTypes?.join(', ')}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <button
                onClick={handleRequestSession}
                disabled={!isConnected || !selectedTherapist || requestStatus === 'sending'}
                className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium"
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

        {/* Right Column - Session Display */}
        <div className="lg:col-span-2">
          {activeSession ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeSession.sessionType === 'text' && '💬 Text Chat Session'}
                  {activeSession.sessionType === 'audio' && '🎤 Voice Call Session'}
                  {activeSession.sessionType === 'video' && '📹 Video Call Session'}
                </h3>
                <button
                  onClick={handleEndSession}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  End Session
                </button>
              </div>

              {/* Text Chat Interface */}
              {activeSession.sessionType === 'text' && (
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg max-w-xs ${
                          message.senderType === 'user'
                            ? 'bg-blue-500 text-white ml-auto'
                            : message.senderType === 'therapist'
                            ? 'bg-white border shadow-sm'
                            : 'bg-yellow-100 text-gray-800 text-center mx-auto'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* WebRTC Video/Audio UI */}
              {(activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && webRTC && (
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
                        {webRTC.isVideoEnabled ? '📹' : '🚫📹'}
                      </button>
                    )}
                  </div>

                  {/* Connection Status */}
                  <div className="text-center text-sm text-gray-600">
                    Connection: {webRTC.connectionState}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for Anonymous Session</h3>
              <p className="text-gray-600 mb-4">
                Select your preferred session type and choose a therapist to begin your secure, anonymous therapy session.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="text-sm font-medium">Text Chat</div>
                  <div className="text-xs text-gray-500">Anonymous messaging</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎤</div>
                  <div className="text-sm font-medium">Voice Call</div>
                  <div className="text-xs text-gray-500">Clear audio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📹</div>
                  <div className="text-sm font-medium">Video Call</div>
                  <div className="text-xs text-gray-500">Secure video</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={handleRatingClose}
        onSubmit={handleRatingSubmit}
        sessionData={sessionToRate}
        isSubmitting={isSubmittingRating}
      />
    </div>
  </div>
);
}
