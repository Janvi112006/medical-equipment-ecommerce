"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./LoadingState";

const RequireAuth = ({ children }) => {
  const { token, initializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initializing && !token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [initializing, token, router, pathname]);

  if (initializing || !token) {
    return <LoadingState label="Checking your session..." />;
  }

  return children;
};

export default RequireAuth;
