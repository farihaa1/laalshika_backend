import { NextFunction, Request, Response } from "express"
import AppError from "../error/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../modules/users/user.model";


export const auth = (role: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;
        if (!token) throw new AppError(401, "authorization failed")

        const isVerified = jwt.verify(token, 'very secret') as JwtPayload;
        const isUserExist = await User.findOne({ email: isVerified.email });

        if (!isUserExist) throw new AppError(404, "user not found")

        if (!role.includes(isVerified.role)) throw new AppError(401, "you can't get access")

        req.user = isUserExist;

        next();
    }
}