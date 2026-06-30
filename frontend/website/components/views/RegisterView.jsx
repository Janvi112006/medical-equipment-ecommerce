"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

const RegisterView = () => {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await register(form);
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
        <h2 style={{ fontSize: 20, marginBottom: 6 }}>Create your account</h2>
        <p className="cell-muted" style={{ marginBottom: 20 }}>It only takes a minute.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required autoFocus value={form.name} onChange={handleChange("name")} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={handleChange("email")} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone (optional)</label>
            <input id="phone" value={form.phone} onChange={handleChange("phone")} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} value={form.password} onChange={handleChange("password")} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="cell-muted" style={{ marginTop: 18, fontSize: 13 }}>
          Already have an account?{" "}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} style={{ textDecoration: "underline" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
