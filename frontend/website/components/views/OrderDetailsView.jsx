"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient, { getErrorMessage } from "../../lib/apiClient";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";
import StatusBadge from "../StatusBadge";

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load the payment widget."));
    document.body.appendChild(script);
  });

const OrderDetailsView = ({ id }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePayNow = async () => {
    setPaying(true);
    setPayError("");
    try {
      const createRes = await apiClient.post("/payments/create-order", { orderId: order._id });
      const { razorpayOrderId, amount, currency, key } = createRes.data.data;
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "MedEquip",
        description: `Order #${order._id.slice(-6)}`,
        handler: async (response) => {
          try {
            await apiClient.post("/payments/verify", {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            load();
          } catch (err) {
            setPayError(getErrorMessage(err));
          }
        },
        modal: {
          ondismiss: () => {
            apiClient.post("/payments/failure", { orderId: order._id, reason: "Checkout widget closed" }).catch(() => {});
          },
        },
        theme: { color: "#0f766e" },
      });
      rzp.open();
    } catch (err) {
      setPayError(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingState label="Loading order..." />;
  if (error) return <div className="container section"><ErrorBanner message={error} onRetry={load} /></div>;
  if (!order) return null;

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <Link href="/orders" className="cell-muted" style={{ fontSize: 13 }}>
        ← Back to my orders
      </Link>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <div className="detail-grid">
          <div>
            <div className="detail-label">Order</div>
            <div>#{order._id.slice(-6)}</div>
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

        {order.payment?.status !== "paid" && (
          <>
            {payError && <ErrorBanner message={payError} />}
            <button className="btn btn-primary" onClick={handlePayNow} disabled={paying} style={{ marginBottom: 18 }}>
              {paying ? "Opening payment window..." : `Pay ₹${order.totalAmount?.toFixed(2)} now`}
            </button>
          </>
        )}

        <div className="section-header" style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 15 }}>Items</h3>
        </div>
        <div className="table-wrap" style={{ marginBottom: 18 }}>
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
        <div style={{ textAlign: "right", fontSize: 13.5, marginBottom: 18 }}>
          <div>Subtotal: ₹{order.subtotal?.toFixed(2)}</div>
          <div>Tax: ₹{order.tax?.toFixed(2)}</div>
          <div style={{ fontWeight: 700 }}>Total: ₹{order.totalAmount?.toFixed(2)}</div>
        </div>

        <div className="detail-label">Shipping address</div>
        <p style={{ marginTop: 4, marginBottom: 18, fontSize: 13.5 }}>
          {order.shippingAddress?.fullName}, {order.shippingAddress?.addressLine}, {order.shippingAddress?.city},{" "}
          {order.shippingAddress?.state} - {order.shippingAddress?.pincode} · {order.shippingAddress?.phone}
        </p>

        {order.tracking?.trackingId && (
          <>
            <div className="detail-label">Tracking</div>
            <p style={{ marginTop: 4, marginBottom: 18, fontSize: 13.5 }}>
              {order.tracking.provider} · {order.tracking.trackingId} · <StatusBadge value={order.tracking.status} />
            </p>
          </>
        )}

        <hr className="divider" />

        <div className="section-header" style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 15 }}>Order timeline</h3>
        </div>
        <div className="timeline">
          {[...(order.history || [])].reverse().map((entry, idx) => (
            <div className="timeline-item" key={idx}>
              <div className="timeline-dot" />
              <div>
                <div>
                  <StatusBadge value={entry.status} /> {entry.note}
                </div>
                <div className="timeline-meta">{new Date(entry.changedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsView;
