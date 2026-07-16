import api from "./api";

export const onSubscription = async (planId: string) => {
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
