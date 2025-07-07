import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#6172A3] text-white"> {/* Deep Blue */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">KNS Therapy</h3>
            <p className="text-[#D4E1F2] text-sm mb-4"> {/* Soft Sky Blue */}
              Anonymous, stigma-free mental health support. Healing without headlines.
            </p>
            <div className="flex items-center text-[#739794] text-sm"> {/* Muted Teal */}
              <span className="w-2 h-2 bg-[#739794] rounded-full mr-2"></span>
              <span>Anonymous & Secure</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-[#D4E1F2] text-sm"> {/* Soft Sky Blue */}
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
            <ul className="space-y-2 text-[#D4E1F2] text-sm">
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
            <ul className="space-y-2 text-[#D4E1F2] text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li><span className="text-[#C8DCD6]">Terms of Service</span></li> {/* Gentle Mint */}
              <li><span className="text-[#C8DCD6]">HIPAA Compliance</span></li>
              <li><span className="text-[#C8DCD6]">Therapist Guidelines</span></li>
            </ul>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="border-t border-[#D4E1F2] pt-8 mt-8">
          <div className="bg-[#F2E3D5] text-[#6172A3] border border-[#D4E1F2] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center">
                <span className="text-xl mr-3">🚨</span>
                <div>
                  <strong>Crisis Support:</strong>
                  <span className="ml-2">If you&apos;re in immediate danger, please call emergency services.</span>
                </div>
              </div>
  <div className="flex gap-3">
                <a 
                  href="tel:988" 
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500 transition-colors"
                >
                  Call 100
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
        <div className="border-t border-[#D4E1F2] pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-[#D4E1F2] text-sm">
                © 2025 KNS Therapy. Committed to your privacy and anonymity.
              </p>
              <p className="text-[#C8DCD6] text-xs mt-1">
                Zero data retention • End-to-end encryption • Anonymous by design
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs text-[#C8DCD6]">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-[#739794] rounded-full mr-2"></span>
                <span>Secure Connection</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-[#F2E3D5] rounded-full mr-2"></span>
                <span>Licensed Therapists</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
