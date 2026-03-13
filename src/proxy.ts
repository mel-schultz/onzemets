// src/proxy.ts
// Substitui middleware.ts na convenção do Next.js 15+.
// Proteção de rotas via iron-session (cookie criptografado).

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

// Rotas públicas — não precisam de autenticação
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/recuperar-senha"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Deixa passar arquivos estáticos e rotas públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Verifica sessão
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.userId) {
    // API routes → 401 JSON; pages → redirect para /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado. Faça login." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
