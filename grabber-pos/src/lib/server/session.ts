import "server-only";
import { createHmac } from "crypto";

export const SESSION_COOKIE = "pos_session";
export const SESSION_HOURS = 12;

function secret(): string {
  return process.env.POS_SESSION_SECRET ?? "dev-only-secret";
}

export function sessionToken(user: string): string {
  return user + "." + createHmac("sha256", secret()).update(user).digest("hex");
}
