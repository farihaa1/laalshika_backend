import { NextFunction, Request, Response } from "express";
import AppError from "../error/AppError";
import { UserRole } from "../modules/users/user.constrain";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError(401, "You are not authenticated"));
  }

  if (req.user.role !== UserRole.Admin) {
    return next(
      new AppError(403, "You do not have permission to access this resource"),
    );
  }

  next();
};
