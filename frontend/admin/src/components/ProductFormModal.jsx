import { useState, useEffect } from "react";
import apiClient, { getErrorMessage } from "../api/axiosClient";

const emptyForm = { name: "", description: "", category: "", price: "", stock: "", images: "" };

const ProductFormModal = ({ product, onClose, onSaved }) => {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        images: (product.images || []).join(", "),
      });
    } else {
      setForm(emptyForm);
    }
    setFieldErrors({});
    setFormError("");
  }, [product]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFieldErrors({});

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      stock: form.stock === "" ? 0 : Number(form.stock),
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (isEdit) {
        await apiClient.put(`/products/${product._id}`, payload);
      } else {
        await apiClient.post("/products", payload);
      }
      onSaved();
    } catch (error) {
      const data = error?.response?.data;
      if (data?.errors?.length) {
        const errs = {};
        data.errors.forEach((e) => {
          errs[e.field] = e.message;
        });
        setFieldErrors(errs);
      }
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit product" : "Add product"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && <div className="error-banner">{formError}</div>}

            <div className="field">
              <label htmlFor="name">Product name</label>
              <input id="name" value={form.name} onChange={handleChange("name")} required />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" rows={3} value={form.description} onChange={handleChange("description")} required />
              {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="category">Category</label>
                <input id="category" value={form.category} onChange={handleChange("category")} required />
                {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
              </div>
              <div className="field">
                <label htmlFor="price">Price (₹)</label>
                <input id="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange("price")} required />
                {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="stock">Stock</label>
                <input id="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange("stock")} />
                {fieldErrors.stock && <span className="field-error">{fieldErrors.stock}</span>}
              </div>
              <div className="field">
                <label htmlFor="images">Image URLs (comma-separated)</label>
                <input id="images" value={form.images} onChange={handleChange("images")} placeholder="https://...jpg, https://...jpg" />
                {fieldErrors.images && <span className="field-error">{fieldErrors.images}</span>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
