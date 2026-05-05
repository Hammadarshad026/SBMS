"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";

const AuthContext = createContext(null);

const getInitialStatus = () => {
  const token = authStorage.getToken();
  const storedUser = authStorage.getUser();
  if (!token) {
    return "unauthenticated";
  }

  return storedUser ? "authenticated" : "loading";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [status, setStatus] = useState(getInitialStatus);

  const refresh = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }

    try {
      setStatus("loading");
      const data = await api.get("/auth/me");
      authStorage.setUser(data);
      setUser(data);
      setStatus("authenticated");
      return data;
    } catch (error) {
      authStorage.clear();
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setStatus("loading");
    const data = await api.post("/auth/login", credentials);
    authStorage.setToken(data.access_token);
    authStorage.setUser(data.user);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      refresh,
      token: authStorage.getToken(),
    }),
    [user, status, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
