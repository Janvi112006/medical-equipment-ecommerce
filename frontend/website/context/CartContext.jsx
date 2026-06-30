"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import apiClient, { getErrorMessage } from "../lib/apiClient";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState(null); // { items, subtotal, tax, total, itemsRemoved }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/cart");
      setCart(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Refresh whenever login state changes (login -> load cart, logout -> clear it)
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await apiClient.post("/cart/add", { productId, quantity });
    setCart(res.data.data);
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await apiClient.put("/cart/update", { productId, quantity });
    setCart(res.data.data);
    return res.data;
  };

  const removeItem = async (productId) => {
    const res = await apiClient.delete(`/cart/remove/${productId}`);
    setCart(res.data.data);
    return res.data;
  };

  return (
    <CartContext.Provider
      value={{ cart, itemCount, loading, error, refreshCart, addToCart, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
