import { useState } from "react";
import { AuthContext, type User } from "./AuthContext";

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const isPremium = user?.isPremium ? true : false;

  return (
    <AuthContext
      value={{
        user,
        setUser,
        isPremium,
      }}
    >
      {children}
    </AuthContext>
  );
}

export default AuthContextProvider;
