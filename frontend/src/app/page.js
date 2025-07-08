"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import Section from "@/components/ui/Section.jsx";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect therapists to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.userType === "therapist") {
      router.push("/therapist-dashboard");
    }
  }, [isAuthenticated, user, router]);
  return (
    <>
      <Head>
        <title>Anonymous Mental Health Support | KNS Therapy</title>
        <meta
          name="description"
          content="Truly anonymous therapy. No tracking, no judgment—just healing."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 rounded px-4 py-2 text-white shadow-md transition-all duration-200"
        style={{ backgroundColor: "#6172A3" }}
      >
        Skip to main content
      </a>

      <div className="min-h-screen font-inter text-[1.125rem]/[1.6] antialiased">
        <main
          id="main"
          className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth"
          style={{
            background: "linear-gradient(to bottom right, #6172A3, #C8DCD6, #F2E3D5)",
          }}
        >
          {/* ---------- HERO ---------- */}
          <Section id="hero" as="header">
            <div className="text-center text-white">
              <h1 className="mx-auto mb-6 max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Confidential Therapy that Respects Your Privacy
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">
                Connect with caring professionals <em>without</em> revealing
                your identity—anonymous sessions, AI-guided tools, and a
                judgment-free peer community. Because healing should feel&nbsp;safe.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  href="#contact"
                  variant="primary"
                  className="text-white"
                  style={{ backgroundColor: "#C8DCD6" }}
                >
                  Book a Free Consult
                </Button>
                <Button
                  href="/anonymous-session"
                  variant="secondary"
                  className="text-[#6172A3]"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #D4E1F2" }}
                >
                  Start Anonymous Session
                </Button>
                <Button
                  href="/chatbot"
                  variant="outline"
                  className="border"
                  style={{ borderColor: "#6172A3", color: "#6172A3" }}
                >
                  Talk to AI Support
                </Button>
              </div>
            </div>
          </Section>

          {/* ---------- ABOUT ---------- */}
          <Section id="about" title="Why Choose KNS Therapy?" className="bg-[#F2E3D5] text-center">
            <div className="prose mx-auto text-[#6172A3]">
              <p>
                Stigma keeps too many people from seeking mental-health care.
                We remove every traceable identifier—IP addresses, voice prints,
                facial features, even metadata—so you can focus on feeling
                better, not hiding better.
              </p>
            </div>
          </Section>

          {/* ---------- SERVICES ---------- */}
          <Section id="services" title="Services" className="bg-[#D4E1F2]">
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" role="list">
              {[
                {
                  icon: "💬",
                  title: "Text Chat",
                  blurb:
                    "End-to-end encrypted messaging with licensed therapists—no personal data required.",
                  color: "#6172A3",
                  href: "/anonymous-session",
                },
                {
                  icon: "🎙️",
                  title: "Voice Chat",
                  blurb:
                    "Pitch-shifting tech keeps your vocal identity private during real-time voice calls.",
                  color: "#C8DCD6",
                  href: "/anonymous-session",
                },
                {
                  icon: "📹",
                  title: "Video Chat",
                  blurb:
                    "Live facial anonymization + voice masking for the most private face-to-face therapy.",
                  color: "#739794",
                  href: "/anonymous-session",
                },
                {
                  icon: "🤖",
                  title: "AI Support",
                  blurb:
                    "24/7 instant, judgment-free guidance from our CBT-trained AI companion.",
                  color: "#F2E3D5",
                  href: "/chatbot",
                },
              ].map(({ icon, title, blurb, color, href }) => (
                <li key={title} className="flex">
                  <Card
                    as="article"
                    className="group flex flex-col text-center bg-white/80 backdrop-blur-sm transition-all hover:shadow-md"
                    style={{ borderLeft: `4px solid ${color}` }}
                  >
                    <span
                      role="img"
                      aria-label={title}
                      className="mb-4 text-4xl sm:text-5xl transition-transform duration-300 group-hover:scale-110"
                    >
                      {icon}
                    </span>
                    <h3 className="mb-2 text-xl font-semibold text-[#6172A3]">
                      {title}
                    </h3>
                    <p className="mb-6 text-[#739794]">{blurb}</p>
                    <Button
                      href={href}
                      className="mt-auto self-center text-sm text-white"
                      style={{ backgroundColor: "#6172A3" }}
                    >
                      {title === "AI Support" ? "Talk to AI" : `Start ${title}`}
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </Section>

          {/* ---------- FAQ ---------- */}
          <Section id="faq" title="Frequently Asked Questions" className="bg-[#F2E3D5]">
            <div className="mx-auto max-w-3xl space-y-4">
              {[
                {
                  q: "How anonymous is anonymous?",
                  a: "We scrub IPs, use ephemeral storage, and employ end-to-end encryption. Neither therapists nor staff can see identifying data.",
                },
                {
                  q: "Are your therapists licensed?",
                  a: "Yes. Every therapist is verified and holds valid licensure in at least one jurisdiction.",
                },
                {
                  q: "Can I switch therapists?",
                  a: "Absolutely. Your healing, your choice—switch any time from your dashboard.",
                },
              ].map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-md bg-white/90 p-4 shadow-sm transition-all duration-300"
                >
                  <summary className="cursor-pointer font-medium text-[#6172A3] group-open:text-[#739794]">
                    {q}
                  </summary>
                  <p className="mt-2 text-[#739794]">{a}</p>
                </details>
              ))}
            </div>
          </Section>

          {/* ---------- CONTACT / CTA ---------- */}
          <Section
            id="contact"
            className="text-center text-white"
            style={{ backgroundColor: "#6172A3" }}
          >
            <div>
              <h2 className="mb-4 text-3xl sm:text-4xl font-semibold">
                Ready to Start Healing Anonymously?
              </h2>
              <p className="mx-auto mb-8 max-w-xl">
                Your first 30-minute consult is free—and always private.
              </p>
              <Button
                href="/anonymous-session"
                className="bg-white text-[#6172A3] hover:opacity-90"
              >
                Start Your Anonymous Journey
              </Button>
            </div>
          </Section>
        </main>
      </div>
    </>
  );
}
