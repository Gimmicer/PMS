import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { Role, SessionUser } from "../lib/types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const getDefaultRoute = (roles: Role[]) => {
    if (roles.includes("ADMIN")) return "/admin";
    if (roles.includes("MANAGER")) return "/manager";
    return "/employee";
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setInitializing(false);
      }
    };
    void bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      login: async (email: string, password: string) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setUser(data.user);
        return data.user as SessionUser;
      },
      logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        await api.post("/auth/logout", { refreshToken });
        localStorage.clear();
        setUser(null);
      },
      getDefaultRoute,
    }),
    [initializing, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
