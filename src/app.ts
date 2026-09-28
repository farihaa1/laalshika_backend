import express, { Application, NextFunction, Request, Response } from "express";
import routes from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://laalshika.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "App is running",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error:", error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Something went wrong globally",
  });
});

export default app;
