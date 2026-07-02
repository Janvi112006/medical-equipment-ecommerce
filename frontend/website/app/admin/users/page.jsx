"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
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

    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.success) {
      setUsers(data.data);
    }
  }

  async function updateRole(userId, role) {
    const res = await fetch(`${API}/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Role update failed");
      return;
    }

    setMessage("User role updated");
    loadUsers();
  }

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>Admin Users</h1>
      <p>View users and manage roles.</p>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <div style={{ marginTop: "30px", display: "grid", gap: "15px" }}>
        {users.map((user) => (
          <div
            key={user._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "18px",
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p>Role: {user.role}</p>
            </div>

            <select
              defaultValue={user.role}
              onChange={(e) => updateRole(user._id, e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </main>
  );
}