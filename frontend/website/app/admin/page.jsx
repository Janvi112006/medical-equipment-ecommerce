"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    outOfStock: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

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

    loadStats();
  }, []);

  async function loadStats() {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      fetch(`${API}/products?limit=50`),
      fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const productsData = await productsRes.json();
    const ordersData = await ordersRes.json();
    const usersData = await usersRes.json();

    const products = productsData.data || [];
    const orders = ordersData.data || ordersData.orders || [];
    const users = usersData.data || usersData.users || [];

    setStats({
      products: products.length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
      outOfStock: products.filter((p) => p.stock <= 0).length,
      orders: orders.length,
      users: users.length,
      revenue: orders
        .filter((o) => o.payment?.status === "paid")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    });
  }

  const card = {
    border: "1px solid #ddd",
    borderRadius: "14px",
    padding: "22px",
    background: "#fff",
    textDecoration: "none",
    color: "#111",
  };

  return (
    <main style={{ padding: "40px", maxWidth: "1150px", margin: "0 auto" }}>
      <h1>Admin Dashboard</h1>
      <p>Manage products, orders, users, inventory, and analytics.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "16px",
          marginTop: "30px",
        }}
      >
        <div style={card}><h3>📦 Products</h3><h2>{stats.products}</h2></div>
        <div style={card}><h3>📋 Orders</h3><h2>{stats.orders}</h2></div>
        <div style={card}><h3>👥 Users</h3><h2>{stats.users}</h2></div>
        <div style={card}><h3>💰 Revenue</h3><h2>₹{stats.revenue}</h2></div>
        <div style={card}><h3>⚠️ Low Stock</h3><h2>{stats.lowStock}</h2></div>
        <div style={card}><h3>❌ Out of Stock</h3><h2>{stats.outOfStock}</h2></div>
      </div>

      <h2 style={{ marginTop: "40px" }}>Quick Actions</h2>

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        <Link href="/admin/products" style={card}>📦 Manage Products</Link>
        <Link href="/admin/orders" style={card}>📋 Manage Orders</Link>
        <Link href="/admin/users" style={card}>👥 Manage Users</Link>
        <Link href="/admin/inventory" style={card}>📊 Inventory Report</Link>
        <Link href="/admin/analytics" style={card}>📈 Analytics</Link>
      </div>
    </main>
  );
}