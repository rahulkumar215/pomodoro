import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CheckCircleIcon, CrownIcon, RocketIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { usePlanDialog } from "@/context/PlamDialogContext";
import { onPayment } from "@/lib/onPayment";
import { onSubscription } from "@/lib/onSubscription";
import { cx } from "class-variance-authority";

function PlanModal() {
  const { openPlanDialog, setOpenPlanDialog } = usePlanDialog();
  const [selectedPlan, setSelectedPlan] = useState<{
    planId: string;
    billingType: "one_time" | "recurring";
  } | null>(null);

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await api.get("/plans");
      return response.data.data.plans;
    },
  });

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);

  return (
    <Dialog
      open={openPlanDialog}
      onOpenChange={(open) => setOpenPlanDialog(open)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CrownIcon /> Premium
          </DialogTitle>
        </DialogHeader>

        <div>
          <h3>More abilities</h3>

          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-4" />
            Add Projects
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-4" />
            No ads
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-4" />
            ... and all the future updates
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3>Select Plan</h3>
          <div className="grid grid-cols-3 gap-6">
            {plans && plans.length > 0
              ? plans.map((plan) => (
                  <Button
                    key={plan.id}
                    className={cx(
                      "flex h-24 flex-col items-center justify-center gap-1",
                      selectedPlan?.planId === plan.id &&
                        "border-6 border-red-600",
                    )}
                    onClick={() =>
                      setSelectedPlan({
                        billingType: plan.billingType,
                        planId: plan.id,
                      })
                    }
                  >
                    <span className="text-xs uppercase">{plan.name}</span>
                    <span className="text-2xl">₹{plan.price}</span>
                    <span className="text-xs">/ {plan.interval}</span>
                  </Button>
                ))
              : "No Plan Found."}
          </div>

          <Button
            className="w-full"
            onClick={() => {
              if (selectedPlan === null) {
                alert("Kindly select a plan");
                return;
              }

              if (selectedPlan.billingType === "one_time") {
                onPayment(selectedPlan.planId);
              } else if (selectedPlan.billingType === "recurring") {
                onSubscription(selectedPlan.planId);
              }
            }}
          >
            <RocketIcon />
            Purchase the plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlanModal;
