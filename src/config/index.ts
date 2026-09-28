import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const config = {
  node_env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  client_url: process.env.CLIENT_URL || "http://localhost:3000",

  database_url: requiredEnv("DATABASE_URL"),

  password_salt_round: Number(process.env.PASSWORD_SALT_ROUND) || 10,

  jwt: {
    jwt_access_secret: requiredEnv("JWT_ACCESS_SECRET"),

    jwt_refresh_secret: requiredEnv("JWT_REFRESH_SECRET"),

    jwt_access_expires: process.env.JWT_ACCESS_EXPIRES || "15m",

    jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },

  cloudinary: {
    cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),

    api_key: requiredEnv("CLOUDINARY_API_KEY"),

    api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
  },

  google: {
    client_id: requiredEnv("GOOGLE_CLIENT_ID"),

    client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),

    callback_url: requiredEnv("GOOGLE_CALLBACK_URL"),
  },
};

export default config;
