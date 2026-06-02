import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { getSystemHealth } from "@/lib/systemHealth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const health = await getSystemHealth();
  return NextResponse.json(health);
}
