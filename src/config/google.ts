import { google } from "googleapis";
import config from "./index";

export const googleOAuth2Client = new google.auth.OAuth2(
  config.google.client_id,
  config.google.client_secret,
  config.google.callback_url,
);
