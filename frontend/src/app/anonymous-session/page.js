"use client";

import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { useSocket } from "../../hooks/useSocket";

const SPECIALTIES_MAP = {
  'anxiety': 'Anxiety Disorders',
  'depression': 'Depression',
  'trauma': 'Trauma & PTSD',
  'relationships': 'Relationship Issues',
  'addiction': 'Addiction & Substance Abuse',
  'grief': 'Grief & Loss',
  'eating_disorders': 'Eating Disorders',
  'family_therapy': 'Family Therapy',
  'couples_therapy': 'Couples Therapy',
  'child_therapy': 'Child & Adolescent Therapy',
  'cognitive_behavioral': 'Cognitive Behavioral Therapy',
  'mindfulness': 'Mindfulness & Meditation',
  'other': 'Other'
};

export default function AnonymousSession() {
  const [activeSession, setActiveSession] = useState(null); // 'text' or 'voice'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [therapistConnected, setTherapistConnected] = useState(false);
  const [waitingForTherapist, setWaitingForTherapist] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [availableTherapists, setAvailableTherapists] = useState([]);
  const [showTherapistList, setShowTherapistList] = useState(false);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'sent', 'declined', 'accepted'
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const therapistRefreshIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);

  // Socket.IO hook
  const {
    isConnected,
    sessionId,
    connectionError,
    connect,
    disconnect,
    joinAsUser,
    sendMessage,
    startTyping,
    stopTyping,
    endSession: endSocketSession,
    requestSession,
    onMessage,
    onTyping,
    onSessionMatched,
    onWaitingForTherapist,
    onParticipantDisconnected,
    onSessionEnded,
    onRequestSent,
    onRequestFailed,
    onRequestDeclined,
    offMessage,
    offTyping,
    offSessionMatched,
    offWaitingForTherapist,
    offParticipantDisconnected,
    offSessionEnded,
    offRequestSent,
    offRequestFailed,
    offRequestDeclined,
  } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, otherUserTyping]);

  // Debug isConnected state changes
  useEffect(() => {
    console.log('🔌 isConnected state changed:', isConnected);
    isConnectedRef.current = isConnected; // Keep ref in sync
  }, [isConnected]);

  // Debug sessionId state changes
  useEffect(() => {
    console.log('🆔 sessionId state changed:', sessionId);
  }, [sessionId]);

  // Socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Handle incoming messages
    onMessage((message) => {
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    });

    // Handle typing indicators
    onTyping((data) => {
      setOtherUserTyping(data.isTyping);
    });

    // Handle session matching
    onSessionMatched((data) => {
      setWaitingForTherapist(false);
      setTherapistConnected(true);
      
      const matchMessage = {
        id: `session-matched-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, matchMessage]);
    });

    // Handle waiting for therapist
    onWaitingForTherapist((data) => {
      setWaitingForTherapist(true);
      
      const waitMessage = {
        id: `waiting-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, waitMessage]);
    });

    // Handle participant disconnection
    onParticipantDisconnected((data) => {
      const disconnectMessage = {
        id: `disconnect-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, disconnectMessage]);
      
      setTherapistConnected(false);
    });

    // Handle session end
    onSessionEnded((data) => {
      const endMessage = {
        id: `session-end-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, endMessage]);
      
      setTimeout(() => {
        setActiveSession(null);
        setMessages([]);
        setTherapistConnected(false);
        setWaitingForTherapist(false);
        setRequestStatus(null);
        setCurrentRequestId(null);
        setSelectedTherapist(null);
        disconnect();
      }, 3000);
    });

    // Handle session request sent
    onRequestSent((data) => {
      console.log('✅ Session request sent successfully:', data);
      setRequestStatus('sent');
      setCurrentRequestId(data.requestId);
      
      const sentMessage = {
        id: `request-sent-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, sentMessage]);
    });

    // Handle session request failed
    onRequestFailed((data) => {
      console.log('❌ Session request failed:', data);
      setRequestStatus('failed');
      
      const failedMessage = {
        id: `request-failed-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, failedMessage]);
      
      // Reset after a delay
      setTimeout(() => {
        setRequestStatus(null);
        setCurrentRequestId(null);
        setSelectedTherapist(null);
        setActiveSession(null);
        setMessages([]);
        disconnect();
      }, 5000);
    });

    // Handle session request declined
    onRequestDeclined((data) => {
      console.log('❌ Session request declined:', data);
      setRequestStatus('declined');
      
      const declinedMessage = {
        id: `request-declined-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, declinedMessage]);
      
      // Reset after a delay and suggest trying another therapist
      setTimeout(() => {
        const suggestionMessage = {
          id: `suggestion-${Date.now() + 1}`,
          type: "system",
          content: "You can try selecting another therapist or join the general queue.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, suggestionMessage]);
        
        setRequestStatus(null);
        setCurrentRequestId(null);
        setSelectedTherapist(null);
        setActiveSession(null);
        
        setTimeout(() => {
          setMessages([]);
          disconnect();
        }, 3000);
      }, 3000);
    });

    // Cleanup listeners
    return () => {
      offMessage();
      offTyping();
      offSessionMatched();
      offWaitingForTherapist();
      offParticipantDisconnected();
      offSessionEnded();
      offRequestSent();
      offRequestFailed();
      offRequestDeclined();
    };
  }, [isConnected, onMessage, onTyping, onSessionMatched, onWaitingForTherapist, onParticipantDisconnected, onSessionEnded, onRequestSent, onRequestFailed, onRequestDeclined, offMessage, offTyping, offSessionMatched, offWaitingForTherapist, offParticipantDisconnected, offSessionEnded, offRequestSent, offRequestFailed, offRequestDeclined, disconnect]);

  const startTextSession = () => {
    console.log('🚀 Starting text session...');
    setActiveSession('text');
    setMessages([]);
    setWaitingForTherapist(true);
    
    // Connect to socket and join as user
    connect();
    
    // Wait for connection before joining and sending general queue request
    const connectInterval = setInterval(() => {
      const currentConnected = isConnectedRef.current;
      console.log('⏳ Checking connection... isConnected:', currentConnected, 'state:', isConnected);
      if (currentConnected) {
        console.log('✅ Socket connected! Joining as user and sending request...');
        clearInterval(connectInterval);
        joinAsUser({ sessionType: 'text' });
        
        // Send a general session request (no specific therapist)
        console.log('📤 Sending general session request to any available therapist');
        requestSession(
          null, // null therapistId means any available therapist
          'text',
          'I would like to start a session with any available therapist.',
          { sessionType: 'text' }
        );
      }
    }, 200); // Increased interval to 200ms
    
    // Safety timeout to clear interval if connection takes too long
    setTimeout(() => {
      clearInterval(connectInterval);
      if (!isConnected) {
        console.error('❌ Connection timeout - clearing interval');
      }
    }, 15000); // Increased timeout to 15s
    
    // Initial system message
    const welcomeMessage = {
      id: `welcome-general-${Date.now()}`,
      type: "system",
      content: "Finding any available therapist... Please wait while we connect you to a professional.",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const startVoiceSession = () => {
    // Voice session feature - to be implemented
    alert("Voice session feature coming soon! Please use text chat for now.");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !therapistConnected || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    // Add message to local state immediately for responsiveness
    setMessages(prev => [...prev, userMessage]);
    
    // Send message via socket
    sendMessage(sessionId, inputMessage);
    
    setInputMessage("");
    stopTyping();
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Handle typing indicators
    if (!isTyping && therapistConnected && sessionId) {
      setIsTyping(true);
      startTyping();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 1000);
  };

  const endSession = () => {
    if (sessionId) {
      endSocketSession();
    }
  };

  const cancelRequest = () => {
    // Reset all request-related state
    setRequestStatus(null);
    setCurrentRequestId(null);
    setSelectedTherapist(null);
    setActiveSession(null);
    setMessages([]);
    setWaitingForTherapist(false);
    setTherapistConnected(false);
    disconnect();
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/v1/docs`);
      if (response.ok) {
        alert('✅ Backend server is running! You can now start a session.');
        window.location.reload();
      } else {
        alert('❌ Backend server responded but with an error. Check the server logs.');
      }
    } catch (error) {
      alert('❌ Cannot connect to backend server. Make sure it\'s running on port 3001.');
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to fetch available therapists
  const fetchAvailableTherapists = useCallback(async (specialty = '') => {
    setLoadingTherapists(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/v1';
      const url = new URL(`${API_BASE}/therapists/available`);
      
      if (specialty) {
        url.searchParams.append('specialties', specialty);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch therapists');
      }
      
      setAvailableTherapists(data.results || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setAvailableTherapists([]);
    } finally {
      setLoadingTherapists(false);
    }
  }, []);

  // Load therapists when component mounts or specialty changes
  useEffect(() => {
    // Clear any existing interval
    if (therapistRefreshIntervalRef.current) {
      clearInterval(therapistRefreshIntervalRef.current);
      therapistRefreshIntervalRef.current = null;
    }

    if (showTherapistList) {
      // Fetch immediately
      fetchAvailableTherapists(selectedSpecialty);
      
      // Set up interval to refresh therapist list every 30 seconds (twice per minute)
      therapistRefreshIntervalRef.current = setInterval(() => {
        fetchAvailableTherapists(selectedSpecialty);
      }, 30000);
    }

    // Cleanup function
    return () => {
      if (therapistRefreshIntervalRef.current) {
        clearInterval(therapistRefreshIntervalRef.current);
        therapistRefreshIntervalRef.current = null;
      }
    };
  }, [showTherapistList, selectedSpecialty, fetchAvailableTherapists]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (therapistRefreshIntervalRef.current) {
        clearInterval(therapistRefreshIntervalRef.current);
        therapistRefreshIntervalRef.current = null;
      }
    };
  }, []);

  // Function to check if therapist is recently online based on lastActive
  const isTherapistOnline = useCallback((therapist) => {
    if (!therapist.lastActive) return false;
    
    const lastActiveTime = new Date(therapist.lastActive);
    const now = new Date();
    const timeDiffInMinutes = (now - lastActiveTime) / (1000 * 60);
    
    // Consider online if active within last 2 minutes
    return timeDiffInMinutes <= 2;
  }, []);

  // Function to get status display for therapist
  const getTherapistStatus = useCallback((therapist) => {
    if (isTherapistOnline(therapist)) {
      return {
        text: 'Online Now',
        color: 'bg-green-400',
        textColor: 'text-green-600'
      };
    } else if (therapist.lastActive) {
      const lastActiveTime = new Date(therapist.lastActive);
      const now = new Date();
      const timeDiffInMinutes = Math.floor((now - lastActiveTime) / (1000 * 60));
      
      if (timeDiffInMinutes < 60) {
        return {
          text: `Active ${timeDiffInMinutes}m ago`,
          color: 'bg-yellow-400',
          textColor: 'text-yellow-600'
        };
      } else {
        const timeDiffInHours = Math.floor(timeDiffInMinutes / 60);
        return {
          text: timeDiffInHours < 24 ? `Active ${timeDiffInHours}h ago` : 'Available',
          color: 'bg-gray-400',
          textColor: 'text-gray-600'
        };
      }
    } else {
      return {
        text: 'Available',
        color: 'bg-gray-400',
        textColor: 'text-gray-600'
      };
    }
  }, [isTherapistOnline]);

  const handleShowTherapists = () => {
    setShowTherapistList(true);
    fetchAvailableTherapists();
  };

  const handleSelectTherapist = (therapist) => {
    setSelectedTherapist(therapist);
    setShowTherapistList(false);
    startSessionRequestWithTherapist(therapist);
  };

  const startSessionRequestWithTherapist = (therapist) => {
    console.log('🚀 Starting session request with therapist:', therapist.name);
    setActiveSession('text');
    setMessages([]);
    setRequestStatus('pending');
    setWaitingForTherapist(true);
    
    // Connect to socket and join as user
    connect();
    
    // Wait for connection before joining and sending request
    const connectInterval = setInterval(() => {
      const currentConnected = isConnectedRef.current;
      console.log('⏳ Checking connection for therapist request... isConnected:', currentConnected, 'state:', isConnected);
      if (currentConnected) {
        console.log('✅ Socket connected! Joining as user and sending therapist request...');
        clearInterval(connectInterval);
        joinAsUser({ sessionType: 'text' });
        
        // Send session request to the specific therapist
        const therapistId = therapist._id || therapist.id;
        console.log('📤 Sending session request to therapist:', therapistId);
        console.log('👨‍⚕️ Therapist details:', therapist);
        console.log('🔗 Socket connected:', isConnected);
        console.log('📡 Session ID:', sessionId);
        
        if (!therapistId) {
          console.error('❌ No therapist ID found in therapist object:', therapist);
          return;
        }
        
        requestSession(
          therapistId,
          'text',
          `I would like to start a session with you. I am looking for help with ${therapist.therapistProfile.specialties.map(s => SPECIALTIES_MAP[s] || s).join(', ')}.`,
          { targetTherapist: therapistId }
        );
      }
    }, 200); // Increased interval to 200ms
    
    // Safety timeout to clear interval if connection takes too long
    setTimeout(() => {
      clearInterval(connectInterval);
      if (!isConnected) {
        console.error('❌ Therapist request connection timeout - clearing interval');
      }
    }, 15000); // Increased timeout to 15s
    
    // Initial system message
    const welcomeMessage = {
      id: `welcome-therapist-${Date.now()}`,
      type: "system",
      content: `Sending session request to ${therapist.name} who specializes in ${therapist.therapistProfile.specialties.map(s => SPECIALTIES_MAP[s] || s).join(', ')}... Please wait for their response.`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  if (activeSession === 'text') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md h-[calc(100vh-8rem)] flex flex-col">
            {/* Chat Header */}
            <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${
                    therapistConnected ? 'bg-green-300' : 
                    requestStatus === 'sent' ? 'bg-yellow-300' :
                    requestStatus === 'declined' ? 'bg-red-300' :
                    requestStatus === 'failed' ? 'bg-red-300' :
                    'bg-gray-300'
                  } rounded-full mr-2`}></div>
                  <h1 className="text-lg font-semibold">
                    {selectedTherapist ? `Session with ${selectedTherapist.name}` : 'Anonymous Text Session'}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm opacity-75">Session ID: {sessionId}</div>
                  {requestStatus === 'sent' && !therapistConnected && (
                    <button
                      onClick={cancelRequest}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}
                  <button
                    onClick={endSession}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    End Session
                  </button>
                </div>
              </div>
              <p className="text-indigo-100 text-sm mt-2">
                {therapistConnected 
                  ? "Connected to licensed therapist • Fully encrypted • Anonymous"
                  : requestStatus === 'sent'
                  ? `Waiting for ${selectedTherapist?.name || 'therapist'} to accept your request...`
                  : requestStatus === 'declined'
                  ? "Session request was declined"
                  : requestStatus === 'failed'
                  ? "Session request failed"
                  : "Connecting to therapist • Please wait..."
                }
              </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`mb-4 ${message.type === 'user' || message.senderType === 'user' ? 'flex justify-end' : ''}`}>
                  {message.type === 'user' || message.senderType === 'user' ? (
                    // User message
                    <div className="bg-indigo-600 text-white rounded-lg p-3 max-w-md shadow-sm">
                      <p className="break-words">{message.content}</p>
                      <p className="text-indigo-200 text-xs mt-1">{formatTime(message.timestamp)}</p>
                    </div>
                  ) : message.type === 'system' ? (
                    // System message
                    <div className="flex justify-center">
                      <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-lg p-3 max-w-md text-center">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    // Therapist message
                    <div className="bg-white rounded-lg p-4 shadow-sm max-w-md border-l-4 border-green-500">
                      <div className="flex items-start">
                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm flex-shrink-0">
                          T
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium text-green-700">
                              {message.therapistId || message.senderId || "Therapist"}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">Licensed Therapist</span>
                          </div>
                          <p className="text-gray-800 break-words">{message.content}</p>
                          <p className="text-gray-400 text-xs mt-2">{formatTime(message.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Other user typing indicator */}
              {otherUserTyping && (
                <div className="mb-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm max-w-md border-l-4 border-green-500">
                    <div className="flex items-start">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                        T
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-gray-500 text-sm ml-2">Therapist is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Waiting for therapist */}
              {waitingForTherapist && !therapistConnected && (
                <div className="flex justify-center">
                  <div className={`border rounded-lg p-4 text-center ${
                    requestStatus === 'sent' ? 'bg-yellow-50 border-yellow-200' :
                    requestStatus === 'declined' ? 'bg-red-50 border-red-200' :
                    requestStatus === 'failed' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    {requestStatus !== 'declined' && requestStatus !== 'failed' && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    )}
                    <p className={`text-sm ${
                      requestStatus === 'sent' ? 'text-yellow-700' :
                      requestStatus === 'declined' ? 'text-red-700' :
                      requestStatus === 'failed' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {requestStatus === 'sent' 
                        ? `Waiting for ${selectedTherapist?.name || 'therapist'} to respond to your request...`
                        : requestStatus === 'declined'
                        ? 'Your session request was declined.'
                        : requestStatus === 'failed'
                        ? 'Session request failed. Please try again.'
                        : selectedTherapist
                        ? `Sending request to ${selectedTherapist.name}...`
                        : 'Finding available therapist...'
                      }
                    </p>
                    {connectionError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-xs font-medium">Connection Error:</p>
                        <p className="text-red-600 text-xs mt-1">{connectionError}</p>
                      </div>
                    )}
                    {(requestStatus === 'declined' || requestStatus === 'failed') && (
                      <div className="mt-3 space-x-2">
                        <button
                          onClick={() => {
                            setShowTherapistList(true);
                            setRequestStatus(null);
                            setWaitingForTherapist(false);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition-colors"
                        >
                          Try Another Therapist
                        </button>
                        <button
                          onClick={cancelRequest}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4 rounded-b-lg">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder={therapistConnected ? "Type your message..." : "Please wait for therapist to connect..."}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!therapistConnected || !isConnected}
                  maxLength={1000}
                />
                <button 
                  type="submit"
                  disabled={!inputMessage.trim() || !therapistConnected || !isConnected}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <span className={`w-2 h-2 ${isConnected && therapistConnected ? 'bg-green-400' : isConnected ? 'bg-yellow-400' : 'bg-red-400'} rounded-full mr-2`}></span>
                  {isConnected && therapistConnected ? 'Encrypted session active' : isConnected ? 'Connected - waiting...' : 'Connecting...'}
                  {sessionId && (
                    <span className="ml-2">• Session: {sessionId}</span>
                  )}
                </div>
                <div className="text-right">
                  {inputMessage.length}/1000 characters
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Your Anonymous Session</h1>
          <p className="text-xl text-gray-600">Choose how you&apos;d like to connect with a licensed therapist</p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 mb-8">
          <div className="flex items-start">
            <div className="text-indigo-500 text-xl mr-3">🔒</div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Complete Privacy Guaranteed</h3>
              <p className="text-indigo-700">
                No personal information required. You&apos;ll receive a one-time session token that expires after use. 
                All communications are end-to-end encrypted and no data is stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Therapist Selection Modal */}
        {showTherapistList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Select a Therapist</h2>
                  <button
                    onClick={() => setShowTherapistList(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                {/* Specialty Filter */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Specialties</option>
                    {Object.entries(SPECIALTIES_MAP).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingTherapists ? (
                  <Fragment key="loading-state">
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading available therapists...</p>
                    </div>
                  </Fragment>
                ) : availableTherapists.length === 0 ? (
                  <Fragment key="empty-state">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">😔</div>
                      <p className="text-gray-600 text-lg">No therapists are currently available</p>
                      <p className="text-gray-500 text-sm mt-2">
                        You can still start a session and we&apos;ll connect you when someone becomes available
                      </p>
                      <button
                        onClick={() => {
                          setShowTherapistList(false);
                          startTextSession();
                        }}
                        className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Join Wait List
                      </button>
                    </div>
                  </Fragment>
                ) : (
                  <Fragment key="therapist-list">
                    <div className="grid gap-4">
                      {availableTherapists.map((therapist, index) => (
                        <div
                          key={`therapist-${therapist._id || therapist.id || index}`}
                          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleSelectTherapist(therapist)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 text-sm font-medium">
                                  {therapist.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Dr. {therapist.name}
                                  </h3>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className={`w-2 h-2 ${getTherapistStatus(therapist).color} rounded-full mr-2`}></span>
                                    <span className={getTherapistStatus(therapist).textColor}>
                                      {getTherapistStatus(therapist).text}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Specialties:</strong> {therapist.therapistProfile.specialties.map(s => SPECIALTIES_MAP[s] || s).join(', ')}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Experience:</strong> {therapist.therapistProfile.experience?.yearsOfPractice || 0} years
                                </p>
                                {therapist.therapistProfile.rating?.average > 0 && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Rating:</strong> ⭐ {therapist.therapistProfile.rating.average.toFixed(1)} ({therapist.therapistProfile.rating.totalReviews} reviews)
                                  </p>
                                )}
                              </div>

                              {therapist.profile?.bio && (
                                <p className="text-sm text-gray-700 italic">
                                  &quot;{therapist.profile.bio.substring(0, 150)}...&quot;
                                </p>
                              )}
                            </div>
                            
                            <div className="ml-4 text-right">
                              <div className="text-sm text-gray-500 mb-2">
                                License: {therapist.therapistProfile.licenseNumber}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {therapist.therapistProfile.availability?.sessionTypes?.map((type, typeIndex) => (
                                  <span key={`session-type-${therapist._id || therapist.id || index}-${type}-${typeIndex}`} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Session Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-transparent hover:border-indigo-500 transition-all">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Anonymous Text Chat</h2>
              <p className="text-gray-600 mb-6">
                Connect with a therapist through secure, encrypted text messaging. 
                Perfect for those who prefer written communication.
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p>• Instant connection available</p>
                <p>• Full message encryption</p>
                <p>• No session logs kept</p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleShowTherapists}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  Choose Your Therapist
                </button>
                <p className="text-xs text-gray-500">or</p>
                <button 
                  onClick={startTextSession}
                  className="w-full bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition-colors font-medium"
                >
                  Connect to Any Available Therapist
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-transparent hover:border-green-500 transition-all">
            <div className="text-center">
              <div className="text-4xl mb-4">🎙️</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Anonymous Voice Call</h2>
              <p className="text-gray-600 mb-6">
                Have a real-time conversation with voice masking technology 
                to protect your identity completely.
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p>• Voice pitch modification</p>
                <p>• No call recording</p>
                <p>• Identity protection</p>
              </div>
              <button 
                onClick={startVoiceSession}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Start Voice Session
              </button>
            </div>
          </div>
        </div>

        {/* Crisis Support */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="text-red-500 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Crisis Support</h3>
              <p className="text-red-700 mb-4">
                If you&apos;re experiencing a mental health emergency, please reach out immediately:
              </p>
              <div className="space-y-2 text-red-700">
                <p>• National Suicide Prevention Lifeline: <strong>988</strong></p>
                <p>• Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></p>
                <p>• Emergency Services: <strong>911</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">How Anonymous Sessions Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Generate Token</h3>
              <p className="text-gray-600 text-sm">Receive a unique, anonymous session token that expires after use.</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Connect Safely</h3>
              <p className="text-gray-600 text-sm">Join an encrypted session with a licensed therapist.</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Session Ends</h3>
              <p className="text-gray-600 text-sm">All session data is permanently deleted. No trace remains.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
