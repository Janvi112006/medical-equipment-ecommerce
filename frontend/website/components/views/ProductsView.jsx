"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient, { getErrorMessage } from "../../lib/apiClient";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";
import EmptyState from "../EmptyState";
import Pagination from "../Pagination";
import ProductCard from "../ProductCard";

const ProductsView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pushes a new query string, always resetting to page 1 unless explicitly told otherwise
  const updateParams = useCallback(
    (updates, { resetPage = true } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (resetPage) params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get("/products", {
          params: {
            search: search || undefined,
            category: category || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            sort,
            page,
            limit: 12,
          },
        }),
        apiClient.get("/products/categories"),
      ]);
      setProducts(productsRes.data.data);
      setPagination(productsRes.data.pagination);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    updateParams({ minPrice: minPriceInput, maxPrice: maxPriceInput });
  };

  return (
    <div className="container section">
      <div className="section-header">
        <h2>Shop all products</h2>
      </div>

      <div className="toolbar">
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" type="submit">
            Search
          </button>
        </form>

        <select value={category} onChange={(e) => updateParams({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <form onSubmit={handlePriceSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
          />
          <span className="cell-muted">–</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" type="submit">
            Apply
          </button>
        </form>

        <select value={sort} onChange={(e) => updateParams({ sort: e.target.value }, { resetPage: false })}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <LoadingState label="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" message="Try a different search or clear your filters." />
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={(newPage) => updateParams({ page: String(newPage) }, { resetPage: false })}
      />
    </div>
  );
};

export default ProductsView;
