import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

if (!clientId) {
  throw new Error("GOOGLE_CLIENT_ID is missing");
}

if (!clientSecret) {
  throw new Error("GOOGLE_CLIENT_SECRET is missing");
}

if (!callbackUrl) {
  throw new Error("GOOGLE_CALLBACK_URL is missing");
}

export const googleClient = new OAuth2Client(
  clientId,
  clientSecret,
  callbackUrl
);