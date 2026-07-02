"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function OtpLoginPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const result = await sendOtp(email);

    if (result.success) {
      setOtpSent(true);
      setMessage("OTP sent successfully. Please check your email.");
    } else {
      setError(result.message);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const result = await verifyOtp(email, otp);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.message);
    }
  }

  return (
    <main className="container section" style={{ maxWidth: 480 }}>
      <div className="card card-pad">
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Login with OTP</h2>
        <p className="cell-muted" style={{ marginBottom: 20 }}>
          Enter your registered email to receive a one-time password.
        </p>

        {message && <div className="success-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
              />
            </div>

            <button className="btn btn-primary btn-block" type="submit">
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="field">
              <label>OTP</label>
              <input
                type="text"
                required
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
              />
            </div>

            <button className="btn btn-primary btn-block" type="submit">
  Verify OTP & Login
</button>

<button
  type="button"
  className="btn btn-outline btn-block"
  style={{ marginTop: 10 }}
  onClick={async () => {
    setError("");
    setMessage("");
    const result = await sendOtp(email);

    if (result.success) {
      setMessage("A new OTP has been sent to your email.");
    } else {
      setError(result.message);
    }
  }}
>
  Resend OTP
</button>

<button
  type="button"
  className="btn btn-outline btn-block"
  style={{ marginTop: 10 }}
  onClick={() => {
    setOtpSent(false);
    setOtp("");
    setMessage("");
    setError("");
  }}
>
  Change Email
</button>
          </form>
        )}

        <p className="cell-muted" style={{ marginTop: 18, fontSize: 13 }}>
          Prefer password login?{" "}
          <Link href="/login" style={{ textDecoration: "underline" }}>
            Login with password
          </Link>
        </p>
      </div>
    </main>
  );
}