"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient, { setUnauthorizedHandler, getErrorMessage } from "../lib/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("customer_token");
    const storedUser = localStorage.getItem("customer_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
      }
    }
    setInitializing(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const persistSession = (data) => {
    localStorage.setItem("customer_token", data.token);
    localStorage.setItem("customer_user", JSON.stringify(data));
    setToken(data.token);
    setUser(data);
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      persistSession(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  const register = useCallback(async (form) => {
    try {
      const response = await apiClient.post("/auth/register", form);
      persistSession(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);
  const sendOtp = useCallback(async (email) => {
    try {
      const response = await apiClient.post("/auth/send-otp", { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    try {
      const response = await apiClient.post("/auth/verify-otp", { email, otp });
      persistSession(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  return (
   <AuthContext.Provider
  value={{ user, token, initializing, login, register, sendOtp, verifyOtp, logout }}
>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
