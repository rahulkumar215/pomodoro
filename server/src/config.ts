import dotenv from "dotenv";

dotenv.config();

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

const appConfig = Object.freeze({
  ENV: getEnvVar("NODE_ENV"),
  PORT: Number(process.env.port) || 3000,
  DEBUG: getEnvVar("DEBUG"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  JWT_EXP: getEnvVar("JWT_EXP"),
  RAZORPAY_API_KEY: getEnvVar("RAZORPAY_API_KEY"),
  RAZORPAY_SECRET: getEnvVar("RAZORPAY_SECRET"),
  RAZORPAY_WEBHOOK_SECRET: getEnvVar("RAZORYPAY_WEBHOOK_SECRET"),
  CLIENT_URL: getEnvVar("CLIENT_URL"),
  SALT: getEnvVar("SALT"),
  TOKEN_LEN: getEnvVar("TOKEN_LEN"),
  TOKEN_ALGO: getEnvVar("TOKEN_ALGO"),
  TOKEN_ENC: getEnvVar("TOKEN_ENC"),
});

export default appConfig;

// const config = {
//   env: process.env.NODE_ENV || "development",
//   // env: "production",
//   port: parseInt(process.env.PORT || "3000"),
//   debug: process.env.APP_DEBUG === "true",
//   jwt_secret: process.env.JWT_SECRET || "thisismyjwtsecret",
//   jwt_exp: process.env.JWT_EXP || "24h",
//   razorpay_api_key: process.env.RAZORPAY_API_KEY || "",
//   razorpay_secret: process.env.RAZORPAY_SECRET || "",
//   RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
// };

// export default config;
