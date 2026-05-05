import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken } from "./auth";

export async function getAuthState(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token);
}
