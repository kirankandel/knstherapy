"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Chatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your anonymous AI mental health support companion. You can share anything with me – I'm here to listen and help. Your privacy is completely protected.",
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
 const lower = userMessage.toLowerCase();
    let selected = responses.default;
    if (lower.includes("anxiety") || lower.includes("worried")) selected = responses.anxiety;
    else if (lower.includes("stress") || lower.includes("overwhelmed")) selected = responses.stress;
    else if (lower.includes("depression") || lower.includes("sad")) selected = responses.depression;
    else if (lower.includes("sleep") || lower.includes("insomnia")) selected = responses.sleep;

    return selected[Math.floor(Math.random() * selected.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg = {
        id: messages.length + 2,
        type: "ai",
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        subtext: "Everything you share here is completely anonymous and secure."
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1800);
  };

  const handleConnectTherapist = () => {
    setMessages(prev => [
      ...prev,
      {
        id: messages.length + 1,
        type: "system",
        content: "Redirecting you to connect with a human therapist...",
        timestamp: new Date()
      }
    ]);
    setTimeout(() => router.push("/anonymous-session"), 2000);
  };

  const formatTime = (timestamp) =>
    timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-xl h-[calc(100vh-8rem)] flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-green-600 text-white p-5 rounded-t-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                <h1 className="text-xl font-bold">Anonymous AI Support</h1>
              </div>
              <p className="text-sm text-green-100">Encrypted & Private</p>
            </div>
            <p className="text-sm mt-2 text-green-200">
              I'm here to provide immediate mental health support. If I detect a crisis, I can connect you with a therapist.
            </p>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                {msg.type === "user" ? (
                  <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow max-w-xs sm:max-w-sm">
                    <p>{msg.content}</p>
                    <span className="text-xs text-blue-200 block mt-1">{formatTime(msg.timestamp)}</span>
                  </div>
                ) : msg.type === "system" ? (
                  <div className="mx-auto bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm border border-yellow-300">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-white border px-4 py-3 rounded-lg shadow max-w-xs sm:max-w-sm">
                    <div className="flex">
                      <div className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 text-sm font-bold">
                        AI
                      </div>
                      <div>
                        <p className="text-gray-800">{msg.content}</p>
                        {msg.subtext && <p className="text-gray-500 text-xs mt-1">{msg.subtext}</p>}
                        <span className="text-xs text-gray-400 block mt-1">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  AI
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="border-t bg-white p-4 rounded-b-xl">
            <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type here... (completely anonymous)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
                disabled={isTyping}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition disabled:bg-gray-300"
              >
                {isTyping ? "Typing..." : "Send"}
              </button>
            </form>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Session: {sessionId}</span>
              <button
                onClick={handleConnectTherapist}
                className="text-red-600 hover:underline"
              >
                🆘 Connect to Therapist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
