import config from "@/config";
import razorpay from "razorpay";

export const createRazorPayInstance = () => {
  return new razorpay({
    key_id: config.razorpay_api_key,
    key_secret: config.razorpay_secret,
  });
};
