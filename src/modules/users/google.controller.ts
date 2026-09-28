import { Request, Response } from "express";
import crypto from "crypto";
import config from "../../config";
import { googleOAuth2Client } from "../../config/google";
import { googleService } from "./google.service";
import { catchAsync } from "../utils/catchAsync";

const STATE_COOKIE = "google_oauth_state";

// ============================================================
// Cookie options
// ============================================================

const accessTokenCookieOptions = {
  maxAge: 15 * 60 * 1000,

  httpOnly: true,

  secure: config.node_env === "production",

  sameSite: "lax" as const,

  path: "/",
};

const refreshTokenCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,

  httpOnly: true,

  secure: config.node_env === "production",

  sameSite: "lax" as const,

  path: "/",
};

// ============================================================
// START GOOGLE LOGIN
// ============================================================

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,

    secure: config.node_env === "production",

    sameSite: "lax",

    maxAge: 10 * 60 * 1000,

    path: "/",
  });

  const authorizationUrl = googleOAuth2Client.generateAuthUrl({
    access_type: "offline",

    scope: ["openid", "email", "profile"],

    state,

    prompt: "select_account",
  });

  return res.redirect(authorizationUrl);
});

// ============================================================
// GOOGLE CALLBACK
// ============================================================

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    // ------------------------------------------------------
    // Validate Google callback
    // ------------------------------------------------------

    if (typeof code !== "string" || typeof state !== "string") {
      return res.redirect(
        `${config.client_url}/Login?error=google_auth_failed`,
      );
    }

    // ------------------------------------------------------
    // Validate OAuth state
    // ------------------------------------------------------

    const savedState = req.cookies?.[STATE_COOKIE];

    if (!savedState || savedState !== state) {
      return res.redirect(
        `${config.client_url}/Login?error=invalid_google_state`,
      );
    }

    // ------------------------------------------------------
    // Clear state cookie
    // ------------------------------------------------------

    res.clearCookie(STATE_COOKIE, {
      httpOnly: true,

      secure: config.node_env === "production",

      sameSite: "lax",

      path: "/",
    });

    // ------------------------------------------------------
    // Login/create Google user
    // ------------------------------------------------------

    const data = await googleService.loginWithGoogle(code);

    // ------------------------------------------------------
    // Set LaalShika access token
    // ------------------------------------------------------

    res.cookie(
      "accessToken",

      data.accessToken,

      accessTokenCookieOptions,
    );

    // ------------------------------------------------------
    // Set LaalShika refresh token
    // ------------------------------------------------------

    res.cookie(
      "refreshToken",

      data.refreshToken,

      refreshTokenCookieOptions,
    );

    // ------------------------------------------------------
    // Redirect frontend
    // ------------------------------------------------------

    return res.redirect(`${config.client_url}/dashboard`);
  } catch (error) {
    console.error("Google callback error:", error);

    return res.redirect(`${config.client_url}/Login?error=google_auth_failed`);
  }
});

export const googleController = {
  googleLogin,

  googleCallback,
};
