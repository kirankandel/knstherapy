export default function AnonymousSession() {
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
              <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors">
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
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors">
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
