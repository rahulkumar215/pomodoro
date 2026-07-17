import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SettingsContextProvider } from "./context/SettingsContextProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import TaskContextProvider from "./context/TaskContextProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import AuthContextProvider from "./context/AuthContextProvider";
import PlanDialogContextProvider from "./context/PlanDialogContextProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <PlanDialogContextProvider>
          <SettingsContextProvider>
            <TaskContextProvider>
              <TooltipProvider>
                <App />
              </TooltipProvider>
            </TaskContextProvider>
          </SettingsContextProvider>
        </PlanDialogContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  </StrictMode>,
);
