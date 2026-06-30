const config = {
  env: process.env.NODE_ENV || "development",
  // env: "production",
  port: parseInt(process.env.PORT || "3000"),
  debug: process.env.APP_DEBUG === "true",
  jwt_secret: process.env.JWT_SECRET || "thisismyjwtsecret",
  jwt_exp: process.env.JWT_EXP || "24h",
  razorpay_api_key: process.env.RAZORPAY_API_KEY || "",
  razorpay_secret: process.env.RAZORPAY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
};

export default config;
