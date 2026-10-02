import { Request, Response } from "express";
import crypto from "crypto";

import config from "../../config";
import { googleOAuth2Client } from "../../config/google";
import { googleService } from "./google.service";
import { catchAsync } from "../utils/catchAsync";

const STATE_COOKIE = "google_oauth_state";
const REDIRECT_COOKIE = "google_oauth_redirect";

// ============================================================
// COOKIE OPTIONS
// ============================================================

const isProduction = config.node_env === "production";

const accessTokenCookieOptions = {
  maxAge: 15 * 60 * 1000,

  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction ? ("none" as const) : ("lax" as const),

  path: "/",
};

const refreshTokenCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,

  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction ? ("none" as const) : ("lax" as const),

  path: "/",
};

// ============================================================
// START GOOGLE LOGIN
// ============================================================

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString("hex");

  let redirect = "/";

  if (
    typeof req.query.redirect === "string" &&
    req.query.redirect.startsWith("/")
  ) {
    redirect = req.query.redirect;
  }

  // --------------------------------------------------------
  // Save OAuth state
  // --------------------------------------------------------

  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
    path: "/",
  });

  // --------------------------------------------------------
  // Save redirect
  // --------------------------------------------------------

  res.cookie(REDIRECT_COOKIE, redirect, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
    path: "/",
  });

  // --------------------------------------------------------
  // Google URL
  // --------------------------------------------------------

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
    // Validate callback
    // ------------------------------------------------------

    if (typeof code !== "string" || typeof state !== "string") {
      return res.redirect(
        `${config.client_url}/Login?error=google_auth_failed`,
      );
    }

    // ------------------------------------------------------
    // Validate state
    // ------------------------------------------------------

    const savedState = req.cookies?.[STATE_COOKIE];

    if (!savedState || savedState !== state) {
      return res.redirect(
        `${config.client_url}/Login?error=invalid_google_state`,
      );
    }

    // ------------------------------------------------------
    // Get redirect BEFORE clearing cookies
    // ------------------------------------------------------

    let redirect = "/";

    const savedRedirect = req.cookies?.[REDIRECT_COOKIE];

    if (typeof savedRedirect === "string" && savedRedirect.startsWith("/")) {
      redirect = savedRedirect;
    }

    // ------------------------------------------------------
    // Clear OAuth cookies
    // ------------------------------------------------------

    res.clearCookie(STATE_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie(REDIRECT_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    // ------------------------------------------------------
    // Google login
    // ------------------------------------------------------

    const data = await googleService.loginWithGoogle(code);

    // ------------------------------------------------------
    // DEBUG
    // ------------------------------------------------------

    console.log("Google login successful:", data.user.email);

    console.log("Redirecting to:", redirect);

    // ------------------------------------------------------
    // Set access token
    // ------------------------------------------------------

    res.cookie("accessToken", data.accessToken, accessTokenCookieOptions);

    // ------------------------------------------------------
    // Set refresh token
    // ------------------------------------------------------

    res.cookie("refreshToken", data.refreshToken, refreshTokenCookieOptions);

    // ------------------------------------------------------
    // Redirect frontend
    // ------------------------------------------------------

    return res.redirect(
      `${config.client_url}/Login?google=success&redirect=${encodeURIComponent(
        redirect,
      )}`,
    );
  } catch (error) {
    console.error("Google callback error:", error);

    return res.redirect(`${config.client_url}/Login?error=google_auth_failed`);
  }
});

export const googleController = {
  googleLogin,
  googleCallback,
};
