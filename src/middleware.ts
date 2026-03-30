// src/middleware.ts
// Proteção de rotas no Edge Runtime.
// iron-session NÃO funciona no Edge — fazemos uma verificação leve:
// se o cookie de sessão existir, deixamos passar; a verificação real
// de userId acontece em cada API Route / Server Component via getSession().

import { NextRequest, NextResponse } from "next/server";

// Rotas que não precisam de autenticação
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/recuperar-senha",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Arquivos estáticos e rotas públicas — libera direto
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Verifica presença do cookie de sessão (verificação leve, sem decrypt)
  // A validação real do userId ocorre em cada rota via getSession()
  const sessionCookie = req.cookies.get("onzemets_session");

  if (!sessionCookie?.value) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
