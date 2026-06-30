"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient, { getErrorMessage } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";

const ProductDetailsView = ({ id }) => {
  const router = useRouter();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    setAdding(true);
    setAddError("");
    setAddedMessage("");
    try {
      await addToCart(id, quantity);
      setAddedMessage("Added to cart.");
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingState label="Loading product..." />;
  if (error) return <div className="container section"><ErrorBanner message={error} onRetry={load} /></div>;
  if (!product) return null;

  const outOfStock = product.stock <= 0;

  return (
    <div className="container section">
      <Link href="/products" className="cell-muted" style={{ fontSize: 13 }}>
        ← Back to all products
      </Link>

      <div className="product-details" style={{ marginTop: 20 }}>
        <div className="product-details-gallery">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <span className="cell-muted">No image available</span>
          )}
        </div>

        <div>
          <div className="product-card-category">{product.category}</div>
          <h1 style={{ fontSize: 26, marginTop: 6 }}>{product.name}</h1>
          <div className="product-details-price">₹{product.price?.toFixed(2)}</div>

          {outOfStock ? (
            <span className="badge badge-danger">Out of stock</span>
          ) : (
            <span className="badge badge-success">{product.stock} in stock</span>
          )}

          <p style={{ marginTop: 18, color: "var(--color-text-muted)" }}>{product.description}</p>

          {!outOfStock && (
            <div className="qty-selector">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}

          {addError && <ErrorBanner message={addError} />}
          {addedMessage && <div className="badge badge-success" style={{ marginBottom: 12 }}>{addedMessage}</div>}

          <button className="btn btn-primary btn-block" onClick={handleAddToCart} disabled={outOfStock || adding}>
            {outOfStock ? "Out of stock" : adding ? "Adding..." : "Add to cart"}
          </button>

          {!token && <p className="cell-muted" style={{ fontSize: 12.5, marginTop: 8 }}>You'll be asked to log in first.</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsView;
