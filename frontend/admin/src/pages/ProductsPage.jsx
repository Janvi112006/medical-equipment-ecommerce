import { useEffect, useState, useCallback } from "react";
import apiClient, { getErrorMessage } from "../api/axiosClient";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import ProductFormModal from "../components/ProductFormModal";
import StockModal from "../components/StockModal";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formProduct, setFormProduct] = useState(undefined); // undefined = closed, null = create, object = edit
  const [stockProduct, setStockProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get("/products", { params: { search: search || undefined, category: category || undefined, page, limit: 10 } }),
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
  }, [search, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/products/${deleteTarget._id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <div className="page-subtitle">Manage the product catalog, pricing, and stock.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setFormProduct(null)}>
          + Add product
        </button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="card">
        {loading ? (
          <LoadingState label="Loading products..." />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" message="Try a different search or add your first product." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <strong>{product.name}</strong>
                      <div className="cell-muted" style={{ fontSize: 12 }}>
                        {product.description?.slice(0, 60)}
                        {product.description?.length > 60 ? "..." : ""}
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>₹{product.price?.toFixed(2)}</td>
                    <td>
                      {product.stock <= 0 ? (
                        <span className="badge badge-danger">Out of stock</span>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setFormProduct(product)}>
                          Edit
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setStockProduct(product)}>
                          Stock
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(product)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />

      {formProduct !== undefined && (
        <ProductFormModal
          product={formProduct}
          onClose={() => setFormProduct(undefined)}
          onSaved={() => {
            setFormProduct(undefined);
            load();
          }}
        />
      )}

      {stockProduct && (
        <StockModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
          onSaved={() => {
            setStockProduct(null);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete product"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ProductsPage;
