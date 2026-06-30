"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient, { getErrorMessage } from "../../lib/apiClient";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";
import EmptyState from "../EmptyState";
import Pagination from "../Pagination";
import StatusBadge from "../StatusBadge";

const OrdersView = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/orders/my", { params: { page, limit: 10 } });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading your orders..." />;

  return (
    <div className="container section">
      <div className="section-header">
        <h2>My orders</h2>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="When you place an order, it'll show up here."
          action={
            <Link href="/products" className="btn btn-primary" style={{ marginTop: 8 }}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="clickable" onClick={() => router.push(`/orders/${order._id}`)}>
                    <td className="cell-muted">#{order._id.slice(-6)}</td>
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
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
    </div>
  );
};

export default OrdersView;
