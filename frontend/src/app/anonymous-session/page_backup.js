"use client";

import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { useSocket } from "../../hooks/useSocket";

const SPECIALTIES_MAP = {
  anxiety: "Anxiety Disorders",
  depression: "Depression",
  trauma: "Trauma & PTSD",
  relationships: "Relationship Issues",
  addiction: "Addiction & Substance Abuse",
  grief: "Grief & Loss",
  eating_disorders: "Eating Disorders",
  family_therapy: "Family Therapy",
  couples_therapy: "Couples Therapy",
  child_therapy: "Child & Adolescent Therapy",
  cognitive_behavioral: "Cognitive Behavioral Therapy",
  mindfulness: "Mindfulness & Meditation",
  other: "Other",
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

  // null = nothing pending, 'pending' = waiting to emit once connected,
  // 'sent' = request sent, then 'declined' or 'failed' possible
  const [requestStatus, setRequestStatus] = useState(null);

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

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);

  // Keep a ref of isConnected
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isTyping, otherUserTyping]);

  // ========================
  // Callback handlers
  // ========================
  const handleSessionEnded = useCallback((data) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `session-end-${Date.now()}`,
        type: "system",
        content: data.message,
        timestamp: new Date(),
      },
    ]);
    setTimeout(() => {
      setActiveSession(null);
      setMessages([]);
      setTherapistConnected(false);
      setWaitingForTherapist(false);
      setRequestStatus(null);
      setSelectedTherapist(null);
      disconnect();
    }, 3000);
  }, [disconnect]);

  // ========================
  // Socket Event Listeners
  // ========================
  useEffect(() => {
    if (!isConnected) return;

    onMessage((message) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    });

    onTyping((data) => {
      setOtherUserTyping(data.isTyping);
    });

    onSessionMatched((data) => {
      setWaitingForTherapist(false);
      setTherapistConnected(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `session-matched-${Date.now()}`,
          type: "system",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    });

    onWaitingForTherapist((data) => {
      setWaitingForTherapist(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `waiting-${Date.now()}`,
          type: "system",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    });

    onParticipantDisconnected((data) => {
      setTherapistConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `disconnect-${Date.now()}`,
          type: "system",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    });

    onSessionEnded((data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `session-end-${Date.now()}`,
          type: "system",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => {
        setActiveSession(null);
        setMessages([]);
        setTherapistConnected(false);
        setWaitingForTherapist(false);
        setRequestStatus(null);
        setSelectedTherapist(null);
        disconnect();
      }, 3000);
    });

    onRequestSent((data) => {
      setRequestStatus("sent");
      setMessages((prev) => [
        ...prev,
        {
          id: `request-sent-${Date.now()}`,
          type: "system",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    });

    onRequestFailed((data) => {
      console.log('❌ onRequestFailed triggered:', data);
      setRequestStatus("failed");
      setMessages((prev) => [
        ...prev,
        {
          id: `request-failed-${Date.now()}`,
          type: "system",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
      // Don't auto-disconnect on request failed - let user decide what to do
      console.log('❌ Request failed, but keeping connection open for user to try again');
    });

    onRequestDeclined((data) => {
      console.log('❌ onRequestDeclined triggered:', data);
      setRequestStatus("declined");
      setMessages((prev) => [
        ...prev,
        {
          id: `request-declined-${Date.now()}`,
          type: "system",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `suggestion-${Date.now()}`,
            type: "system",
            content:
              "You can try selecting another therapist or join the general queue.",
            timestamp: new Date(),
          },
        ]);
        cancelRequest();
      }, 3000);
    });

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
  }, [
    isConnected,
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
    cancelRequest,
    disconnect,
  ]);

  // ======================================================
  // Once connected & we have a pending request → emit it
  // ======================================================
  useEffect(() => {
    if (isConnected && requestStatus === "pending") {
      console.log("✅ Connected! Joining and dispatching request…");
      joinAsUser({ sessionType: "text" });

      if (selectedTherapist) {
        const tid = selectedTherapist._id || selectedTherapist.id;
        requestSession(
          tid,
          "text",
          `I would like to start a session with you. I am looking for help with ${selectedTherapist.therapistProfile.specialties
            .map((s) => SPECIALTIES_MAP[s] || s)
            .join(", ")}.`,
          { targetTherapist: tid }
        );
      } else {
        requestSession(
          null,
          "text",
          "I would like to start a session with any available therapist.",
          { sessionType: "text" }
        );
      }

      setRequestStatus("sent");
    }
  }, [isConnected, requestStatus, selectedTherapist, joinAsUser, requestSession]);

  // ========================
  // Session start functions
  // ========================
  const startTextSession = () => {
    console.log("🚀 Requesting general queue session");
    setSelectedTherapist(null);
    setActiveSession("text");
    setMessages([
      {
        id: `welcome-general-${Date.now()}`,
        type: "system",
        content:
          "Finding any available therapist... Please wait while we connect you to a professional.",
        timestamp: new Date(),
      },
    ]);
    setWaitingForTherapist(true);
    setRequestStatus("pending");
    connect();
  };

  const startVoiceSession = () => {
    alert("Voice session feature coming soon! Please use text chat for now.");
  };

  const startSessionRequestWithTherapist = (therapist) => {
    console.log("🚀 Requesting session with therapist:", therapist.name);
    setSelectedTherapist(therapist);
    setActiveSession("text");
    setMessages([
      {
        id: `welcome-therapist-${Date.now()}`,
        type: "system",
        content: `Sending session request to ${therapist.name} who specializes in ${therapist.therapistProfile.specialties
          .map((s) => SPECIALTIES_MAP[s] || s)
          .join(", ")}... Please wait for their response.`,
        timestamp: new Date(),
      },
    ]);
    setWaitingForTherapist(true);
    setRequestStatus("pending");
    connect();
  };

  // ========================
  // Message handlers
  // ========================
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !therapistConnected || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessage(sessionId, inputMessage);
    setInputMessage("");
    stopTyping();
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!isTyping && therapistConnected && sessionId) {
      setIsTyping(true);
      startTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 1000);
  };

  const endSession = () => {
    if (sessionId) endSocketSession();
  };

  const cancelRequest = useCallback(() => {
    console.log('🚫 cancelRequest called - disconnecting socket');
    setRequestStatus(null);
    setSelectedTherapist(null);
    setActiveSession(null);
    setMessages([]);
    setWaitingForTherapist(false);
    setTherapistConnected(false);
    disconnect();
  }, [disconnect]);

  // ========================
  // Utils & therapist fetch
  // ========================
  const formatTime = (ts) =>
    ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fetchAvailableTherapists = useCallback(async (specialty = "") => {
    setLoadingTherapists(true);
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/v1";
      const url = new URL(`${API_BASE}/therapists/available`);
      if (specialty) url.searchParams.append("specialties", specialty);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setAvailableTherapists(data.results || []);
    } catch (err) {
      console.error("Error fetching therapists:", err);
      setAvailableTherapists([]);
    } finally {
      setLoadingTherapists(false);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (showTherapistList) {
      fetchAvailableTherapists();
      interval = setInterval(fetchAvailableTherapists, 30000);
    }
    return () => clearInterval(interval);
  }, [showTherapistList, fetchAvailableTherapists]);

  const isTherapistOnline = useCallback((therapist) => {
    if (!therapist.lastActive) return false;
    const diffMin = (Date.now() - new Date(therapist.lastActive)) / 60000;
    return diffMin <= 2;
  }, []);

  const getTherapistStatus = useCallback(
    (therapist) => {
      if (isTherapistOnline(therapist)) {
        return {
          text: "Online Now",
          color: "bg-green-400",
          textColor: "text-green-600",
        };
      }
      return {
        text: "Currently Offline",
        color: "bg-gray-200",
        textColor: "text-gray-500",
      };
    },
    [isTherapistOnline]
  );

  // ========================
  // Render
  // ========================
  if (activeSession === "text") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md h-[calc(100vh-8rem)] flex flex-col">
            {/* Chat Header */}
            <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 ${
                      therapistConnected
                        ? "bg-green-300"
                        : requestStatus === "sent"
                        ? "bg-yellow-300"
                        : requestStatus === "declined" || requestStatus === "failed"
                        ? "bg-red-300"
                        : "bg-gray-300"
                    } rounded-full mr-2`}
                  ></div>
                  <h1 className="text-lg font-semibold">
                    {selectedTherapist
                      ? `Session with ${selectedTherapist.name}`
                      : "Anonymous Text Session"}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm opacity-75">Session ID: {sessionId}</div>
                  {requestStatus === "sent" && !therapistConnected && (
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
                  : requestStatus === "sent"
                  ? `Waiting for ${
                      selectedTherapist?.name || "therapist"
                    } to accept your request...`
                  : requestStatus === "declined"
                  ? "Session request was declined"
                  : requestStatus === "failed"
                  ? "Session request failed"
                  : "Connecting to therapist • Please wait..."}
              </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.type === "user" || message.senderType === "user"
                      ? "flex justify-end"
                      : ""
                  }`}
                >
                  {message.type === "user" || message.senderType === "user" ? (
                    <div className="bg-indigo-600 text-white rounded-lg p-3 max-w-md shadow-sm">
                      <p className="break-words">{message.content}</p>
                      <p className="text-indigo-200 text-xs mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  ) : message.type === "system" ? (
                    <div className="flex justify-center">
                      <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-lg p-3 max-w-md text-center">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ) : (
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
                            <span className="text-xs text-gray-500 ml-2">
                              Licensed Therapist
                            </span>
                          </div>
                          <p className="text-gray-800 break-words">{message.content}</p>
                          <p className="text-gray-400 text-xs mt-2">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {otherUserTyping && (
                <div className="mb-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm max-w-md border-l-4 border-green-500">
                    <div className="flex items-start">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                        T
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                        <span className="text-gray-500 text-sm ml-2">
                          Therapist is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {waitingForTherapist && !therapistConnected && (
                <div className="flex justify-center">
                  <div
                    className={`border rounded-lg p-4 text-center ${
                      requestStatus === "sent"
                        ? "bg-yellow-50 border-yellow-200"
                        : requestStatus === "declined" || requestStatus === "failed"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    {requestStatus !== "declined" && requestStatus !== "failed" && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    )}
                    <p
                      className={`text-sm ${
                        requestStatus === "sent"
                          ? "text-yellow-700"
                          : requestStatus === "declined" || requestStatus === "failed"
                          ? "text-red-700"
                          : "text-blue-700"
                      }`}
                    >
                      {requestStatus === "sent"
                        ? `Waiting for ${
                            selectedTherapist?.name || "therapist"
                          } to respond to your request...`
                        : requestStatus === "declined"
                        ? "Your session request was declined."
                        : requestStatus === "failed"
                        ? "Session request failed. Please try again."
                        : selectedTherapist
                        ? `Sending request to ${selectedTherapist.name}...`
                        : "Finding available therapist..."}
                    </p>
                    {connectionError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-xs font-medium">
                          Connection Error:
                        </p>
                        <p className="text-red-600 text-xs mt-1">{connectionError}</p>
                      </div>
                    )}
                    {(requestStatus === "declined" || requestStatus === "failed") && (
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
                  placeholder={
                    therapistConnected
                      ? "Type your message..."
                      : "Please wait for therapist to connect..."
                  }
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
                  <span
                    className={`w-2 h-2 ${
                      isConnected && therapistConnected
                        ? "bg-green-400"
                        : isConnected
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    } rounded-full mr-2`}
                  ></span>
                  {isConnected && therapistConnected
                    ? "Encrypted session active"
                    : isConnected
                    ? "Connected - waiting..."
                    : "Connecting..."}
                  {sessionId && <span className="ml-2">• Session: {sessionId}</span>}
                </div>
                <div className="text-right">{inputMessage.length}/1000 characters</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing / selection UI
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Anonymous Session
          </h1>
          <p className="text-xl text-gray-600">
            Choose how you&apos;d like to connect with a licensed therapist
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 mb-8">
          <div className="flex items-start">
            <div className="text-indigo-500 text-xl mr-3">🔒</div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                Complete Privacy Guaranteed
              </h3>
              <p className="text-indigo-700">
                No personal information required. You&apos;ll receive a one-time
                session token that expires after use. All communications are
                end-to-end encrypted and no data is stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Therapist Selection Modal */}
        {showTherapistList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b flex justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Select a Therapist
                </h2>
                <button
                  onClick={() => setShowTherapistList(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Specialty Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Specialty
                  </label>
                  <select
                    value={""}
                    onChange={(e) => {
                      /* you can wire this up to set a specialty filter */
                    }}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Specialties</option>
                    {Object.entries(SPECIALTIES_MAP).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingTherapists ? (
                  <Fragment key="loading-state">
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">
                        Loading available therapists...
                      </p>
                    </div>
                  </Fragment>
                ) : availableTherapists.length === 0 ? (
                  <Fragment key="empty-state">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">😔</div>
                      <p className="text-gray-600 text-lg">
                        No therapists are currently available
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        You can still start a session and we&apos;ll connect you
                        when someone becomes available
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
                      {availableTherapists.map((therapist, index) => {
                        const online = isTherapistOnline(therapist);
                        const status = getTherapistStatus(therapist);
                        return (
                          <div
                            key={therapist._id || therapist.id || index}
                            onClick={() =>
                              online && startSessionRequestWithTherapist(therapist)
                            }
                            className={`border border-gray-200 rounded-lg p-4 ${
                              online
                                ? "hover:border-indigo-500 hover:shadow-md cursor-pointer"
                                : "opacity-50 cursor-not-allowed"
                            } transition-all`}
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
                                      <span
                                        className={`w-2 h-2 ${status.color} rounded-full mr-2`}
                                      ></span>
                                      <span className={status.textColor}>{status.text}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Specialties:</strong>{" "}
                                    {therapist.therapistProfile.specialties
                                      .map((s) => SPECIALTIES_MAP[s] || s)
                                      .join(", ")}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Experience:</strong>{" "}
                                    {therapist.therapistProfile.experience
                                      ?.yearsOfPractice || 0}{" "}
                                    years
                                  </p>
                                  {therapist.therapistProfile.rating?.average > 0 && (
                                    <p className="text-sm text-gray-600">
                                      <strong>Rating:</strong> ⭐{" "}
                                      {therapist.therapistProfile.rating.average.toFixed(
                                        1
                                      )}{" "}
                                      ({therapist.therapistProfile.rating.totalReviews}{" "}
                                      reviews)
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
                                  {therapist.therapistProfile.availability?.sessionTypes?.map(
                                    (type, ti) => (
                                      <span
                                        key={`session-type-${therapist._id}-${
                                          type + ti
                                        }`}
                                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                      >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Anonymous Text Chat
              </h2>
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
                  onClick={() => setShowTherapistList(true)}
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Anonymous Voice Call
              </h2>
              <p className="text-gray-600 mb-6">
                Have a real-time conversation with voice masking technology to
                protect your identity completely.
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
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Crisis Support
              </h3>
              <p className="text-red-700 mb-4">
                If you&apos;re experiencing a mental health emergency, please
                reach out immediately:
              </p>
              <div className="space-y-2 text-red-700">
                <p>
                  • National Suicide Prevention Lifeline: <strong>988</strong>
                </p>
                <p>
                  • Crisis Text Line: Text <strong>HOME</strong> to{" "}
                  <strong>741741</strong>
                </p>
                <p>
                  • Emergency Services: <strong>911</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            How Anonymous Sessions Work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Generate Token</h3>
              <p className="text-gray-600 text-sm">
                Receive a unique, anonymous session token that expires after
                use.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Connect Safely</h3>
              <p className="text-gray-600 text-sm">
                Join an encrypted session with a licensed therapist.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Session Ends</h3>
              <p className="text-gray-600 text-sm">
                All session data is permanently deleted. No trace remains.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
