import { SettingsContextProvider } from "@/context/SettingsContextProvider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";

const RootLayout = () => (
  <>
    <SettingsContextProvider>
      <Toaster position="bottom-right" expand />
      <Outlet />
    </SettingsContextProvider>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
