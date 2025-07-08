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

            {/* Session Type */}
            {!activeSession && (
              <div className="w-full max-w-xl bg-blue-50 border border-gray-200 rounded-xl shadow-sm p-8 space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Session Type</h3>
                {[
                  { id: 'text', label: 'Text Chat 💬', desc: 'Private anonymous messages' },
                  { id: 'audio', label: 'Voice Call 🎤', desc: 'Voice-anonymized session' },
                  { id: 'video', label: 'Video Call 📹', desc: 'Secure masked video call' }
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`block p-5 border rounded-md cursor-pointer transition ${sessionType === type.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
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
                  {!activeSession && (
                    <div className="w-full max-w-xl bg-blue-50 border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Therapists</h3>
                      <button
                      onClick={() => setShowTherapistList(!showTherapistList)}
                      className="text-base text-indigo-600 hover:text-indigo-800"
                      >
                      {showTherapistList ? 'Hide' : 'Show'} ({availableTherapists.length})
                      </button>
                    </div>

                    {showTherapistList && (
                      <ul className="space-y-3 mt-4">
                      {availableTherapists.map((therapist) => (
                        <li 
                        key={therapist.id} 
                        className={`p-4 border rounded-lg bg-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedTherapist?.id === therapist.id 
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTherapist(therapist)}
                        >
                        <div className="font-bold text-gray-900 text-lg mb-2">{therapist.name}</div>
                        {therapist.specialties && therapist.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                          {therapist.specialties.map((speciality, index) => (
                            <span 
                            key={index}
                            className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                            >
                            {speciality}
                            </span>
                          ))}
                          </div>
                        )}
                        {therapist.experience && (
                          <div className="mt-2 text-sm text-gray-600">
                            {typeof therapist.experience === 'string' 
                              ? therapist.experience 
                              : `${therapist.experience.yearsOfPractice || 0} years experience`
                            }
                          </div>
                        )}
                        </li>
                      ))}
                      </ul>
                    )}

                    {/* Request Session Button */}
                    {selectedTherapist && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800 mb-2">Selected Therapist:</div>
                        <div className="font-bold text-green-900 text-lg mb-2">{selectedTherapist.name}</div>
                      </div>
                      <button
                        onClick={handleRequestSession}
                        disabled={requestStatus === 'sending'}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {requestStatus === 'sending' ? 'Requesting...' : `Request ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`}
                      </button>
                      </div>
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
                          className={`p-3 rounded-lg max-w-xs ${message.senderType === 'user'
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

                {/* Professional WebRTC Video/Audio UI - Google Meet Style */}
                {(activeSession.sessionType === 'audio' || activeSession.sessionType === 'video') && webRTC && (
                  <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
                    {/* Top Header Bar */}
                    <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">
                          {activeSession.sessionType === 'video' ? 'Video Call' : 'Voice Call'} • Secure Session
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300 text-sm">
                        <span>Connection: {webRTC.connectionState}</span>
                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Main Video Area */}
                    <div className="flex-1 min-h-0 relative overflow-hidden">
                      {activeSession.sessionType === 'video' ? (
                        <div className="w-full h-full relative">
                          {/* Remote Video (Main) */}
                          <div className="absolute inset-0 w-full h-full bg-gray-900">
                            <video
                              ref={webRTC.remoteVideoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{display: webRTC.remoteVideoRef?.current?.srcObject ? 'none' : 'flex'}}>
                              <div className="text-center text-white">
                                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                                  T
                                </div>
                                <p className="text-lg font-medium">Therapist</p>
                                <p className="text-sm text-gray-400">Connecting...</p>
                              </div>
                            </div>
                          </div>

                          {/* Local Video (Picture-in-Picture) */}
                          <div className="absolute top-4 right-4 w-64 h-36 md:w-80 md:h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 shadow-2xl">
                            <video
                              ref={webRTC.localVideoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{display: webRTC.isVideoEnabled ? 'none' : 'flex'}}>
                              <div className="text-center text-white">
                                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                                  Y
                                </div>
                                <p className="text-sm">You</p>
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                              You
                            </div>
                          </div>

                          {/* Video Controls Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 md:p-6">
                            <div className="flex items-center justify-center space-x-3 md:space-x-4">
                              {/* Microphone Toggle */}
                              <button
                                onClick={() => webRTC.toggleMute()}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                                  webRTC.isMuted 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                                    : 'bg-gray-700 hover:bg-gray-600 shadow-md'
                                }`}
                              >
                                {webRTC.isMuted ? (
                                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>

                              {/* End Call */}
                              <button
                                onClick={handleEndSession}
                                className="w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg"
                              >
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                              </button>

                              {/* Video Toggle */}
                              <button
                                onClick={() => webRTC.toggleVideo()}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                                  !webRTC.isVideoEnabled 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                                    : 'bg-gray-700 hover:bg-gray-600 shadow-md'
                                }`}
                              >
                                {webRTC.isVideoEnabled ? (
                                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                  </svg>
                                )}
                              </button>
                            </div>

                            {/* Audio Autoplay Warning */}
                            {webRTC.audioAutoplayBlocked && (
                              <div className="flex justify-center mt-4">
                                <button
                                  onClick={() => webRTC.enableAudioPlayback()}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0 8.971 8.971 0 010 12.728 1 1 0 11-1.414-1.414 6.971 6.971 0 000-9.9 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.978 4.978 0 010 7.071 1 1 0 11-1.415-1.414 2.978 2.978 0 000-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  <span>Enable Audio</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Audio Call UI
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
                          <div className="text-center">
                            {/* Animated Audio Wave */}
                            <div className="flex justify-center space-x-1 mb-8">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-2 bg-white rounded-full animate-pulse"
                                  style={{
                                    height: `${Math.random() * 40 + 20}px`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '1s'
                                  }}
                                ></div>
                              ))}
                            </div>
                            
                            {/* Therapist Avatar */}
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl">
                              <span className="text-2xl md:text-4xl font-bold text-white">T</span>
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Voice call with Therapist</h3>
                            <p className="text-blue-200 mb-6 md:mb-8 text-sm md:text-base">Secure end-to-end encrypted session</p>
                            
                            {/* Audio Controls */}
                            <div className="flex items-center justify-center space-x-4 md:space-x-6">
                              <button
                                onClick={() => webRTC.toggleMute()}
                                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                                  webRTC.isMuted 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                                }`}
                              >
                                {webRTC.isMuted ? (
                                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>

                              <button
                                onClick={handleEndSession}
                                className="w-18 h-18 md:w-20 md:h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-2xl"
                              >
                                <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                              </button>
                            </div>

                            {/* Audio Autoplay Warning */}
                            {webRTC.audioAutoplayBlocked && (
                              <div className="mt-8">
                                <button
                                  onClick={() => webRTC.enableAudioPlayback()}
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg flex items-center space-x-3 mx-auto transition-colors shadow-lg"
                                >
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0 8.971 8.971 0 010 12.728 1 1 0 11-1.414-1.414 6.971 6.971 0 000-9.9 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.978 4.978 0 010 7.071 1 1 0 11-1.415-1.414 2.978 2.978 0 000-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  <span>Enable Audio Playback</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hidden Audio Element */}
                    <audio
                      ref={webRTC.remoteAudioRef}
                      autoPlay
                      playsInline
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-gray-200 rounded-xl shadow-sm p-30 text-center h-[650px]">
                <div className="text-8xl mb-5">🔒</div>
                <h3 className="text-3xl font-semibold text-gray-900 mb-5">
                  Ready for Anonymous Session
                </h3>
                <p className="text-gray-600 mb-15">
                  Select your preferred session type and choose a therapist to begin your secure, anonymous therapy session.
                </p>
                <div className="grid grid-cols-3 gap-15 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-5xl mb-7">💬</div>
                    <div className="text-sm font-medium">Text Chat</div>
                    <div className="text-xs text-gray-500">Anonymous messaging</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-7">🎤</div>
                    <div className="text-sm font-medium">Voice Call</div>
                    <div className="text-xs text-gray-500">Clear audio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-7">📹</div>
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
