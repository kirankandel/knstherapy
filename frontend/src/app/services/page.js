export default function Services() {
  const services = [
    {
      title: "Individual Therapy",
      description: "One-on-one sessions tailored to your specific needs and goals.",
      duration: "50 minutes",
      features: ["Personalized treatment plans", "Evidence-based approaches", "Flexible scheduling"]
    },
    {
      title: "Couples Therapy",
      description: "Strengthen your relationship through improved communication and understanding.",
      duration: "60 minutes",
      features: ["Relationship assessment", "Communication skills", "Conflict resolution"]
    },
    {
      title: "Group Therapy",
      description: "Connect with others facing similar challenges in a supportive environment.",
      duration: "90 minutes",
      features: ["Peer support", "Shared experiences", "Cost-effective option"]
    },
    {
      title: "Anxiety & Depression",
      description: "Specialized treatment for anxiety disorders and depression.",
      duration: "50 minutes",
      features: ["CBT techniques", "Mindfulness practices", "Coping strategies"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">Comprehensive mental health support tailored to your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">{service.title}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="mb-4">
                <span className="text-sm font-medium text-blue-600">Duration: {service.duration}</span>
              </div>
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Book Consultation
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Not Sure Which Service Is Right for You?</h2>
          <p className="text-gray-600 mb-6">Schedule a free 15-minute consultation to discuss your needs.</p>
          <button className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
            Free Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
