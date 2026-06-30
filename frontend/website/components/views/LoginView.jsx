"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

const LoginView = () => {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card card-pad">
        <h2 style={{ fontSize: 20, marginBottom: 6 }}>Welcome back</h2>
        <p className="cell-muted" style={{ marginBottom: 20 }}>Log in to your account.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="cell-muted" style={{ marginTop: 18, fontSize: 13 }}>
          Don't have an account?{" "}
          <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} style={{ textDecoration: "underline" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
