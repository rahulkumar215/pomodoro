import appConfig from "@/config";
import razorpay from "razorpay";

export const createRazorPayInstance = () => {
  return new razorpay({
    key_id: appConfig.RAZORPAY_API_KEY,
    key_secret: appConfig.RAZORPAY_SECRET,
  });
};
