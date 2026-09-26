import mongoose from "mongoose";
import config from "../config";

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(config.database_url as string);

  console.log("MongoDB connected");
};
