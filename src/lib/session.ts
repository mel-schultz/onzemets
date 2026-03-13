// src/lib/session.ts
// Configuração de sessão com iron-session (cookies criptografados — sem DB necessário).
// IMPORTANTE: iron-session só pode ser usado em Node.js Runtime (API Routes, Server Components).
// NÃO use no middleware (Edge Runtime).

import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: number;
  userName?: string;
  userEmail?: string;
  userFuncao?: string;
}

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "SESSION_SECRET não está definida. Adicione esta variável na Vercel: Settings → Environment Variables."
  );
}

// Fallback apenas para desenvolvimento local.
// Em produção, SESSION_SECRET DEVE estar definida.
const PASSWORD =
  SESSION_SECRET ?? "dev-only-fallback-secret-change-in-production-32ch";

export const sessionOptions: SessionOptions = {
  password: PASSWORD,
  cookieName: "onzemets_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 8 * 60 * 60, // 8 horas
    sameSite: "lax",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session.userId) {
    throw new Response(JSON.stringify({ error: "Não autenticado. Faça login." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
