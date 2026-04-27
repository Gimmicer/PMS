import { createContext } from "react";
import type { Role, SessionUser } from "../lib/types";

export type AuthState = {
  user: SessionUser | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
  getDefaultRoute: (roles: Role[]) => string;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);
