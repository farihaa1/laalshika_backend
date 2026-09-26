import app from "../app";
import { connectDB } from "../lib/db";

export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}
