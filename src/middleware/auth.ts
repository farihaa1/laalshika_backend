import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import AppError from "../error/AppError";
import config from "../config";
import { UserRole } from "../modules/users/user.constrain";

export const auth = (allowedRoles: UserRole[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from cookie
      const cookieToken = req.cookies?.accessToken;

      // Or get token from Authorization header
      const headerToken = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined;

      const token = cookieToken || headerToken;

      if (!token) {
        throw new AppError(401, "You are not authorized");
      }

      // Verify access token
      const decoded = jwt.verify(
        token,
        config.jwt.jwt_access_secret,
      ) as JwtPayload;

      if (!decoded.userId || !decoded.email || !decoded.role) {
        throw new AppError(401, "Invalid token");
      }

      // Role checking
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(decoded.role as UserRole)
      ) {
        throw new AppError(403, "Forbidden");
      }

      // Attach authenticated user to request
      req.user = {
        userId: decoded.userId as string,
        email: decoded.email as string,
        role: decoded.role as UserRole,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError(401, "Access token expired"));
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError(401, "Invalid access token"));
      }

      next(error);
    }
  };
};
