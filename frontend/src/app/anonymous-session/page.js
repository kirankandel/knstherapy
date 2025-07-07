"use client";

import { useState, useRef, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";

export default function AnonymousSession() {
  const [activeSession, setActiveSession] = useState(null); // 'text' or 'voice'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [therapistConnected, setTherapistConnected] = useState(false);
  const [waitingForTherapist, setWaitingForTherapist] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
    onMessage,
    onTyping,
    onSessionMatched,
    onWaitingForTherapist,
    onParticipantDisconnected,
    onSessionEnded,
    offMessage,
    offTyping,
    offSessionMatched,
    offWaitingForTherapist,
    offParticipantDisconnected,
    offSessionEnded,
  } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, otherUserTyping]);

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
        id: Date.now(),
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
        id: Date.now(),
        type: "system",
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, waitMessage]);
    });

    // Handle participant disconnection
    onParticipantDisconnected((data) => {
      const disconnectMessage = {
        id: Date.now(),
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
        id: Date.now(),
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
        disconnect();
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
    };
  }, [isConnected, onMessage, onTyping, onSessionMatched, onWaitingForTherapist, onParticipantDisconnected, onSessionEnded, offMessage, offTyping, offSessionMatched, offWaitingForTherapist, offParticipantDisconnected, offSessionEnded, disconnect]);

  const startTextSession = () => {
    setActiveSession('text');
    setMessages([]);
    setWaitingForTherapist(true);
    
    // Connect to socket and join as user
    connect();
    
    // Wait for connection before joining
    const connectInterval = setInterval(() => {
      if (isConnected) {
        clearInterval(connectInterval);
        joinAsUser({ sessionType: 'text' });
      }
    }, 100);
    
    // Initial system message
    const welcomeMessage = {
      id: 1,
      type: "system",
      content: "Connecting you to an anonymous human therapist... Please wait while we find an available professional.",
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

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                  <div className={`w-3 h-3 ${therapistConnected ? 'bg-green-300' : 'bg-yellow-300'} rounded-full mr-2`}></div>
                  <h1 className="text-lg font-semibold">Anonymous Text Session</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm opacity-75">Session ID: {sessionId}</div>
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
              {waitingForTherapist && (
                <div className="flex justify-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-blue-700 text-sm">Finding available therapist...</p>
                    {connectionError && (
                      <p className="text-red-600 text-xs mt-2">Connection error: {connectionError}</p>
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

        {/* Session Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-transparent hover:border-indigo-500 transition-all cursor-pointer">
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
              <button 
                onClick={startTextSession}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Start Text Session
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-transparent hover:border-green-500 transition-all cursor-pointer">
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
