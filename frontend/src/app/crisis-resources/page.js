export default function CrisisResources() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Crisis Resources
            </h1>
            <p className="text-xl text-gray-600">
              Immediate help is available. You are not alone.
            </p>
          </div>

          {/* Emergency Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🚨</span>
              <h2 className="text-xl font-semibold text-red-800">
                If you are in immediate danger
              </h2>
            </div>
            <p className="text-red-700 mb-4">
              Please contact emergency services immediately or go to your nearest emergency room.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="tel:911" 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Call 911 (US)
              </a>
              <a 
                href="tel:112" 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Call 112 (EU)
              </a>
            </div>
          </div>

          {/* Crisis Hotlines */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              24/7 Crisis Hotlines
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  🇺🇸 United States
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-blue-700">988 Suicide & Crisis Lifeline</strong>
                    <p className="text-blue-600 text-sm">Call or text 988</p>
                    <p className="text-blue-600 text-sm">Available 24/7, free and confidential</p>
                  </div>
                  <div>
                    <strong className="text-blue-700">Crisis Text Line</strong>
                    <p className="text-blue-600 text-sm">Text HOME to 741741</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🇨🇦 Canada
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-green-700">Talk Suicide Canada</strong>
                    <p className="text-green-600 text-sm">1-833-456-4566</p>
                    <p className="text-green-600 text-sm">24/7 bilingual support</p>
                  </div>
                  <div>
                    <strong className="text-green-700">Kids Help Phone</strong>
                    <p className="text-green-600 text-sm">1-800-668-6868</p>
                    <p className="text-green-600 text-sm">Text CONNECT to 686868</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  🇬🇧 United Kingdom
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-purple-700">Samaritans</strong>
                    <p className="text-purple-600 text-sm">116 123</p>
                    <p className="text-purple-600 text-sm">Free 24/7 support</p>
                  </div>
                  <div>
                    <strong className="text-purple-700">SHOUT Crisis Text</strong>
                    <p className="text-purple-600 text-sm">Text SHOUT to 85258</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  🇦🇺 Australia
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-orange-700">Lifeline</strong>
                    <p className="text-orange-600 text-sm">13 11 14</p>
                    <p className="text-orange-600 text-sm">24/7 crisis support</p>
                  </div>
                  <div>
                    <strong className="text-orange-700">Beyond Blue</strong>
                    <p className="text-orange-600 text-sm">1300 22 4636</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Specialized Support */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Specialized Support
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-pink-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-pink-800 mb-3">
                  🏳️‍🌈 LGBTQ+ Support
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong className="text-pink-700">The Trevor Project</strong>
                    <p className="text-pink-600">1-866-488-7386</p>
                    <p className="text-pink-600">Crisis support for LGBTQ+ youth</p>
                  </div>
                  <div>
                    <strong className="text-pink-700">Trans Lifeline</strong>
                    <p className="text-pink-600">877-565-8860</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                  👥 Domestic Violence
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong className="text-indigo-700">National DV Hotline</strong>
                    <p className="text-indigo-600">1-800-799-7233</p>
                    <p className="text-indigo-600">24/7 confidential support</p>
                  </div>
                  <div>
                    <strong className="text-indigo-700">Text START</strong>
                    <p className="text-indigo-600">to 88788</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  🍷 Substance Abuse
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong className="text-yellow-700">SAMHSA Helpline</strong>
                    <p className="text-yellow-600">1-800-662-4357</p>
                    <p className="text-yellow-600">24/7 treatment referrals</p>
                  </div>
                  <div>
                    <strong className="text-yellow-700">Crisis Text Line</strong>
                    <p className="text-yellow-600">Text HOME to 741741</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Online Resources */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Online Support Communities
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Anonymous Forums
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• 7 Cups - Free emotional support</li>
                  <li>• Crisis Text Line online chat</li>
                  <li>• Reddit r/SuicideWatch (moderated)</li>
                  <li>• NAMI Support Groups (local chapters)</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Self-Help Resources
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Mindfulness and meditation apps</li>
                  <li>• Crisis safety planning worksheets</li>
                  <li>• Breathing and grounding techniques</li>
                  <li>• Emergency contact list templates</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Immediate Coping Strategies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Immediate Coping Strategies
            </h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Right Now, Try This:</h3>
                  <ul className="space-y-2 text-green-700 text-sm">
                    <li>• Take 5 deep, slow breaths</li>
                    <li>• Name 5 things you can see</li>
                    <li>• Call a trusted friend or family member</li>
                    <li>• Go to a safe, public space</li>
                    <li>• Listen to calming music</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Grounding Technique (5-4-3-2-1):</h3>
                  <ul className="space-y-2 text-green-700 text-sm">
                    <li>• 5 things you can see</li>
                    <li>• 4 things you can touch</li>
                    <li>• 3 things you can hear</li>
                    <li>• 2 things you can smell</li>
                    <li>• 1 thing you can taste</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Reminder */}
          <div className="bg-indigo-100 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">
              Remember: This feeling is temporary
            </h3>
            <p className="text-indigo-700 mb-4">
              Crisis feelings are intense but they do pass. Professional help is available, 
              and your life has value. Take it one moment at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/anonymous-session" 
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Connect with a Therapist Now
              </a>
              <a 
                href="/chatbot" 
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Talk to AI Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
