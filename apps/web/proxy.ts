import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PATHS = ["/cuenta", "/vender"];

const ACCESS_TOKEN_COOKIE = "nogal_access_token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token && (await isValidAccessToken(token))) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/iniciar-sesion", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

async function isValidAccessToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/cuenta/:path*", "/vender/:path*"],
};
