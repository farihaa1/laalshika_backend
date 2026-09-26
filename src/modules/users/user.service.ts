import User from "./user.model";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import { IUser } from "./user.interface";
import { UserRole } from "./user.constrain";
import AppError from "../../error/AppError";
import config from "../../config";

const getSafeUser = (user: any) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

const registerUser = async (payload: Omit<IUser, "role">) => {
  const email = payload.email.toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const user = await User.create({
    name: payload.name,
    email,
    phone: payload.phone,
    password: hashedPassword,
    role: UserRole.Customer,
  });

  return getSafeUser(user);
};

const loginUser = async (payload: Pick<IUser, "email" | "password">) => {
  const email = payload.email.toLowerCase();

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatched = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    {
      expiresIn: config.jwt.jwt_access_expires,
    } as SignOptions,
  );

  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    {
      expiresIn: config.jwt.jwt_refresh_expires,
    } as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
    user: getSafeUser(user),
  };
};

const getMe = async (email: string) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return getSafeUser(user);
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(401, "Refresh token is required");
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      token,
      config.jwt.jwt_refresh_secret as string,
    ) as JwtPayload;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  if (!decoded.email) {
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await User.findOne({
    email: decoded.email.toLowerCase(),
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    {
      expiresIn: config.jwt.jwt_access_expires,
    } as SignOptions,
  );

  return {
    accessToken,
  };
};

export const userServices = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
};
