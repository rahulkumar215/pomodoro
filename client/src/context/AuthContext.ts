import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  isPremium: boolean;
}

interface AuthContext {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isPremium: boolean;
}

export const AuthContext = createContext<AuthContext | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within the AuthProvider");
  return ctx;
};
