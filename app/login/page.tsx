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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-mark large">A</div>
          <h1>Admin Login</h1>
          <p>Sign in to manage enquiries and live dashboard insights.</p>
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
              placeholder="admin123"
              required
              disabled={isLoading}
            />
          </label>

          {error ? <p className="error-message">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="demo-box">
          <span>Live Demo Credentials</span>
          <strong>admin / admin123</strong>
        </div>
      </div>
    </div>
  );
}
