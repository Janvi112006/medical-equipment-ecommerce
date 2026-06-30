import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient, { getErrorMessage } from "../api/axiosClient";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import StatusBadge from "../components/StatusBadge";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ products: null, orders: null, users: null });
  const [recentOrders, setRecentOrders] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");

    // Use allSettled so one failing call doesn't blank the whole dashboard —
    // whatever succeeds still renders.
    const [productsRes, ordersRes, usersRes, recentRes] = await Promise.allSettled([
      apiClient.get("/products", { params: { limit: 1 } }),
      apiClient.get("/orders", { params: { limit: 1 } }),
      apiClient.get("/users", { params: { limit: 1 } }),
      apiClient.get("/orders", { params: { limit: 5 } }),
    ]);

    setStats({
      products: productsRes.status === "fulfilled" ? productsRes.value.data.pagination.total : null,
      orders: ordersRes.status === "fulfilled" ? ordersRes.value.data.pagination.total : null,
      users: usersRes.status === "fulfilled" ? usersRes.value.data.pagination.total : null,
    });

    if (recentRes.status === "fulfilled") {
      setRecentOrders(recentRes.value.data.data);
    }

    const failed = [productsRes, ordersRes, usersRes, recentRes].find((r) => r.status === "rejected");
    if (failed) {
      setError(getErrorMessage(failed.reason));
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div>
      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="stat-grid">
        <div className="card card-pad stat-card">
          <span className="stat-card-label">Products</span>
          <span className="stat-card-value">{stats.products ?? "—"}</span>
        </div>
        <div className="card card-pad stat-card">
          <span className="stat-card-label">Orders</span>
          <span className="stat-card-value">{stats.orders ?? "—"}</span>
        </div>
        <div className="card card-pad stat-card">
          <span className="stat-card-label">Users</span>
          <span className="stat-card-value">{stats.users ?? "—"}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-pad" style={{ borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15 }}>Recent orders</h2>
          <Link to="/orders" className="btn btn-secondary btn-sm">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="state-block">No orders yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="cell-muted">#{order._id.slice(-6)}</td>
                    <td>{order.user?.name || order.user?.email || "—"}</td>
                    <td>₹{order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <StatusBadge value={order.status} />
                    </td>
                    <td>
                      <StatusBadge value={order.payment?.status} />
                    </td>
                    <td className="cell-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ color: "var(--color-text-faint)", fontSize: 12, marginTop: 16 }}>
        Note: revenue totals aren't shown yet — that needs a dedicated reporting endpoint, which isn't part of this
        phase. See the Known Issues section of the Phase 8 documentation.
      </p>
    </div>
  );
};

export default DashboardPage;
