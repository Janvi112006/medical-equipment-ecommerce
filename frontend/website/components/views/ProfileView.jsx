"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient, { getErrorMessage } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";
import EnableNotifications from "../EnableNotifications";

const emptyAddress = { fullName: "", phone: "", addressLine: "", city: "", state: "", pincode: "" };

const ProfileView = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, addressesRes] = await Promise.all([
        apiClient.get("/auth/profile"),
        apiClient.get("/addresses"),
      ]);
      setProfile(profileRes.data.data);
      setAddresses(addressesRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await apiClient.post("/addresses", form);
      setForm(emptyAddress);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await apiClient.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingState label="Loading your profile..." />;

  return (
    <div className="container section" style={{ maxWidth: 640 }}>
      <div className="section-header">
        <h2>My account</h2>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Account details</h3>
        <div className="detail-grid">
          <div>
            <div className="detail-label">Name</div>
            <div>{profile?.name || user?.name}</div>
          </div>
          <div>
            <div className="detail-label">Email</div>
            <div>{profile?.email || user?.email}</div>
          </div>
          <div>
            <div className="detail-label">Phone</div>
            <div>{profile?.phone || "—"}</div>
          </div>
          <div>
            <div className="detail-label">Member since</div>
            <div>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
  <Link href="/orders" className="btn btn-secondary btn-sm">
    View order history
  </Link>
  <EnableNotifications />
</div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15 }}>Saved addresses</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add address"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddAddress} style={{ marginBottom: 18 }}>
            {formError && <div className="error-banner">{formError}</div>}
            <div className="field-row">
              <div className="field">
                <label>Full name</label>
                <input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Address</label>
              <input required value={form.addressLine} onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="field">
                <label>State</label>
                <input required value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Pincode</label>
              <input required value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save address"}
            </button>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="cell-muted">No saved addresses yet.</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13.5 }}>
              <span>
                <strong>{addr.fullName}</strong> — {addr.addressLine}, {addr.city}, {addr.state} {addr.pincode} · {addr.phone}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(addr._id)} disabled={deletingId === addr._id}>
                {deletingId === addr._id ? "Removing..." : "Remove"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileView;
