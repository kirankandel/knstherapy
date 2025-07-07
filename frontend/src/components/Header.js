"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#6172A3" }}
          >
            KNS Therapy
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium">
            {navLinks.map(({ href, label, alert }) => (
              <Link
                key={label}
                href={href}
                className={`transition-colors duration-200 ${
                  alert
                    ? "text-[#DC2626] hover:text-[#b91c1c]"
                    : "text-[#171717] hover:text-[#6172A3]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="hidden lg:flex items-center text-sm text-[#739794]">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Anonymous & Secure
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#171717]">
                  {user?.userType === "therapist"
                    ? `Dr. ${user.name}`
                    : user?.username || user?.name}
                </span>
                {user?.userType === "therapist" && (
                  <Link
                    href="/therapist-dashboard"
                    className="px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
                    style={{
                      backgroundColor: "#D4E1F2",
                      color: "#6172A3",
                    }}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium shadow-sm transition hover:opacity-90"
                  style={{
                    backgroundColor: "#F2E3D5",
                    color: "#171717",
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium transition shadow-sm hover:opacity-90"
                  style={{
                    backgroundColor: "#F2E3D5",
                    color: "#171717",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/anonymous-session"
                  className="px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition"
                  style={{
                    backgroundColor: "#6172A3",
                    color: "#ffffff",
                  }}
                >
                  Get Help Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-2xl text-[#6172A3] focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-4 shadow-sm">
          {navLinks.map(({ href, label, alert }) => (
            <Link
              key={label}
              href={href}
              className={`block text-base font-medium ${
                alert
                  ? "text-[#DC2626] hover:text-[#b91c1c]"
                  : "text-[#171717] hover:text-[#6172A3]"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="mt-4 space-y-3 border-t pt-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm text-[#171717]">
                  Signed in as{" "}
                  <strong>
                    {user?.userType === "therapist"
                      ? `Dr. ${user.name}`
                      : user?.username || user?.name}
                  </strong>
                </div>
                {user?.userType === "therapist" && (
                  <Link
                    href="/therapist-dashboard"
                    className="block px-4 py-2 rounded-md text-sm font-medium shadow-sm bg-[#D4E1F2] text-[#6172A3]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 rounded-md text-sm font-medium bg-[#F2E3D5] text-[#171717] hover:opacity-90"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 rounded-md text-sm font-medium bg-[#F2E3D5] text-[#171717]"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/anonymous-session"
                  className="block px-4 py-2 rounded-md text-sm font-medium bg-[#6172A3] text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Help Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/anonymous-session", label: "Anonymous Sessions" },
  { href: "/chatbot", label: "AI Support" },
  { href: "/community", label: "Community" },
  { href: "/crisis-resources", label: "Crisis Resources", alert: true },
];
