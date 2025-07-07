"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Chatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your anonymous AI mental health support companion. You can share anything with me - I'm here to listen and help. Your privacy is completely protected.",
      timestamp: new Date(),
      subtext: "How are you feeling today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = (userMessage) => {
    // Simple AI response logic - in real app, this would call your AI service
    const responses = {
      anxiety: [
        "I understand that anxiety can feel overwhelming. Thank you for sharing that with me. Can you tell me more about what might be triggering these feelings?",
        "Anxiety is a very common experience. You're not alone in feeling this way. What situations tend to make your anxiety worse?",
        "It takes courage to talk about anxiety. Have you noticed any physical symptoms along with these anxious thoughts?"
      ],
      stress: [
        "Work stress can really impact our overall well-being. It sounds like you're dealing with a lot right now. What aspects of work are causing you the most stress?",
        "Stress can affect our sleep, relationships, and mental health. You're taking a positive step by talking about it. Have you been able to identify what triggers your stress the most?",
        "Managing stress is crucial for mental health. What does a typical stressful day look like for you?"
      ],
      depression: [
        "Thank you for trusting me with something so personal. Depression can make everything feel difficult. How long have you been experiencing these feelings?",
        "Depression affects everyone differently. You're brave for reaching out. Can you describe what a typical day feels like for you right now?",
        "I'm here to support you through this. Depression is treatable, and you don't have to face it alone. What brings you even small moments of relief?"
      ],
      sleep: [
        "Sleep problems can really affect our mental health. Poor sleep and anxiety often go hand in hand. What's your bedtime routine like?",
        "Sleep issues are very common when we're stressed or anxious. Have you noticed any patterns in what might be keeping you awake?",
        "Good sleep is essential for mental wellness. What time do you usually try to go to bed, and what's going through your mind then?"
      ],
      default: [
        "Thank you for sharing that with me. Can you tell me more about what you're experiencing?",
        "I'm here to listen and support you. What would be most helpful for you to talk about right now?",
        "That sounds like it's been difficult for you. How has this been affecting your daily life?",
        "I appreciate you opening up. What's been on your mind lately that you'd like to explore?"
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    let responseArray = responses.default;

    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      responseArray = responses.anxiety;
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
      responseArray = responses.stress;
    } else if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || lowerMessage.includes('sad')) {
      responseArray = responses.depression;
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
      responseArray = responses.sleep;
    }

    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        subtext: "Remember, everything you share here is completely anonymous and secure."
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleConnectTherapist = () => {
    const therapistMessage = {
      id: messages.length + 1,
      type: "system",
      content: "Redirecting you to connect with an anonymous human therapist...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, therapistMessage]);
    
    // Redirect to anonymous session page
    setTimeout(() => {
      router.push('/anonymous-session');
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-300 rounded-full mr-2"></div>
                <h1 className="text-lg font-semibold">Anonymous AI Support</h1>
              </div>
              <div className="text-sm opacity-75">Always anonymous • End-to-end encrypted</div>
            </div>
            <p className="text-green-100 text-sm mt-2">
              I&apos;m here to provide immediate mental health support. If I detect a crisis situation, I can connect you with a human therapist.
            </p>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                {message.type === 'user' ? (
                  // User message
                  <div className="bg-indigo-600 text-white rounded-lg p-3 max-w-md shadow-sm">
                    <p className="break-words">{message.content}</p>
                    <p className="text-indigo-200 text-xs mt-1">{formatTime(message.timestamp)}</p>
                  </div>
                ) : message.type === 'system' ? (
                  // System message
                  <div className="flex justify-center">
                    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg p-3 max-w-md text-center">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  // AI message
                  <div className="bg-white rounded-lg p-4 shadow-sm max-w-md">
                    <div className="flex items-start">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm flex-shrink-0">
                        AI
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 break-words">{message.content}</p>
                        {message.subtext && (
                          <p className="text-gray-600 text-sm mt-2">{message.subtext}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-2">{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="mb-4">
                <div className="bg-white rounded-lg p-4 shadow-sm max-w-md">
                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                      AI
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-gray-500 text-sm ml-2">AI is typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4 rounded-b-lg">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here... (completely anonymous)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isTyping}
                maxLength={500}
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isTyping ? 'AI Thinking...' : 'Send'}
              </button>
            </form>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Session ID: {sessionId} • Encrypted • No data stored
              </div>
              <button 
                onClick={handleConnectTherapist}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                🆘 Connect to Human Therapist
              </button>
            </div>
            <div className="text-right text-xs text-gray-400 mt-1">
              {inputMessage.length}/500 characters
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-800 mb-1">AI-Powered Support</h3>
            <p className="text-gray-600 text-sm">Advanced NLP for mental health conversations</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl mb-2">🚨</div>
            <h3 className="font-semibold text-gray-800 mb-1">Crisis Detection</h3>
            <p className="text-gray-600 text-sm">Automatic escalation to human therapists</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-800 mb-1">Complete Privacy</h3>
            <p className="text-gray-600 text-sm">No logs, no tracking, no data retention</p>
          </div>
        </div>
      </div>
    </div>
  );
}
