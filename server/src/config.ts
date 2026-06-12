const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),
  debug: process.env.APP_DEBUG === "true",
  jwt_secret: process.env.JWT_SECRET || "thisismyjwtsecret",
  jwt_exp: process.env.JWT_EXP || "24h",
};

export default config;
