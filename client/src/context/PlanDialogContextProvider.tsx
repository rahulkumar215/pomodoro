import { useState } from "react";
import { PlanDialogContext } from "./PlamDialogContext";

function PlanDialogContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openPlanDialog, setOpenPlanDialog] = useState(false);

  return (
    <PlanDialogContext
      value={{
        openPlanDialog,
        setOpenPlanDialog,
      }}
    >
      {children}
    </PlanDialogContext>
  );
}

export default PlanDialogContextProvider;
