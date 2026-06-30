import { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { setUnauthorizedHandler, getErrorMessage } from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("customer_token"),
          AsyncStorage.getItem("customer_user"),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // corrupt storage — ignore and fall through to logged-out state
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(["customer_token", "customer_user"]);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const persistSession = async (data) => {
    await AsyncStorage.setItem("customer_token", data.token);
    await AsyncStorage.setItem("customer_user", JSON.stringify(data));
    setToken(data.token);
    setUser(data);
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      await persistSession(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  const register = useCallback(async (form) => {
    try {
      const response = await apiClient.post("/auth/register", form);
      await persistSession(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, register, logout }}>
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
