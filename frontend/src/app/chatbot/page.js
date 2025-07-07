export default function Chatbot() {
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
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {/* Welcome Message */}
            <div className="mb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm max-w-md">
                <div className="flex items-start">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                    AI
                  </div>
                  <div>
                    <p className="text-gray-800">
                      Hello! I&apos;m your anonymous AI mental health support companion. 
                      You can share anything with me - I&apos;m here to listen and help. 
                      Your privacy is completely protected.
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      How are you feeling today?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample conversation */}
            <div className="space-y-4">
              {/* User message example */}
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white rounded-lg p-3 max-w-md">
                  <p>I&apos;ve been feeling really anxious lately...</p>
                </div>
              </div>

              {/* AI response example */}
              <div className="mb-4">
                <div className="bg-white rounded-lg p-4 shadow-sm max-w-md">
                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                      AI
                    </div>
                    <div>
                      <p className="text-gray-800">
                        I understand that anxiety can feel overwhelming. Thank you for sharing that with me. 
                        Can you tell me more about what might be triggering these feelings?
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        Remember, everything you share here is completely anonymous and secure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4 rounded-b-lg">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type your message here... (completely anonymous)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Send
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Session encrypted • No data stored
              </div>
              <button className="text-red-600 hover:text-red-700">
                🆘 Connect to Human Therapist
              </button>
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
