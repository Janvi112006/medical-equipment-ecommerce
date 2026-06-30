import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./LoadingState";

const ProtectedRoute = ({ children }) => {
  const { user, token, initializing } = useAuth();

  if (initializing) {
    return <LoadingState label="Checking your session..." />;
  }

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
