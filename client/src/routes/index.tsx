// import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import axios from "axios";
import api from "@/lib/api";
// import { cx } from "class-variance-authority";
// import { TABS } from "@/consts/consts";
// import formattedTimer from "@/lib/formattedTimer";
// import useTimer from "@/hooks/useTimer";
// import Header from "@/components/header";
// import Tasks from "@/components/tasks";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // const {
  //   timer,
  //   started,
  //   activeTab,
  //   handleStartTimer,
  //   handleChangeTab,
  //   count,
  // } = useTimer();

  // return (
  //   <div className="p-2 flex flex-col gap-6">
  //     <Header />
  //     <div className="flex flex-col gap-6 items-center">
  //       <div className="flex gap-2 items-center justify-center">
  //         {Object.entries(TABS).map(([key, value]) => (
  //           <Button
  //             key={key}
  //             onClick={() => handleChangeTab(value)}
  //             variant="secondary"
  //             className={cx(
  //               activeTab.type === value.type &&
  //                 "bg-white text-secondary hover:bg-gray-100",
  //             )}
  //           >
  //             {value.type}
  //           </Button>
  //         ))}
  //       </div>
  //       <h1>{formattedTimer(timer)}</h1>
  //       <Button onClick={handleStartTimer}>{started ? "Stop" : "Start"}</Button>
  //       {activeTab.type === "Pomodoro" ? (
  //         <p>#{count.focus}</p>
  //       ) : (
  //         <p>#{count.break}</p>
  //       )}
  //       <p>{activeTab.message}</p>
  //       <Tasks />
  //     </div>
  //   </div>
  // );
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
  const onPayment = async (amount: number) => {
    // create order
    try {
      const options = {
        planId: 1,
        amount,
      };
      const res = await api.post("/payments/createOrder", options);
      const data = res.data;
      console.log(data);
      const paymentObject = new (window as any).Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        order_id: data.id,
        ...data,
        handler: function (response: any) {
          console.log(response);
          const options2 = {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          };
          axios
            .post(
              "http://localhost:3000/api/v1/payments/verifyPayment",
              options2,
            )
            .then((res) => {
              console.log(res.data);
              if (res.status === 200) {
                alert("Payment Successful");
              } else {
                alert("Payment Failed");
              }
            })
            .catch((err) => {
              console.log(err);
            });
        },
      });
      paymentObject.open();
    } catch (error) {
      console.error(error);
    }
  };
  const onSubscription = async (planId: string) => {
    try {
      const { data } = await api.post("payments/createSubscription", {
        planId,
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        subscription_id: data.subscriptionId,
        name: "Rahul Vishwakarma",
        description: "Monthly Test Plan",
        handler: function (response: any) {
          const options2 = {
            payment_id: response.razorpay_payment_id,
            subscription_id: response.razorpay_subscription_id,
            signature: response.razorpay_signature,
          };
          api.post("/payments/verifySubscription", options2).then((res) => {
            if (res.status === 200) {
              alert("Subscription Successful");
            } else {
              alert("Subscription Failed");
            }
          });
        },
        theme: {
          color: "#F37254",
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);
  return (
    <div className="flex items-center gap-6 flex-col">
      Razor Pay Integration
      <div className="flex gap-4 items-center">
        <Button onClick={() => onSubscription("plan_T7Fz3v0j92fNhO")}>
          ₹300 / month
        </Button>
        <Button onClick={() => onSubscription("plan_T7FtJLgweReVcY")}>
          ₹1800 / year
        </Button>
        <Button onClick={() => onPayment(5400)}>₹5400 / lifetime</Button>
      </div>
    </div>
  );
}
