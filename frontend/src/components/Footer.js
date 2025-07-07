import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">KNS Therapy</h3>
            <p className="text-gray-400 text-sm mb-4">
              Anonymous, stigma-free mental health support. Healing without headlines.
            </p>
            <div className="flex items-center text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              <span>Anonymous & Secure</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/anonymous-session" className="hover:text-white transition-colors">
                  Anonymous Sessions
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-white transition-colors">
                  AI Support Chat
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/crisis-resources" className="hover:text-white transition-colors">
                  Crisis Resources
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-white transition-colors">
                  Book Session
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Privacy & Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-gray-500">Terms of Service</span>
              </li>
              <li>
                <span className="text-gray-500">HIPAA Compliance</span>
              </li>
              <li>
                <span className="text-gray-500">Therapist Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center">
                <span className="text-red-300 text-xl mr-3">🚨</span>
                <div>
                  <strong className="text-red-200">Crisis Support:</strong>
                  <span className="text-red-300 ml-2">If you&apos;re in immediate danger, please call emergency services.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <a 
                  href="tel:988" 
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500 transition-colors"
                >
                  Call 988
                </a>
                <Link 
                  href="/crisis-resources"
                  className="bg-red-700 text-red-100 px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Crisis Resources
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2024 KNS Therapy. Committed to your privacy and anonymity.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Zero data retention • End-to-end encryption • Anonymous by design
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span>Secure Connection</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                <span>Licensed Therapists</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
