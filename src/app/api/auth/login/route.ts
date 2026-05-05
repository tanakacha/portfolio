import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";

function isSafePath(value: string | null): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) {
    return NextResponse.json({ error: "missing origin" }, { status: 403 });
  }
  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return NextResponse.json({ error: "bad origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "bad origin" }, { status: 403 });
  }

  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const fromRaw = form.get("from");
  const from = typeof fromRaw === "string" && isSafePath(fromRaw) ? fromRaw : "/private";

  if (!verifyPassword(password)) {
    const failUrl = new URL("/login", req.url);
    failUrl.searchParams.set("error", "1");
    failUrl.searchParams.set("from", from);
    return NextResponse.redirect(failUrl, 303);
  }

  const token = await createSessionToken();
  const response = NextResponse.redirect(new URL(from, req.url), 303);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
