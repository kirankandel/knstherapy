export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Intro */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#6172A3] mb-4">
            About KNS Therapy
          </h1>
          <p className="text-xl text-[#739794] italic">
            “Healing, not headlines. Anonymity first, always.”
          </p>
        </div>

        {/* Mission */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-semibold text-[#171717] mb-4">Our Mission</h2>
          <p className="text-[#444] leading-relaxed mb-4">
            KNS Therapy exists to remove barriers to mental health care by offering secure, anonymous access to licensed therapists, AI-powered support, and peer-led community forums.
            We believe that privacy concerns should never prevent someone from seeking help.
          </p>
          <p className="text-[#444] leading-relaxed">
            In a world where digital privacy is increasingly rare, we’ve built a platform where your mental health journey remains completely your own — no names, no tracking, no permanent records.
          </p>
        </section>

        {/* Privacy-First Tech */}
        <section className="bg-[#D4E1F2] rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-semibold text-[#3B4C80] mb-6">Privacy-First Technology</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#3B4C80] mb-1">Anonymous Sessions</h3>
              <p className="text-[#3B4C80] text-sm mb-4">
                One-time session tokens that expire after use. No personal data collection ever.
              </p>

              <h3 className="font-semibold text-[#3B4C80] mb-1">End-to-End Encryption</h3>
              <p className="text-[#3B4C80] text-sm">
                All communications are encrypted using WebCrypto standards before leaving your device.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#3B4C80] mb-1">Voice Masking</h3>
              <p className="text-[#3B4C80] text-sm mb-4">
                Advanced pitch-shifting technology protects your voice identity during calls.
              </p>

              <h3 className="font-semibold text-[#3B4C80] mb-1">Zero Data Retention</h3>
              <p className="text-[#3B4C80] text-sm">
                Ephemeral storage means your conversations disappear when sessions end.
              </p>
            </div>
          </div>
        </section>

        {/* Professional Standards */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-semibold text-[#171717] mb-4">Professional Standards</h2>
          <div className="space-y-5 text-[#444]">
            {[
              {
                title: "Licensed Therapists Only",
                desc: "All human therapists are licensed professionals with specialized training in digital mental health delivery.",
              },
              {
                title: "Crisis Response Protocol",
                desc: "Our AI system can detect crisis language and immediately connect users to human professionals.",
              },
              {
                title: "Evidence-Based Approaches",
                desc: "We use proven therapeutic methods including CBT, DBT, and mindfulness-based interventions.",
              },
              {
                title: "Continuous Monitoring",
                desc: "Quality assurance without compromising anonymity through anonymous feedback systems.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <div>
                  <strong>{item.title}:</strong> {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Anonymity Matters */}
        <section className="bg-[#171717] text-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6">Why Anonymity Matters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Removes Stigma",
                desc: "Mental health stigma prevents millions from seeking help. Anonymous access eliminates this barrier entirely.",
              },
              {
                title: "Protects Careers",
                desc: "No risk of mental health records affecting employment, insurance, or professional licensing.",
              },
              {
                title: "Enables Honesty",
                desc: "True anonymity allows for complete honesty about sensitive topics without fear of judgment.",
              },
              {
                title: "Immediate Access",
                desc: "No lengthy intake forms or insurance verification. Get help when you need it most.",
              },
            ].map((item, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
