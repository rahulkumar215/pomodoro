import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SettingsContextProvider } from "./context/SettingsContextProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import TaskContextProvider from "./context/TaskContextProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsContextProvider>
        <TaskContextProvider>
          <App />
        </TaskContextProvider>
      </SettingsContextProvider>
    </QueryClientProvider>
  </StrictMode>,
);
