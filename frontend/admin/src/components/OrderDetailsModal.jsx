import { useState } from "react";
import apiClient, { getErrorMessage } from "../api/axiosClient";
import StatusBadge from "../components/StatusBadge";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"];

const OrderDetailsModal = ({ order, onClose, onUpdated }) => {
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [provider, setProvider] = useState(order.tracking?.provider || "");
  const [trackingId, setTrackingId] = useState(order.tracking?.trackingId || "");
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    setStatusError("");
    try {
      await apiClient.patch(`/orders/${order._id}/status`, { status, note: note || undefined });
      onUpdated();
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setSavingStatus(false);
    }
  };

  const handleTrackingUpdate = async (e) => {
    e.preventDefault();
    setSavingTracking(true);
    setTrackingError("");
    try {
      await apiClient.patch(`/orders/${order._id}/tracking`, { provider, trackingId });
      onUpdated();
    } catch (err) {
      setTrackingError(getErrorMessage(err));
    } finally {
      setSavingTracking(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order #{order._id.slice(-6)}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div>
              <div className="detail-label">Customer</div>
              <div>{order.user?.name || "—"}</div>
              <div className="cell-muted">{order.user?.email}</div>
            </div>
            <div>
              <div className="detail-label">Placed</div>
              <div>{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="detail-label">Status</div>
              <StatusBadge value={order.status} />
            </div>
            <div>
              <div className="detail-label">Payment</div>
              <StatusBadge value={order.payment?.status} />
            </div>
          </div>

          <div className="section-title">Items</div>
          <div className="table-wrap" style={{ marginBottom: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price?.toFixed(2)}</td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, marginBottom: 16 }}>
            <div>Subtotal: ₹{order.subtotal?.toFixed(2)}</div>
            <div>Tax: ₹{order.tax?.toFixed(2)}</div>
            <div style={{ fontWeight: 700 }}>Total: ₹{order.totalAmount?.toFixed(2)}</div>
          </div>

          <div className="detail-label">Shipping address</div>
          <p style={{ marginTop: 4, marginBottom: 16, fontSize: 13 }}>
            {order.shippingAddress?.fullName}, {order.shippingAddress?.addressLine}, {order.shippingAddress?.city},{" "}
            {order.shippingAddress?.state} - {order.shippingAddress?.pincode} · {order.shippingAddress?.phone}
          </p>

          <hr className="divider" />

          <div className="section-title">Update status</div>
          {statusError && <div className="error-banner">{statusError}</div>}
          <form onSubmit={handleStatusUpdate} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="field" style={{ marginBottom: 0, flex: "1 1 160px" }}>
              <label htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0, flex: "2 1 220px" }}>
              <label htmlFor="note">Note (optional)</label>
              <input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Packed and ready" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingStatus}>
              {savingStatus ? "Saving..." : "Update status"}
            </button>
          </form>

          <hr className="divider" />

          <div className="section-title">Tracking (placeholder service)</div>
          {trackingError && <div className="error-banner">{trackingError}</div>}
          <form onSubmit={handleTrackingUpdate} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="field" style={{ marginBottom: 0, flex: "1 1 160px" }}>
              <label htmlFor="provider">Provider</label>
              <input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Shiprocket" />
            </div>
            <div className="field" style={{ marginBottom: 0, flex: "1 1 160px" }}>
              <label htmlFor="trackingId">Tracking ID</label>
              <input id="trackingId" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-secondary" disabled={savingTracking}>
              {savingTracking ? "Saving..." : "Save tracking"}
            </button>
          </form>
          {order.tracking?.status && (
            <div style={{ marginTop: 8 }}>
              Current tracking status: <StatusBadge value={order.tracking.status} />
            </div>
          )}

          <hr className="divider" />

          <div className="section-title">Timeline</div>
          <div className="timeline">
            {[...(order.history || [])].reverse().map((entry, idx) => (
              <div className="timeline-item" key={idx}>
                <div className="timeline-dot" />
                <div>
                  <div className="timeline-content">
                    <StatusBadge value={entry.status} /> {entry.note}
                  </div>
                  <div className="timeline-meta">{new Date(entry.changedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
