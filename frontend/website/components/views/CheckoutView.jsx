"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient, { getErrorMessage } from "../../lib/apiClient";
import { useCart } from "../../context/CartContext";
import LoadingState from "../LoadingState";
import ErrorBanner from "../ErrorBanner";

const emptyAddress = { fullName: "", phone: "", addressLine: "", city: "", state: "", pincode: "" };

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load the payment widget. Check your connection."));
    document.body.appendChild(script);
  });

const CheckoutView = () => {
  const router = useRouter();
  const { cart, loading: cartLoading, refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [saveAddress, setSaveAddress] = useState(true);

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [order, setOrder] = useState(null); // set once checkout succeeds

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await apiClient.get("/addresses");
      setAddresses(res.data.data);
      if (res.data.data.length > 0) setSelectedAddressId(res.data.data[0]._id);
      else setUseNewAddress(true);
    } catch {
      setUseNewAddress(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setPlaceError("");
    try {
      const payload = useNewAddress ? { shippingAddress: newAddress } : { addressId: selectedAddressId };
      const res = await apiClient.post("/checkout", payload);
      setOrder(res.data.data);

      if (useNewAddress && saveAddress) {
        apiClient.post("/addresses", newAddress).catch(() => {}); // best-effort, non-blocking
      }
      refreshCart();
    } catch (err) {
      setPlaceError(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    setPayError("");
    try {
      const createRes = await apiClient.post("/payments/create-order", { orderId: order._id });
      const { razorpayOrderId, amount, currency, key } = createRes.data.data;

      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "MedEquip",
        description: `Order #${order._id.slice(-6)}`,
        handler: async (response) => {
          try {
            await apiClient.post("/payments/verify", {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(`/orders/${order._id}`);
          } catch (err) {
            setPayError(getErrorMessage(err));
          }
        },
        modal: {
          ondismiss: () => {
            apiClient
              .post("/payments/failure", { orderId: order._id, reason: "Checkout widget closed by customer" })
              .catch(() => {});
          },
        },
        theme: { color: "#0f766e" },
      });

      rzp.open();
    } catch (err) {
      setPayError(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (cartLoading || loadingAddresses) return <LoadingState label="Loading checkout..." />;

  // Step 2: order placed, waiting for payment
  if (order) {
    return (
      <div className="container section" style={{ maxWidth: 560 }}>
        <div className="card card-pad">
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Order placed</h2>
          <p className="cell-muted">Order #{order._id.slice(-6)} is waiting for payment.</p>
          <div className="summary-row total" style={{ marginTop: 16 }}>
            <span>Amount due</span>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
          {payError && <ErrorBanner message={payError} />}
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={handlePayNow} disabled={paying}>
            {paying ? "Opening payment window..." : `Pay ₹${order.totalAmount?.toFixed(2)} now`}
          </button>
          <p className="cell-muted" style={{ fontSize: 12.5, marginTop: 12 }}>
            You can also pay later from{" "}
            <Link href={`/orders/${order._id}`} style={{ textDecoration: "underline" }}>
              your order page
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container section">
        <p>
          Your cart is empty.{" "}
          <Link href="/products" style={{ textDecoration: "underline" }}>
            Continue shopping
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-header">
        <h2>Checkout</h2>
      </div>

      <div className="cart-layout">
        <form className="card card-pad" onSubmit={handlePlaceOrder}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Delivery address</h3>

          {addresses.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 13.5 }}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={!useNewAddress && selectedAddressId === addr._id}
                    onChange={() => {
                      setUseNewAddress(false);
                      setSelectedAddressId(addr._id);
                    }}
                  />
                  <span>
                    <strong>{addr.fullName}</strong> — {addr.addressLine}, {addr.city}, {addr.state} {addr.pincode} ·{" "}
                    {addr.phone}
                  </span>
                </label>
              ))}
              <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13.5 }}>
                <input type="radio" name="address" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                Use a new address
              </label>
            </div>
          )}

          {useNewAddress && (
            <>
              <div className="field-row">
                <div className="field">
                  <label>Full name</label>
                  <input
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="field">
                <label>Address</label>
                <input
                  required
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress((a) => ({ ...a, addressLine: e.target.value }))}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>City</label>
                  <input
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>State</label>
                  <input
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress((a) => ({ ...a, state: e.target.value }))}
                  />
                </div>
              </div>
              <div className="field">
                <label>Pincode</label>
                <input
                  required
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress((a) => ({ ...a, pincode: e.target.value }))}
                />
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, marginBottom: 16 }}>
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Save this address for next time
              </label>
            </>
          )}

          {placeError && <ErrorBanner message={placeError} />}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={placing || (!useNewAddress && !selectedAddressId)}
          >
            {placing ? "Placing order..." : "Place order"}
          </button>
        </form>

        <div className="card card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Order summary</h3>
          {items.map((item) => (
            <div className="summary-row" key={item.product._id}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>₹{item.lineTotal?.toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row" style={{ marginTop: 8 }}>
            <span>Subtotal</span>
            <span>₹{cart.subtotal?.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>₹{cart.tax?.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{cart.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
