import User from "./user.model";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import AppError from "../../error/AppError";
import config from "../../config";
import { UserRole } from "./user.constrain";

// ============================================================
// SAFE USER
// ============================================================

const getSafeUser = (user: any) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    authProvider: user.authProvider,
  };
};

// ============================================================
// CREATE JWT TOKENS
// ============================================================

const createTokens = (user: any) => {
  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt.jwt_access_secret, {
    expiresIn: config.jwt.jwt_access_expires,
  } as SignOptions);

  const refreshToken = jwt.sign(jwtPayload, config.jwt.jwt_refresh_secret, {
    expiresIn: config.jwt.jwt_refresh_expires,
  } as SignOptions);

  return {
    accessToken,
    refreshToken,
  };
};

// ============================================================
// REGISTER
// ============================================================

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const registerUser = async (payload: RegisterPayload) => {
  const email = payload.email.toLowerCase();

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.password_salt_round,
  );

  const user = await User.create({
    name: payload.name,
    email,
    phone: payload.phone,
    password: hashedPassword,
    authProvider: "local",
    role: UserRole.Customer,
  });

  return getSafeUser(user);
};

// ============================================================
// LOGIN
// ============================================================

interface LoginPayload {
  email: string;
  password: string;
}

const loginUser = async (payload: LoginPayload) => {
  const email = payload.email.toLowerCase();

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  // Google-only account
  if (user.authProvider === "google" && !user.password) {
    throw new AppError(
      400,
      "This account uses Google login. Please continue with Google.",
    );
  }

  if (!user.password) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatched = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = createTokens(user);

  return {
    accessToken,
    refreshToken,
    user: getSafeUser(user),
  };
};

// ============================================================
// GET ME
// ============================================================

const getMe = async (email: string) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return getSafeUser(user);
};

// ============================================================
// REFRESH TOKEN
// ============================================================

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(401, "Refresh token is required");
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, config.jwt.jwt_refresh_secret) as JwtPayload;
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

  const { accessToken } = createTokens(user);

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
