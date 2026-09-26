import { Request, Response } from "express";
import type { CookieOptions } from "express";
import httpStatus from "http-status";

import { userServices } from "./user.service";
import config from "../../config";
import { sendResponse } from "../utils/sendResponse";
import { catchAsync } from "../utils/catchAsync";

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 15 * 60 * 1000, // 15 minutes
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite: "lax",
};

const refreshTokenCookieOptions: CookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite: "lax",
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const data = await userServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Account created successfully",
    data,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const data = await userServices.loginUser(req.body);

  res.cookie("accessToken", data.accessToken, accessTokenCookieOptions);

  res.cookie("refreshToken", data.refreshToken, refreshTokenCookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      user: data.user,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  const data = await userServices.getMe(req.user.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Refresh token is missing",
      data: null,
    });
  }

  const data = await userServices.refreshToken(token);

  res.cookie("accessToken", data.accessToken, accessTokenCookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed",
    data: null,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

export const userController = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logoutUser,
};
