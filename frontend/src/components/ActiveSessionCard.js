'use client';

import { useEffect, useRef, useState } from 'react';

export default function ActiveSessionCard({ 
  session, 
  messages, 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onEndSession, 
  isTyping, 
  userType 
}) {
  const messagesEndRef = useRef(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSessionDuration = () => {
    if (!session.startTime) return '';
    const now = new Date();
    const start = new Date(session.startTime);
    const diff = now - start;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const handleEndSession = () => {
    if (showEndConfirm) {
      onEndSession();
      setShowEndConfirm(false);
    } else {
      setShowEndConfirm(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      {/* Session Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Session</h3>
            <p className="text-sm text-gray-500">
              Duration: {getSessionDuration()} • Session ID: {session.sessionId?.substring(0, 8)}...
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
            <button
              onClick={handleEndSession}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showEndConfirm 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              {showEndConfirm ? 'Confirm End' : 'End Session'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '500px' }}>
        {messages.map((message, index) => (
          <div key={message.id || index} className="flex flex-col">
            <div className={`flex ${message.senderType === userType ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                message.senderType === 'system' 
                  ? 'bg-blue-50 text-blue-800 text-center text-sm italic mx-auto'
                  : message.senderType === userType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
            <div className={`text-xs text-gray-500 mt-1 ${
              message.senderType === userType ? 'text-right' : 'text-left'
            }`}>
              {message.senderType === 'system' ? '' : (
                <>
                  {message.senderType === userType ? 'You' : 'User'} • {formatTime(message.timestamp)}
                </>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <span className="text-sm">User is typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
          />
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {showEndConfirm && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Are you sure you want to end this session? This action cannot be undone.
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
