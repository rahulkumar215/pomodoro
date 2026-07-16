import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

interface PlanDialog {
  openPlanDialog: boolean;
  setOpenPlanDialog: Dispatch<SetStateAction<boolean>>;
}

export const PlanDialogContext = createContext<PlanDialog | null>(null);

export const usePlanDialog = () => {
  const ctx = useContext(PlanDialogContext);
  if (!ctx)
    throw new Error("usePlanDialog must be inside PlanDialogContextProvider");
  return ctx;
};
