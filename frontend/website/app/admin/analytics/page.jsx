"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    paidOrders: 0,
    pendingOrders: 0,
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

    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      fetch(`${API}/products?limit=100`),
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
      orders: orders.length,
      users: users.length,
      revenue: orders
        .filter((o) => o.payment?.status === "paid")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      paidOrders: orders.filter((o) => o.payment?.status === "paid").length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
    });
  }

  const card = {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "20px",
    background: "#fff",
  };

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>Analytics Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "16px",
          marginTop: "30px",
        }}
      >
        <div style={card}><h3>📦 Products</h3><h2>{stats.products}</h2></div>
        <div style={card}><h3>📋 Orders</h3><h2>{stats.orders}</h2></div>
        <div style={card}><h3>👥 Users</h3><h2>{stats.users}</h2></div>
        <div style={card}><h3>💰 Revenue</h3><h2>₹{stats.revenue}</h2></div>
        <div style={card}><h3>✅ Paid Orders</h3><h2>{stats.paidOrders}</h2></div>
        <div style={card}><h3>⏳ Pending Orders</h3><h2>{stats.pendingOrders}</h2></div>
      </div>
    </main>
  );
}