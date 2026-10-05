"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GoogleAuthLink from "@/components/auth/GoogleAuthLink";
import GoogleOAuthSetupHint from "@/components/auth/GoogleOAuthSetupHint";
import { oauthErrorMessage } from "@/lib/auth/oauthErrors";

export default function LoginForm({
  justRegistered = false,
  oauthErrorCode,
}: {
  justRegistered?: boolean;
  oauthErrorCode?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const passwordsMatch = password === confirmPassword;
  const showConfirmError = confirmPassword.length > 0 && !passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passwordsMatch) {
      setError("Password confirmation does not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign in failed.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 text-center">
        Welcome back to Euloges
      </h1>
      <p className="text-sm text-gray-500 text-center mt-2">
        Sign in to manage memorials and tributes
      </p>
      <GoogleAuthLink variant="login" />

      {oauthErrorCode === "google_config" && (
        <div className="mt-4">
          <GoogleOAuthSetupHint />
        </div>
      )}
      {oauthErrorCode && oauthErrorCode !== "google_config" && (
        <p
          className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
          role="alert"
        >
          {oauthErrorMessage(oauthErrorCode)}
        </p>
      )}

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {justRegistered && (
          <p className="text-sm text-green-800 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            Account created. Sign in with your email and password.
          </p>
        )}
        {error && (
          <p
            className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
            role="alert"
          >
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        <div>
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="login-password"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-password-field w-full px-4 py-2 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" strokeWidth={2} aria-hidden />
              ) : (
                <Eye className="h-5 w-5" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="login-confirm-password"
          >
            Confirm password
          </label>
          <input
            id="login-confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="auth-password-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
          {showConfirmError && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
          )}
        </div>

        <div className="text-right">
          <a
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Don’t have an account?{" "}
        <a href="/signup" className="text-gray-900 font-medium hover:underline">
          Create one
        </a>
      </p>
    </div>
  );
}
