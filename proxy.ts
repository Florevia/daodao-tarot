import { isAdminEmail } from "@/lib/admin";
import { readSessionFromToken, SESSION_COOKIE } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Cache Components stream the admin page shell before `notFound()` runs, which
 * leaves a 200 status. Deny here so guests and other accounts get HTTP 404.
 */
export async function proxy(request: NextRequest) {
  try {
    const user = await readSessionFromToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (isAdminEmail(user?.email)) return NextResponse.next();
  } catch {
    // Fail closed.
  }
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
