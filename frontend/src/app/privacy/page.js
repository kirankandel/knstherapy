export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
            Privacy Policy
          </h1>

          <div className="space-y-12">
            {/* Anonymity Commitment */}
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-indigo-800 mb-2">
                Our Commitment to Anonymity
              </h2>
              <p className="text-indigo-700 text-sm leading-relaxed">
                KNS Therapy operates on a zero-knowledge principle. We cannot identify you 
                because we never collect identifying information in the first place.
              </p>
            </div>

            {/* What We Don't Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                What We DON&apos;T Collect
              </h2>
              <ul className="space-y-2 text-gray-600 text-sm">
                {[
                  "Names, emails, or any personal identifiers",
                  "IP addresses or location data",
                  "Browser fingerprints or tracking cookies",
                  "Payment information (we accept anonymous payments only)",
                  "Session recordings or permanent conversation logs",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* How Sessions Work */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                How Sessions Work
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ol className="space-y-4 text-gray-700 text-sm">
                  {[
                    "You generate a one-time session token through our secure system",
                    "All communications are end-to-end encrypted in real-time",
                    "Session data exists only in temporary memory during your session",
                    "All data is permanently deleted when your session ends",
                  ].map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* Technical Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Technical Security Measures
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Encryption",
                    desc: "AES-256 encryption with perfect forward secrecy ensures your conversations cannot be decrypted even if our servers are compromised.",
                    color: "green",
                  },
                  {
                    title: "Zero-Knowledge Architecture",
                    desc: "Our servers process encrypted data without ever having access to the decryption keys or plaintext content.",
                    color: "blue",
                  },
                  {
                    title: "Ephemeral Storage",
                    desc: "No persistent storage means your data cannot be recovered, subpoenaed, or leaked from our systems.",
                    color: "purple",
                  },
                  {
                    title: "Anonymous Routing",
                    desc: "Traffic routing through multiple encrypted layers prevents correlation of sessions to individual users.",
                    color: "orange",
                  },
                ].map((item, i) => (
                  <div key={i} className={`bg-${item.color}-50 p-4 rounded-lg`}>
                    <h3 className={`font-semibold text-${item.color}-800 mb-2`}>{item.title}</h3>
                    <p className={`text-${item.color}-700 text-sm`}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Therapist Training */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Therapist Privacy Training
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                All our licensed therapists undergo specialized training on:
              </p>
              <ul className="ml-4 list-disc text-sm text-gray-600 space-y-2">
                <li>Anonymous therapy techniques and best practices</li>
                <li>Digital privacy and security protocols</li>
                <li>Crisis intervention without identity disclosure</li>
                <li>Professional boundaries in anonymous settings</li>
              </ul>
            </section>

            {/* Legal Compliance */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Legal Compliance</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-sm text-yellow-800">
                <strong>Important:</strong> While we maintain complete anonymity, we comply with 
                legal requirements for mandatory reporting in cases of imminent danger. Our therapists 
                will work with you to ensure safety while preserving your privacy to the fullest extent possible.
              </div>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
              <p className="text-gray-600 text-sm mb-4">
                Because we don&apos;t collect personal data, traditional privacy rights like 
                &ldquo;right to be forgotten&rdquo; are automatically fulfilled. However, you always have the right to:
              </p>
              <ul className="ml-4 list-disc text-sm text-gray-600 space-y-2">
                <li>End any session immediately without explanation</li>
                <li>Request a new therapist match at any time</li>
                <li>Access crisis resources and emergency contacts</li>
                <li>Report concerns about therapist conduct anonymously</li>
              </ul>
            </section>

            {/* Contact CTA */}
            <div className="bg-indigo-100 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                Questions About Our Privacy Practices?
              </h3>
              <p className="text-indigo-700 mb-4 text-sm">
                Contact our privacy team through our secure, anonymous feedback system.
              </p>
              <a
                href="/contact"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
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
