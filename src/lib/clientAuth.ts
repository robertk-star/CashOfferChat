import { createHmac, randomBytes, timingSafeEqual, pbkdf2Sync } from "crypto";

const CLIENT_COOKIE_NAME = "coc_client_session";

export function clientCookieName() {
  return CLIENT_COOKIE_NAME;
}

function getClientSecret() {
  return process.env.CLIENT_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "development-client-secret-change-me";
}

export function hashClientPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyClientPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const expected = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
  } catch {
    return false;
  }
}
