export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 mb-8">
              <h2 className="text-xl font-semibold text-indigo-800 mb-2">
                Our Commitment to Anonymity
              </h2>
              <p className="text-indigo-700">
                KNS Therapy operates on a zero-knowledge principle. We cannot identify you 
                because we never collect identifying information in the first place.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                What We DON&apos;T Collect
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Names, emails, or any personal identifiers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>IP addresses or location data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Browser fingerprints or tracking cookies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Payment information (we accept anonymous payments only)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Session recordings or permanent conversation logs</span>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                How Sessions Work
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                    <span>You generate a one-time session token through our secure system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                    <span>All communications are end-to-end encrypted in real-time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                    <span>Session data exists only in temporary memory during your session</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                    <span>All data is permanently deleted when your session ends</span>
                  </li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Technical Security Measures
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Encryption</h3>
                  <p className="text-green-700 text-sm">
                    AES-256 encryption with perfect forward secrecy ensures your conversations 
                    cannot be decrypted even if our servers are compromised.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Zero-Knowledge Architecture</h3>
                  <p className="text-blue-700 text-sm">
                    Our servers process encrypted data without ever having access to 
                    the decryption keys or plaintext content.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Ephemeral Storage</h3>
                  <p className="text-purple-700 text-sm">
                    No persistent storage means your data cannot be recovered, 
                    subpoenaed, or leaked from our systems.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Anonymous Routing</h3>
                  <p className="text-orange-700 text-sm">
                    Traffic routing through multiple encrypted layers prevents 
                    correlation of sessions to individual users.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Therapist Privacy Training
              </h2>
              <p className="text-gray-600 mb-4">
                All our licensed therapists undergo specialized training on:
              </p>
              <ul className="space-y-2 text-gray-600 ml-4">
                <li>• Anonymous therapy techniques and best practices</li>
                <li>• Digital privacy and security protocols</li>
                <li>• Crisis intervention without identity disclosure</li>
                <li>• Professional boundaries in anonymous settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Legal Compliance
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>Important:</strong> While we maintain complete anonymity, we comply with 
                  legal requirements for mandatory reporting in cases of imminent danger. Our therapists 
                  will work with you to ensure safety while preserving your privacy to the fullest extent possible.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Rights
              </h2>
              <p className="text-gray-600 mb-4">
                Because we don&apos;t collect personal data, traditional privacy rights like &ldquo;right to be forgotten&rdquo; 
                are automatically fulfilled. However, you always have the right to:
              </p>
              <ul className="space-y-2 text-gray-600 ml-4">
                <li>• End any session immediately without explanation</li>
                <li>• Request a new therapist match at any time</li>
                <li>• Access crisis resources and emergency contacts</li>
                <li>• Report concerns about therapist conduct anonymously</li>
              </ul>
            </section>

            <div className="bg-indigo-100 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                Questions About Our Privacy Practices?
              </h3>
              <p className="text-indigo-700 mb-4">
                Contact our privacy team through our secure, anonymous feedback system.
              </p>
              <a 
                href="/contact" 
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Anonymous Contact Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
