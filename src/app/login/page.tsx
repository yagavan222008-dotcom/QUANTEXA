"use client";

import { FormEvent, useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();

  const { theme, setTheme } =
    useTheme();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    /*
     * FRONTEND AUTH FOR NOW
     *
     * This will be replaced with the FastAPI
     * authentication endpoint later.
     */

    window.setTimeout(() => {
      localStorage.setItem(
        "quantexa-session",
        "authenticated"
      );

      document.cookie =
        "quantexa-session=authenticated; path=/; max-age=86400";

      if (
        !localStorage.getItem(
          "quantexa-profile"
        )
      ) {
        localStorage.setItem(
          "quantexa-profile",
          JSON.stringify({
            name: "Researcher",
            role: "Quant Analyst",
            email,
          })
        );
      }

      router.push("/");
    }, 700);
  }

  return (
    <main className="login-page">

      <div className="login-background-glow" />

      <div className="login-container">

        {/* BRAND */}

        <div className="login-brand">

          <div className="login-brand-mark">
            Q
          </div>

          <div>
            <strong>
              QUANTEXA
            </strong>

            <span>
              QUANT RESEARCH
            </span>
          </div>

        </div>

        {/* CARD */}

        <section className="login-card">

          <div className="login-card-header">

            <div className="login-icon">
              <ShieldCheck size={24} />
            </div>

            <span className="login-eyebrow">
              RESEARCH WORKSPACE
            </span>

            <h1>
              Welcome back
            </h1>

            <p>
              Sign in to continue to your
              QuantExa research environment.
            </p>

          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-field">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="login-input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="researcher@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>

          <div className="login-divider">
            <span />
            <small>
              QUANTEXA RESEARCH PLATFORM
            </small>
            <span />
          </div>

          {/* THEME */}

          <div className="login-theme">

            <span>
              Appearance
            </span>

            <div className="login-theme-buttons">

              <button
                type="button"
                className={
                  theme === "light"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setTheme("light")
                }
              >
                <Sun size={16} />
                Light
              </button>

              <button
                type="button"
                className={
                  theme === "dark"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setTheme("dark")
                }
              >
                <Moon size={16} />
                Dark
              </button>

            </div>

          </div>

        </section>

        <p className="login-footer">
          QuantExa Quantitative Research Platform
          <span>•</span>
          Secure Research Environment
        </p>

      </div>

    </main>
  );
}