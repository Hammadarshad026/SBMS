"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, AUTH_TOKEN_STORAGE_KEY, authApi } from "@/lib/api";

const AUTH_SESSION_STORAGE_KEY = "sbms.auth.session";

const initialState = {
  status: "loading",
  token: null,
  user: null,
  error: null,
};

const AuthContext = createContext(null);

function readSessionFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

function saveSessionToStorage(session) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.token);
}

function clearSessionStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("An unexpected authentication error occurred");
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);

  const bootstrap = useCallback(async () => {
    const storedSession = readSessionFromStorage();

    if (!storedSession?.token || !storedSession?.user) {
      setState({ status: "unauthenticated", token: null, user: null, error: null });
      return;
    }

    setState({
      status: "loading",
      token: storedSession.token,
      user: storedSession.user,
      error: null,
    });

    try {
      const currentUser = await authApi.me(storedSession.token);
      const nextSession = {
        token: storedSession.token,
        user: {
          ...storedSession.user,
          ...currentUser,
        },
      };

      saveSessionToStorage(nextSession);
      setState({
        status: "authenticated",
        token: nextSession.token,
        user: nextSession.user,
        error: null,
      });
    } catch (error) {
      clearSessionStorage();
      setState({
        status: "unauthenticated",
        token: null,
        user: null,
        error: normalizeError(error),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void bootstrap();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bootstrap]);

  const signIn = useCallback(async (credentials) => {
    setState((current) => ({ ...current, status: "loading", error: null }));

    try {
      const result = await authApi.login(credentials);
      const session = {
        token: result.access_token,
        user: result.user,
      };

      saveSessionToStorage(session);
      setState({
        status: "authenticated",
        token: session.token,
        user: session.user,
        error: null,
      });

      return session.user;
    } catch (error) {
      clearSessionStorage();
      setState({
        status: "unauthenticated",
        token: null,
        user: null,
        error: normalizeError(error),
      });
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    clearSessionStorage();
    setState({ status: "unauthenticated", token: null, user: null, error: null });
  }, []);

  const refreshSession = useCallback(async () => {
    const activeToken = state.token;

    if (!activeToken) {
      return null;
    }

    try {
      const currentUser = await authApi.me(activeToken);
      const nextSession = {
        token: activeToken,
        user: {
          ...state.user,
          ...currentUser,
        },
      };

      saveSessionToStorage(nextSession);
      setState({
        status: "authenticated",
        token: nextSession.token,
        user: nextSession.user,
        error: null,
      });

      return nextSession.user;
    } catch (error) {
      clearSessionStorage();
      setState({
        status: "unauthenticated",
        token: null,
        user: null,
        error: normalizeError(error),
      });
      throw error;
    }
  }, [state.token, state.user]);

  const value = useMemo(
    () => ({
      ...state,
      isReady: state.status !== "loading",
      isAuthenticated: state.status === "authenticated",
      signIn,
      signOut,
      refreshSession,
    }),
    [refreshSession, signIn, signOut, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}