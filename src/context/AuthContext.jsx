import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "gatitoAuthToken";

export function AuthProvider({ children }) {
  // El token se conserva para recuperar la sesión después de actualizar o reabrir la página.
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) { setLoading(false); return undefined; }
    // El servidor valida que el token siga vigente antes de mostrar la cuenta.
    let cancelled = false;
    api.account(token).then(account => { if (!cancelled) setUser(account); })
      .catch(() => { if (!cancelled) { localStorage.removeItem(TOKEN_KEY); setToken(""); setUser(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const acceptSession = useCallback(result => {
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);
  const register = useCallback(async data => acceptSession(await api.register(data)), [acceptSession]);
  const login = useCallback(async data => acceptSession(await api.login(data)), [acceptSession]);
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setToken(""); setUser(null); }, []);
  const awardPoints = useCallback(async round => {
    // El backend decide los puntos y evita premiar dos veces el mismo identificador de ronda.
    if (!token || !round.gano || !round.puntos) return null;
    const account = await api.awardPoints(token, round);
    setUser(account);
    return account;
  }, [token]);
  const selectReward = useCallback(async rewardId => {
    if (!token) return null;
    const account = await api.selectReward(token, rewardId);
    setUser(account);
    return account;
  }, [token]);

  const value = useMemo(() => ({ token, user, loading, register, login, logout, awardPoints, selectReward }), [token, user, loading, register, login, logout, awardPoints, selectReward]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
