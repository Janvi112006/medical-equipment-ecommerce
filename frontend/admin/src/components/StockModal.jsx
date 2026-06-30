import { useState } from "react";
import apiClient, { getErrorMessage } from "../api/axiosClient";

const StockModal = ({ product, onClose, onSaved }) => {
  const [stock, setStock] = useState(product.stock);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiClient.patch(`/products/${product._id}/stock`, { stock: Number(stock) });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h2>Update stock</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-banner">{error}</div>}
            <p style={{ marginTop: 0, color: "var(--color-text-muted)", fontSize: 13 }}>{product.name}</p>
            <div className="field">
              <label htmlFor="stockValue">New stock quantity</label>
              <input
                id="stockValue"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Update stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;
