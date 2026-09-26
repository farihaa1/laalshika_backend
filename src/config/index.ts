import dotenv from "dotenv";

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  database_url: process.env.DATABASE_URL as string,

  jwt: {
    jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,

    jwt_access_expires: process.env.JWT_ACCESS_EXPIRES || "15m",

    jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,

    api_key: process.env.CLOUDINARY_API_KEY as string,

    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },
};

export default config;
