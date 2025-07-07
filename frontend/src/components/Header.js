import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            KNS Therapy
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link href="/anonymous-session" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Anonymous Sessions
            </Link>
            <Link href="/chatbot" className="text-gray-600 hover:text-indigo-600 transition-colors">
              AI Support
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Community
            </Link>
            <Link href="/crisis-resources" className="text-red-600 hover:text-red-700 transition-colors font-medium">
              Crisis Resources
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Anonymous & Secure
            </div>
            <Link 
              href="/anonymous-session"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Get Help Now
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t py-3">
          <div className="flex justify-around text-sm">
            <Link href="/about" className="text-gray-600">About</Link>
            <Link href="/anonymous-session" className="text-gray-600">Sessions</Link>
            <Link href="/chatbot" className="text-gray-600">AI Support</Link>
            <Link href="/community" className="text-gray-600">Community</Link>
            <Link href="/crisis-resources" className="text-red-600 font-medium">Crisis</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
