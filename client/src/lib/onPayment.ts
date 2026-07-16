import api from "./api";

export const onPayment = async (planId: string) => {
  try {
    const options = {
      planId,
    };
    const res = await api.post("/payments/createOrder", options);
    const data = res.data;
    const paymentObject = new (window as any).Razorpay({
      key: import.meta.env.VITE_RAZORPAY_API_KEY,
      order_id: data.id,
      ...data,
      handler: function (response: any) {
        const options2 = {
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        };
        api
          .post("/payments/verifyPayment", options2)
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
