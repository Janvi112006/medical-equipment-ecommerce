"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";
import EmptyState from "../EmptyState";

const CartView = () => {
  const router = useRouter();
  const { cart, loading, error, refreshCart, updateQuantity, removeItem } = useCart();
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    setBusyId(productId);
    setActionError("");
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not update quantity.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setActionError("");
    try {
      await removeItem(productId);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not remove item.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !cart) return <LoadingState label="Loading your cart..." />;
  if (error) return <div className="container section"><ErrorBanner message={error} onRetry={refreshCart} /></div>;

  const items = cart?.items || [];

  return (
    <div className="container section">
      <div className="section-header">
        <h2>Your cart</h2>
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse the catalog and add something you need."
          action={
            <Link href="/products" className="btn btn-primary" style={{ marginTop: 8 }}>
              Continue shopping
            </Link>
          }
        />
      ) : (
        <div className="cart-layout">
          <div className="card card-pad">
            {items.map((item) => (
              <div className="cart-item" key={item.product._id}>
                <div className="cart-item-image">
                  {item.product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.images[0]} alt={item.product.name} />
                  ) : (
                    <span className="cell-muted" style={{ fontSize: 11 }}>
                      No image
                    </span>
                  )}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cell-muted">₹{item.product.price?.toFixed(2)} each</div>
                  <div className="cart-item-actions">
                    <div className="qty-selector" style={{ margin: 0 }}>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        disabled={busyId === item.product._id}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        disabled={busyId === item.product._id}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemove(item.product._id)}
                      disabled={busyId === item.product._id}
                    >
                      Remove
                    </button>
                    <strong style={{ marginLeft: "auto" }}>₹{item.lineTotal?.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Order summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cart.subtotal?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax {cart.taxRate ? `(${(cart.taxRate * 100).toFixed(0)}%)` : ""}</span>
              <span>₹{cart.tax?.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{cart.total?.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => router.push("/checkout")}>
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
