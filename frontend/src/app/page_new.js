import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            KNS Therapy
          </h1>
          <p className="text-2xl font-medium text-indigo-800 mb-4">
            &ldquo;Healing, not headlines. Anonymity first, always.&rdquo;
          </p>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Anonymous, stigma-free mental health support. Connect with licensed therapists, 
            join peer communities, and access AI-powered support - all without revealing your identity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/anonymous-session"
              className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 transition-colors text-lg font-medium"
            >
              Start Anonymous Session
            </Link>
            <Link 
              href="/chatbot"
              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors text-lg font-medium"
            >
              Talk to AI Support
            </Link>
            <Link 
              href="/community"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md border border-indigo-600 hover:bg-indigo-50 transition-colors text-lg font-medium"
            >
              Join Community
            </Link>
          </div>
        </div>

        {/* Privacy Features */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-indigo-500">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Anonymous Text Chat</h3>
            <p className="text-gray-600">Secure, encrypted messaging with licensed therapists. No personal data required.</p>
            <Link 
              href="/anonymous-session"
              className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
            >
              Start Text Session
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-green-500">
            <div className="text-3xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Anonymous Voice Chat</h3>
            <p className="text-gray-600">Voice calls with pitch-shifting technology to protect your vocal identity.</p>
            <Link 
              href="/anonymous-session"
              className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Start Voice Session
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-purple-500">
            <div className="text-3xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Anonymous Video Chat</h3>
            <p className="text-gray-600">Face-to-face therapy with real-time facial anonymization and voice masking.</p>
            <Link 
              href="/anonymous-session"
              className="inline-block mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
            >
              Start Video Session
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-orange-500">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Support Chat</h3>
            <p className="text-gray-600">24/7 immediate support through our mental health AI companion.</p>
            <Link 
              href="/chatbot"
              className="inline-block mt-4 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
            >
              Talk to AI
            </Link>
          </div>
        </div>

        {/* Privacy Promise */}
        <div className="bg-indigo-900 text-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Our Privacy Promise</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>End-to-end encrypted communications</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>No IP address logging</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Ephemeral session storage</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>No personal metadata collection</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Voice & facial anonymization</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Zero data retention policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Privacy. Your Healing. Your Choice.
          </h2>
          <p className="text-gray-600 mb-6">
            Take the first step towards better mental health without fear of judgment or exposure.
          </p>
          <Link 
            href="/anonymous-session"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Start Your Anonymous Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
