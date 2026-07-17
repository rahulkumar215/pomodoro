import { createContext, useContext } from "react";

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  isPremium: boolean;
}

interface AuthContext {
  user: User | null | undefined;
  isPremium: boolean;
}

export const AuthContext = createContext<AuthContext | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within the AuthProvider");
  return ctx;
};
