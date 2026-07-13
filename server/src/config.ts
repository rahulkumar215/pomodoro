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
  PORT: Number(process.env.PORT) || 3001,
  APP_DEBUG: getEnvVar("APP_DEBUG"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  JWT_EXP: getEnvVar("JWT_EXP"),
  RAZORPAY_API_KEY: getEnvVar("RAZORPAY_API_KEY"),
  RAZORPAY_SECRET: getEnvVar("RAZORPAY_SECRET"),
  RAZORPAY_WEBHOOK_SECRET: getEnvVar("RAZORPAY_WEBHOOK_SECRET"),
  CLIENT_URL: getEnvVar("CLIENT_URL"),
  SALT: getEnvVar("SALT"),
  TOKEN_LEN: getEnvVar("TOKEN_LEN"),
  TOKEN_ALGO: getEnvVar("TOKEN_ALGO"),
  TOKEN_ENC: getEnvVar("TOKEN_ENC"),
  EMAIL_USERNAME: getEnvVar("EMAIL_USERNAME"),
  EMAIL_PASSWORD: getEnvVar("EMAIL_PASSWORD"),
  EMAIL_NAME: getEnvVar("EMAIL_NAME"),
  USER_EMAIL: getEnvVar("USER_EMAIL"),
});

export default appConfig;
