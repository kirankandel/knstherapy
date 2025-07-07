"use client";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Ready to start your journey? We’re here to help you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6172A3]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6172A3]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6172A3]"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                  Service of Interest
                </label>
                <select
                  id="service"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6172A3]"
                >
                  <option value="">Select a service</option>
                  <option value="individual">Individual Therapy</option>
                  <option value="couples">Couples Therapy</option>
                  <option value="group">Group Therapy</option>
                  <option value="consultation">Free Consultation</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6172A3]"
                  placeholder="Let us know how we can support you..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#6172A3] text-white py-3 px-4 rounded-md hover:bg-[#4e5a86] transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
              <div className="space-y-5 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#6172A3] text-white rounded-full text-base">
                    📧
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">info@knstherapy.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#6172A3] text-white rounded-full text-base">
                    📞
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#6172A3] text-white rounded-full text-base">
                    📍
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600 leading-relaxed">
                      123 Wellness Street<br />
                      Suite 200<br />
                      Your City, State 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Office Hours</h2>
              <div className="text-gray-700 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Monday – Thursday:</span>
                  <span>9:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday:</span>
                  <span>9:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM – 3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
