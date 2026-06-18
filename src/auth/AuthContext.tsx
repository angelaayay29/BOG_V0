import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_CREDENTIALS, SESSION_STORAGE_KEY } from "../config/auth";
import type { AuthSession, UserRole } from "../types/issue";

interface AuthContextValue {
  session: AuthSession | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; message: string };
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  isEditor: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null): void {
  if (!session) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());

  const login = useCallback((email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    for (const role of ["editor", "viewer"] as const) {
      const creds = DEMO_CREDENTIALS[role];
      if (
        normalizedEmail === creds.email.toLowerCase() &&
        password === creds.password
      ) {
        const next: AuthSession = { role, email: creds.email };
        setSession(next);
        writeSession(next);
        return { ok: true as const };
      }
    }

    return { ok: false as const, message: "Invalid email or password." };
  }, []);

  const loginAsRole = useCallback((role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    const next: AuthSession = { role, email: creds.email };
    setSession(next);
    writeSession(next);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    writeSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      login,
      loginAsRole,
      logout,
      isEditor: session?.role === "editor",
      isViewer: session?.role === "viewer",
    }),
    [session, login, loginAsRole, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
