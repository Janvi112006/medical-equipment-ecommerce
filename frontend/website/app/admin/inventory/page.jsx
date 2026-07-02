"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("customer_user"));
    if (!user || user.role !== "admin") {
      alert("Access denied! Admins only.");
      router.push("/");
      return;
    }
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await fetch(`${API}/products?limit=50`);
    const data = await res.json();
    setProducts(data.data || []);
  }

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>Inventory Report</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 12 }}>
          <h3>Total Products</h3><h2>{products.length}</h2>
        </div>
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 12 }}>
          <h3>Low Stock</h3><h2>{lowStock.length}</h2>
        </div>
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 12 }}>
          <h3>Inventory Value</h3><h2>₹{inventoryValue}</h2>
        </div>
      </div>

      <h2 style={{ marginTop: 35 }}>Low Stock Products</h2>
      {lowStock.map((p) => (
        <p key={p._id}>⚠️ {p.name} — Stock: {p.stock}</p>
      ))}

      <h2 style={{ marginTop: 35 }}>Out of Stock Products</h2>
      {outOfStock.map((p) => (
        <p key={p._id}>❌ {p.name}</p>
      ))}
    </main>
  );
}