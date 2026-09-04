"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin, isSessionValid } from "@/app/lib/api";

const DEFAULT_USER = "admin";
const DEFAULT_PASSWORD = "admin123";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState(DEFAULT_USER);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSessionValid()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginAdmin(username.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername(DEFAULT_USER);
    setPassword(DEFAULT_PASSWORD);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src="/appixo-logo-full.png"
            alt="Appixo Technologies"
            className="auth-logo-img"
          />
          <h1>Admin Console</h1>
          <p>Sign in to access live enquiries and analytics.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username or Email
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or admin@appixo.com"
              required
              disabled={isLoading}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </label>

          {error ? (
            <div style={{ color: "#ef4444", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", padding: "10px 14px", borderRadius: 10, fontSize: "0.88rem" }}>
              ⚠️ {error}
            </div>
          ) : null}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18 }} />
                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <div className="demo-box" onClick={handleFillDemo} style={{ cursor: "pointer" }} title="Click to fill demo credentials">
          <span>Demo Credentials</span>
          <strong>admin / admin123</strong>
        </div>
      </div>
    </div>
  );
}
