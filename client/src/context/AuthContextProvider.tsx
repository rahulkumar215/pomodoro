import { AuthContext } from "./AuthContext";
import { useFetchUser } from "@/hooks/useAuthAPI";

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useFetchUser();
  const isPremium = user?.isPremium ?? false;

  return (
    <AuthContext
      value={{
        user,
        isPremium,
      }}
    >
      {children}
    </AuthContext>
  );
}

export default AuthContextProvider;
