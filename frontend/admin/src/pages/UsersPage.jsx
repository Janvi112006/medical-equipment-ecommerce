import { useEffect, useState, useCallback } from "react";
import apiClient, { getErrorMessage } from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleTarget, setRoleTarget] = useState(null); // { user, newRole }
  const [savingRole, setSavingRole] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/users", { params: { search: search || undefined, page, limit: 10 } });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async () => {
    setSavingRole(true);
    try {
      await apiClient.patch(`/users/${roleTarget.user._id}/role`, { role: roleTarget.newRole });
      setRoleTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setRoleTarget(null);
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <div className="page-subtitle">View registered customers and admins, and manage roles.</div>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="card">
        {loading ? (
          <LoadingState label="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td className="cell-muted">{u.phone || "—"}</td>
                      <td>
                        <StatusBadge value={u.role} />
                      </td>
                      <td className="cell-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {isSelf ? (
                          <span className="cell-muted" style={{ fontSize: 12 }}>
                            (you)
                          </span>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() =>
                              setRoleTarget({ user: u, newRole: u.role === "admin" ? "customer" : "admin" })
                            }
                          >
                            {u.role === "admin" ? "Make customer" : "Make admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />

      {roleTarget && (
        <ConfirmDialog
          title="Change role"
          message={`Change ${roleTarget.user.name}'s role to "${roleTarget.newRole}"?`}
          confirmLabel="Confirm"
          loading={savingRole}
          onConfirm={handleRoleChange}
          onCancel={() => setRoleTarget(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
