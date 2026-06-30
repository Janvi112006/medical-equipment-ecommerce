"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient, { getErrorMessage } from "../../lib/apiClient";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";
import ProductCard from "../ProductCard";

const HomeView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        apiClient.get("/products/categories"),
        apiClient.get("/products", { params: { sort: "newest", limit: 8 } }),
      ]);
      setCategories(categoriesRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Quality medical equipment, delivered with care.</h1>
        <p>
          Certified diagnostic devices, mobility aids, and home healthcare essentials — sourced responsibly and
          shipped fast.
        </p>
        <Link href="/products" className="btn btn-primary">
          Shop now
        </Link>
      </section>

      <div className="container">
        {error && (
          <div className="section">
            <ErrorBanner message={error} onRetry={load} />
          </div>
        )}

        {loading ? (
          <LoadingState label="Loading the storefront..." />
        ) : (
          <>
            {categories.length > 0 && (
              <section className="section">
                <div className="section-header">
                  <h2>Shop by category</h2>
                </div>
                <div className="category-chip-row">
                  {categories.map((c) => (
                    <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="category-chip">
                      {c}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="section">
              <div className="section-header">
                <h2>Newest arrivals</h2>
                <Link href="/products" className="btn btn-secondary btn-sm">
                  View all products
                </Link>
              </div>
              {products.length === 0 ? (
                <p className="cell-muted">No products available yet.</p>
              ) : (
                <div className="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default HomeView;
