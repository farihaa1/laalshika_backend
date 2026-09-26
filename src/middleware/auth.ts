import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../error/AppError";
import { UserRole } from "../modules/users/user.constrain";

export interface AuthUser {
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new AppError(401, "You are not authenticated");
    }

    const decoded = jwt.verify(
      token,
      config.jwt.jwt_access_secret as string,
    ) as JwtPayload;

    req.user = {
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
