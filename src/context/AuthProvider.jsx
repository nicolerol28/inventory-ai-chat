import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

function decodeIfValid(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp || decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    return decodeIfValid(stored) ? stored : null;
  });
  const [user, setUser] = useState(() => decodeIfValid(localStorage.getItem("token")));
  const [showReAuth, setShowReAuth] = useState(false);

  const login = useCallback((newToken) => {
    const decoded = decodeIfValid(newToken);
    if (!decoded) return;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decoded);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("token");
      if (token && !decodeIfValid(stored)) {
        logout();
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token, logout]);

  useEffect(() => {
    const handle = () => setShowReAuth(true);
    window.addEventListener("auth:unauthorized", handle);
    return () => window.removeEventListener("auth:unauthorized", handle);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, showReAuth, setShowReAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
