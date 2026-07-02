"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminProductsPage() {
const router = useRouter();
  const [products, setProducts] = useState([]);
const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    images: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
const token =
  typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  async function loadProducts() {
    const res = await fetch(`${API}/products?limit=50`);
    const data = await res.json();
    setProducts(data.data || []);
  }

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("customer_user"));

  if (!user || user.role !== "admin") {
    alert("Access denied! Admins only.");
    router.push("/");
    return;
  }

  loadProducts();
}, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const body = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images ? [form.images] : [],
    };

    const url = editingId ? `${API}/products/${editingId}` : `${API}/products`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Something went wrong");
      return;
    }

    setMessage(editingId ? "Product updated" : "Product added");
    setForm({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      images: "",
    });
    setEditingId(null);
    loadProducts();
  }

  function editProduct(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      images: product.images?.[0] || "",
    });
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    const res = await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Delete failed");
      return;
    }

    setMessage("Product deleted");
    loadProducts();
  }

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>Admin Products</h1>
      <p>Add, edit, delete and manage medical equipment products.</p>
<input
  type="text"
  placeholder="Search products..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    margin: "20px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  }}
/>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
        <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} required />
        <input name="stock" placeholder="Stock" type="number" value={form.stock} onChange={handleChange} required />
        <input name="images" placeholder="/products/bp-monitor.jpg" value={form.images} onChange={handleChange} />
{form.images && (
  <div style={{ marginTop: "10px" }}>
    <p>Image Preview</p>
    <img
      src={form.images}
      alt="Preview"
      style={{
        width: "150px",
        height: "150px",
        objectFit: "contain",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    />
  </div>
)}
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />

        <button type="submit">
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>All Products</h2>

      <div style={{ display: "grid", gap: "16px" }}>
       {products
  .filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>₹{product.price} | Stock: {product.stock}</p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button onClick={() => editProduct(product)}>Edit</button>
              <button onClick={() => deleteProduct(product._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}