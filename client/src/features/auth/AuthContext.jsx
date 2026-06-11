import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  refreshTokenRequest,
  registerRequest,
} from "./auth.service.js";
import { authStorage } from "./auth.storage.js";

const AuthContext = createContext(null);

const getErrorMessage = (error) => {
  return error?.response?.data?.message || error.message || "Something went wrong";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const accessToken = authStorage.getAccessToken();
      const refreshToken = authStorage.getRefreshToken();

      if (!accessToken && !refreshToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        if (!accessToken && refreshToken) {
          const refreshedSession = await refreshTokenRequest(refreshToken);
          authStorage.setTokens(refreshedSession);
        }

        const currentUser = await getMeRequest();
        setUser(currentUser);
      } catch (error) {
        authStorage.clearTokens();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    loadCurrentUser();
  }, []);

  const register = async (payload) => {
    const session = await registerRequest(payload);
    authStorage.setTokens(session);
    setUser(session.user);
    return session.user;
  };

  const login = async (payload) => {
    const session = await loginRequest(payload);
    authStorage.setTokens(session);
    setUser(session.user);
    return session.user;
  };

  const logout = async () => {
    try {
      if (authStorage.getAccessToken()) {
        await logoutRequest();
      }
    } finally {
      authStorage.clearTokens();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
      register,
      getErrorMessage,
    }),
    [user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
