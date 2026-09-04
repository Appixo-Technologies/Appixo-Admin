"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginAdmin, isSessionValid } from "@/app/lib/api";

const MAX_FAILED_ATTEMPTS = 3;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    if (isSessionValid()) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Handle brute-force cooldown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lockoutTimer > 0) return;

    setError("");
    setIsLoading(true);

    try {
      await loginAdmin(username.trim(), password);
      setFailedAttempts(0);
      router.push("/dashboard");
    } catch (err: unknown) {
      const newFailCount = failedAttempts + 1;
      setFailedAttempts(newFailCount);

      if (newFailCount >= MAX_FAILED_ATTEMPTS) {
        setLockoutTimer(15);
        setError("Too many failed attempts. Login locked for 15 seconds to prevent brute-force.");
      } else {
        const message = err instanceof Error ? err.message : "Invalid credentials. Please check and try again.";
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-wrapper">
              <Image
                src="/appixo-logo-full.png"
                alt="Appixo Technologies"
                width={240}
                height={50}
                priority
                style={{ width: "auto", height: "auto" }}
                className="auth-logo-img"
              />
            </div>
            <div className="auth-badge">ADMIN CONSOLE</div>
            <h1>Secure Portal Sign In</h1>
            <p>Enter your administrative credentials to access live leads and system insights.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group">
              <label htmlFor="admin-username">Username or Email</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="admin-username"
                  name="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  disabled={isLoading || lockoutTimer > 0}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="admin-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="admin-password"
                  name="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading || lockoutTimer > 0}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-meta">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember session</span>
              </label>
              <span className="security-tag">🔒 256-Bit SSL</span>
            </div>

            {error ? (
              <div className="auth-error-alert" role="alert">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="primary-button login-btn"
              disabled={isLoading || lockoutTimer > 0}
            >
              {lockoutTimer > 0 ? (
                `Locked (${lockoutTimer}s)`
              ) : isLoading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="auth-footer">
          <p>© {new Date().getFullYear()} Appixo Technologies. All rights reserved.</p>
          <div className="footer-links">
            <a href="https://appixotech.com" target="_blank" rel="noreferrer">
              Official Site ↗
            </a>
            <span className="dot">•</span>
            <span className="system-status">
              <span className="status-dot green" /> Systems Operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
