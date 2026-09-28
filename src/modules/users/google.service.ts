import { google } from "googleapis";
import jwt, { SignOptions } from "jsonwebtoken";

import User from "./user.model";
import { UserRole } from "./user.constrain";

import AppError from "../../error/AppError";
import config from "../../config";
import { googleOAuth2Client } from "../../config/google";

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
// CREATE LAALSHIKA JWT TOKENS
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
// GOOGLE LOGIN
// ============================================================

const loginWithGoogle = async (code: string) => {
  // ==========================================================
  // 1. Exchange Google authorization code for Google tokens
  // ==========================================================

  const { tokens: googleTokens } = await googleOAuth2Client.getToken(code);

  googleOAuth2Client.setCredentials(googleTokens);

  // ==========================================================
  // 2. Get Google user profile
  // ==========================================================

  const oauth2 = google.oauth2({
    auth: googleOAuth2Client,
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();

  // ==========================================================
  // 3. Validate Google account
  // ==========================================================

  if (!data.id) {
    throw new AppError(401, "Could not retrieve Google account");
  }

  if (!data.email) {
    throw new AppError(401, "Google account does not have an email");
  }

  if (data.verified_email !== true) {
    throw new AppError(401, "Google email is not verified");
  }

  // ==========================================================
  // 4. Prepare Google user information
  // ==========================================================

  const googleId = data.id;

  const email = data.email.toLowerCase();

  const name: string =
    data.name || data.given_name || email.split("@")[0] || "Google User";

  // ==========================================================
  // 5. Find existing user by Google ID
  // ==========================================================

  let user = await User.findOne({
    googleId,
  });

  // ==========================================================
  // 6. If not found, find by email
  // ==========================================================

  if (!user) {
    user = await User.findOne({
      email,
    });
  }

  // ==========================================================
  // 7. Create new Google user
  // ==========================================================

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      authProvider: "google",
      role: UserRole.Customer,
    });
  }

  // ==========================================================
  // 8. Link Google to existing local account
  // ==========================================================
  else if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = "google";

    await user.save();
  }

  // ==========================================================
  // 9. Create LaalShika JWT tokens
  // ==========================================================

  const { accessToken, refreshToken } = createTokens(user);

  // ==========================================================
  // 10. Return user + LaalShika tokens
  // ==========================================================

  return {
    user: getSafeUser(user),
    accessToken,
    refreshToken,
  };
};

export const googleService = {
  loginWithGoogle,
};
