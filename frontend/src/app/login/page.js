"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const router = useRouter();

  /* ---------------- redirect when logged in ---------------- */
  useEffect(() => {
    if (isAuthenticated) router.push("/therapist-dashboard");
  }, [isAuthenticated, router]);

  /* ---------------- clear error on unmount / change -------- */
  useEffect(() => () => clearError(), [clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      /* handled in context */
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* ---------- title ---------- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-[#172554]">Welcome Back</h1>
        <p className="mt-2 text-sm text-[#475569]">Sign in to your KNS Therapy account</p>
      </div>

      {/* ---------- card ---------- */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-8 shadow rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#334155]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#6172A3] focus:outline-none focus:ring-2 focus:ring-[#6172A3] sm:text-sm"
              />
            </div>

            {/* password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#334155]">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-[#6172A3] focus:outline-none focus:ring-2 focus:ring-[#6172A3] sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {showPassword ? (
                    /* eye-off */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029M9.88 9.88a3 3 0 014.24 4.24M9.88 9.88L8.46 8.46m8.08 8.08L15.54 15.54" />
                    </svg>
                  ) : (
                    /* eye */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5c-5 0-9.27 3.11-10.89 7.5 1.62 4.39 5.89 7.5 10.89 7.5s9.27-3.11 10.89-7.5C21.27 7.61 17 4.5 12 4.5z" />
                      <circle cx="12" cy="12" r="3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* forgot link */}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-[#6172A3] hover:underline">
                Forgot your password?
              </Link>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-[#6172A3] py-2 px-4 text-sm font-medium text-white shadow hover:bg-[#4e5a86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6172A3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="mr-2 h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 014 12z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <p className="relative mx-auto w-max bg-white px-3 text-xs text-gray-500">
                New to KNS Therapy?
              </p>
            </div>

            {/* alt sign-ups */}
            <div className="mt-6 grid gap-3">
              <Link
                href="/signup/community"
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Join Community
              </Link>
              <Link
                href="/signup/therapist"
                className="inline-flex w-full justify-center rounded-md border border-green-300 bg-green-50 py-2 px-4 text-sm font-medium text-green-700 shadow-sm hover:bg-green-100"
              >
                Register as Therapist
              </Link>
            </div>
          </div>

          {/* immediate support */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Need help right now?{" "}
            <Link href="/anonymous-session" className="font-medium text-red-600 hover:underline">
              Start Anonymous Session
            </Link>
          </p>
        </div>
      </div>

      {/* privacy footnote */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-lg border border-[#D4E1F2] bg-[#eef3fb] p-4 text-sm text-[#334155]">
          <p className="flex items-start gap-2">
            <svg className="h-5 w-5 text-[#6172A3]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-1h1.5v-1.5h-1.5V17zm0-3h1.5v-6h-1.5v6z"
                clipRule="evenodd"
              />
            </svg>
            Your privacy is protected — all communications are encrypted. We never store unnecessary personal data.
          </p>
        </div>
      </div>
    </div>
  );
}
