import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import type { Usuario } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    if (!email || !senha)
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    const user = data as Usuario | null;

    if (error || !user || !bcrypt.compareSync(senha, user.senha_hash))
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });

    const session = await getSession();
    session.userId     = user.id;
    session.userName   = user.nome;
    session.userEmail  = user.email;
    session.userFuncao = user.funcao;
    await session.save();

    const { senha_hash: _, ...safe } = user;
    return NextResponse.json({ message: "Login realizado.", user: safe });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
