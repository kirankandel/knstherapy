export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About KNS Therapy</h1>
          <p className="text-xl text-gray-600">&ldquo;Healing, not headlines. Anonymity first, always.&rdquo;</p>
        </div>
        
        {/* Mission */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            KNS Therapy exists to remove barriers to mental health care by offering secure, 
            anonymous access to licensed therapists, AI-powered support, and peer-led community forums. 
            We believe that privacy concerns should never prevent someone from seeking help.
          </p>
          <p className="text-gray-600 leading-relaxed">
            In a world where digital privacy is increasingly rare, we&apos;ve built a platform 
            where your mental health journey remains completely your own - no names, no tracking, 
            no permanent records.
          </p>
        </div>

        {/* Privacy Technology */}
        <div className="bg-indigo-50 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Privacy-First Technology</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-indigo-700 mb-2">Anonymous Sessions</h3>
              <p className="text-indigo-600 text-sm mb-4">
                One-time session tokens that expire after use. No personal data collection ever.
              </p>
              
              <h3 className="font-semibold text-indigo-700 mb-2">End-to-End Encryption</h3>
              <p className="text-indigo-600 text-sm mb-4">
                All communications are encrypted using WebCrypto standards before leaving your device.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-700 mb-2">Voice Masking</h3>
              <p className="text-indigo-600 text-sm mb-4">
                Advanced pitch-shifting technology protects your voice identity during calls.
              </p>
              
              <h3 className="font-semibold text-indigo-700 mb-2">Zero Data Retention</h3>
              <p className="text-indigo-600 text-sm mb-4">
                Ephemeral storage means your conversations disappear when sessions end.
              </p>
            </div>
          </div>
        </div>

        {/* Professional Standards */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Professional Standards</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">✓</span>
              <div>
                <strong>Licensed Therapists Only:</strong> All human therapists are licensed professionals 
                with specialized training in digital mental health delivery.
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">✓</span>
              <div>
                <strong>Crisis Response Protocol:</strong> Our AI system can detect crisis language 
                and immediately connect users to human professionals.
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">✓</span>
              <div>
                <strong>Evidence-Based Approaches:</strong> We use proven therapeutic methods including 
                CBT, DBT, and mindfulness-based interventions.
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">✓</span>
              <div>
                <strong>Continuous Monitoring:</strong> Quality assurance without compromising anonymity 
                through anonymous feedback systems.
              </div>
            </div>
          </div>
        </div>

        {/* Why Anonymity Matters */}
        <div className="bg-gray-900 text-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Why Anonymity Matters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Removes Stigma</h3>
              <p className="text-gray-400 text-sm">
                Mental health stigma prevents millions from seeking help. 
                Anonymous access eliminates this barrier entirely.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Protects Careers</h3>
              <p className="text-gray-400 text-sm">
                No risk of mental health records affecting employment, 
                insurance, or professional licensing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Enables Honesty</h3>
              <p className="text-gray-400 text-sm">
                True anonymity allows for complete honesty about 
                sensitive topics without fear of judgment.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Immediate Access</h3>
              <p className="text-gray-400 text-sm">
                No lengthy intake forms or insurance verification. 
                Get help when you need it most.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
