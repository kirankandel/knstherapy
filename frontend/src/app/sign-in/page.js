export default function AnonymousSignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Anonymous Access
            </h1>
            <p className="text-gray-600 text-sm">
              Generate your secure, one-time session token
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <span className="text-green-500 text-xl mr-3">🔒</span>
              <div>
                <h3 className="text-green-800 font-semibold text-sm">Complete Anonymity</h3>
                <p className="text-green-700 text-xs mt-1 leading-relaxed">
                  No name, email, or phone number required. Your token expires after use.
                </p>
              </div>
            </div>
          </div>

          {/* Token Generation */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Session Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>General Therapy Session</option>
                <option>Crisis Support</option>
                <option>Community Forum Access</option>
                <option>AI Support Chat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Communication
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "text", label: "Text Chat" },
                  { value: "voice", label: "Voice Call" },
                  { value: "video", label: "Video Call" },
                  { value: "ai", label: "AI Support" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="communication"
                      value={option.value}
                      className="mr-2"
                      defaultChecked={option.value === "text"}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium">
              Generate Anonymous Session
            </button>
          </div>

          {/* Session Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-700">
            <h4 className="font-semibold mb-2">Session Details:</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Session expires in 24 hours</li>
              <li>End-to-end encrypted communication</li>
              <li>No data stored after session ends</li>
              <li>Therapist cannot identify you</li>
            </ul>
          </div>

          {/* Crisis Notice (Nepal localized) */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-sm">
            <div className="flex items-start">
              <span className="text-red-500 text-lg mr-3">🚨</span>
              <div>
                <p className="text-red-700 font-semibold mb-1">In Crisis?</p>
                <p className="text-red-600 text-xs leading-snug">
                  If you&apos;re in Nepal and need immediate help, please call <strong>1660-01-50016</strong> (TUTH Crisis Helpline) or{" "}
                  <a href="/crisis-resources" className="underline hover:text-red-500">
                    view crisis resources
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
