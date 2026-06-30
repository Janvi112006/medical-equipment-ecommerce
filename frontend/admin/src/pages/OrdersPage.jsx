import { useEffect, useState, useCallback } from "react";
import apiClient, { getErrorMessage } from "../api/axiosClient";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import OrderDetailsModal from "../components/OrderDetailsModal";

const STATUS_FILTERS = ["", "pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/orders", { params: { status: status || undefined, page, limit: 10 } });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-fetch the single order so the modal shows fresh data after an update
  const openOrder = async (orderId) => {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      setSelectedOrder(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdated = async () => {
    await openOrder(selectedOrder._id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <div className="page-subtitle">View and manage every order placed on the platform.</div>
        </div>
      </div>

      <div className="toolbar">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="card">
        {loading ? (
          <LoadingState label="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found" message="Orders placed by customers will show up here." />
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
                {orders.map((order) => (
                  <tr key={order._id} className="clickable" onClick={() => openOrder(order._id)}>
                    <td className="cell-muted">#{order._id.slice(-6)}</td>
                    <td>
                      {order.user?.name || "—"}
                      <div className="cell-muted" style={{ fontSize: 12 }}>
                        {order.user?.email}
                      </div>
                    </td>
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

      <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
};

export default OrdersPage;
