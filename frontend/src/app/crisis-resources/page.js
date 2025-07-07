"use client";

import Link from 'next/link';

export default function CrisisResources() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Crisis Resources
            </h1>
            <p className="text-lg text-gray-600">
              Immediate help is available. You are not alone.
            </p>
          </div>

          {/* Emergency Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">🚨</span>
              <h2 className="text-xl font-semibold text-red-800">
                If you are in immediate danger
              </h2>
            </div>
            <p className="text-red-700 mb-4">
              Please contact emergency services or go to the nearest hospital.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:100"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                Call 100 (Police Ambulance)
              </a>
            </div>
          </div>

          {/* Crisis Helplines */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Crisis Helplines
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  National Suicide Prevention
                </h3>
                <p className="text-gray-700 mb-2">
                  1166 – Available 24/7 via all networks 
                </p>
                <p className="text-gray-600 text-sm">
                  Government-supported, round-the-clock counseling.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Mental Health Helpline
                </h3>
                <p className="text-gray-700 mb-2">
                  1660‑010‑2005 – 8 AM to 8 PM daily 
                </p>
                <p className="text-gray-600 text-sm">
                  Confidential counseling for anxiety, depression & stress.
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  TPO Nepal Crisis Line
                </h3>
                <p className="text-gray-700 mb-2">
                  +977‑98473‑86158 or 1660‑010‑2005 
                </p>
                <p className="text-gray-600 text-sm">
                  Trained counselors for emotional & mental distress.
                </p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Patan Hospital Hotline
                </h3>
                <p className="text-gray-700 mb-2">
                  98134‑76123 
                </p>
                <p className="text-gray-600 text-sm">
                  Suicide prevention & mental health support.
                </p>
              </div>
            </div>
          </section>

          {/* Specialized Support */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Specialized & Local Support
            </h2>
            <div className="space-y-4">
              <div className="bg-pink-50 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-pink-800 mb-2">
                  Child & Adolescent Support
                </h3>
                <p className="text-gray-700 text-sm">
                  Kanti Children’s Hospital Hotline: 98085‑22410 
                </p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-indigo-800 mb-2">
                  University Teaching Hospital (Maharajgunj)
                </h3>
                <p className="text-gray-700 text-sm">
                  Psychiatry Help Line: 98416‑30430 <br />
                  Suicide Prevention: 98400‑21600
                </p>
              </div>
            </div>
          </section>

          {/* Mental Health Clinics */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Local Mental Health Clinics
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Patan Mental Hospital, Lagankhel – Home of 1166 helpline 
              </li>
              <li>
                Primary Health Care & Resource Centre (Chapagaun, Lalitpur) – Integrated mental health services
              </li>
            </ul>
          </section>

          {/* Coping Strategies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Immediate Coping Strategies
            </h2>
            <div className="bg-green-50 p-6 rounded-lg shadow-sm">
              <ul className="grid md:grid-cols-2 gap-4 text-green-700 text-sm">
                <li>• Take 5 deep, slow breaths</li>
                <li>• Name 5 things you can see</li>
                <li>• Call someone you trust</li>
                <li>• Go to a safe, public place</li>
                <li>• Listen to calming music</li>
                <li>• Grounding: 5‑4‑3‑2‑1 technique</li>
              </ul>
            </div>
          </section>

          {/* Reminder */}
          <div className="bg-indigo-100 p-6 rounded-lg text-center shadow-sm">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">
              You Matter. Help Is Here.
            </h3>
            <p className="text-indigo-700 mb-4">
              These feelings are temporary. Reach out—there are people ready to support you in Nepal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/anonymous-session"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Connect with Therapist
              </Link>
              <Link
                href="/chatbot"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Talk to AI Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
