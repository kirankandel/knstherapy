export default function AnonymousSignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Anonymous Access
            </h1>
            <p className="text-gray-600">
              Generate your secure, one-time session token
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-green-500 text-xl mr-3">🔒</span>
              <div>
                <h3 className="text-green-800 font-semibold text-sm">Complete Anonymity</h3>
                <p className="text-green-700 text-xs mt-1">
                  No email, name, or personal information required. Your session token expires automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Token Generation */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Session Type
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
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
                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="communication" value="text" className="mr-2" defaultChecked />
                  <span className="text-sm">Text Chat</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="communication" value="voice" className="mr-2" />
                  <span className="text-sm">Voice Call</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="communication" value="video" className="mr-2" />
                  <span className="text-sm">Video Call</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="communication" value="ai" className="mr-2" />
                  <span className="text-sm">AI Support</span>
                </label>
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium">
              Generate Anonymous Session
            </button>
          </div>

          {/* Session Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Session Details:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Session expires in 24 hours</li>
              <li>• All communications encrypted end-to-end</li>
              <li>• No data retained after session ends</li>
              <li>• Therapist cannot identify you</li>
            </ul>
          </div>

          {/* Crisis Notice */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">🚨</span>
              <div>
                <p className="text-red-700 text-sm font-medium">In Crisis?</p>
                <p className="text-red-600 text-xs">
                  For immediate help, call 988 or{" "}
                  <a href="/crisis-resources" className="underline">view crisis resources</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
