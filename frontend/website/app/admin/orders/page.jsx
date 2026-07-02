"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("customer_token")
      : null;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("customer_user"));

    if (!user || user.role !== "admin") {
      alert("Access denied! Admins only.");
      router.push("/");
      return;
    }

    loadOrders();
  }, []);

  async function loadOrders() {
    const res = await fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.success) {
      setOrders(data.data);
    }
  }

  async function updateStatus(orderId, status) {
    const res = await fetch(`${API}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Status update failed");
      return;
    }

    setMessage("Order status updated");
    loadOrders();
  }
async function updateTracking(orderId, provider, trackingId, status) {
  const res = await fetch(`${API}/orders/${orderId}/tracking`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      provider,
      trackingId,
      status,
      trackingUrl: "",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data.message || "Tracking update failed");
    return;
  }

  setMessage("Tracking updated");
  loadOrders();
}
function exportOrdersCSV() {
  const rows = orders.map((order) => ({
    OrderID: order._id,
    Customer: order.user?.name || "Unknown",
    Email: order.user?.email || "",
    Total: order.totalAmount,
    Payment: order.payment?.status,
    Status: order.status,
    CreatedAt: new Date(order.createdAt).toLocaleString(),
  }));

  const csv =
    "OrderID,Customer,Email,Total,Payment,Status,CreatedAt\n" +
    rows
      .map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();

  window.URL.revokeObjectURL(url);
}

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>Admin Orders</h1>
<button onClick={exportOrdersCSV} style={{ marginTop: "12px" }}>
  Export Orders CSV
</button>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <div style={{ marginTop: "30px" }}>
        {orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "15px",
            }}
          >
            <h3>Order #{order._id.slice(-6)}</h3>

            <p><strong>Customer:</strong> {order.user?.name || "Unknown"}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            <p><strong>Payment:</strong> {order.payment?.status}</p>
            <p><strong>Status:</strong> {order.status}</p>
<div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
  <input
    placeholder="Courier Provider e.g. BlueDart"
    defaultValue={order.tracking?.provider || ""}
    id={`provider-${order._id}`}
  />

  <input
    placeholder="Tracking ID e.g. BD123456789"
    defaultValue={order.tracking?.trackingId || ""}
    id={`tracking-${order._id}`}
  />

  <select
    defaultValue={order.tracking?.status || "not_shipped"}
    id={`trackingStatus-${order._id}`}
  >
    <option value="not_shipped">Not Shipped</option>
    <option value="in_transit">In Transit</option>
    <option value="delivered">Delivered</option>
  </select>

  <button
    onClick={() =>
      updateTracking(
        order._id,
        document.getElementById(`provider-${order._id}`).value,
        document.getElementById(`tracking-${order._id}`).value,
        document.getElementById(`trackingStatus-${order._id}`).value
      )
    }
  >
    Update Tracking
  </button>
</div>

            <select
              defaultValue={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </main>
  );
}