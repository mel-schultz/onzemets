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

    // 1. Verifica se as variáveis de ambiente estão presentes
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[login] SUPABASE_SERVICE_ROLE_KEY não definida");
      return NextResponse.json({ error: "Configuração de servidor incompleta." }, { status: 500 });
    }

    // 2. Busca o usuário pelo e-mail
    const { data, error: dbError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (dbError) {
      // PGRST116 = "no rows returned" — e-mail não encontrado
      if (dbError.code === "PGRST116") {
        return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
      }
      console.error("[login] Erro Supabase:", dbError.code, dbError.message);
      return NextResponse.json({ error: `Erro ao consultar banco: ${dbError.message}` }, { status: 500 });
    }

    const user = data as Usuario | null;

    if (!user) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    // 3. Verifica a senha
    const senhaCorreta = bcrypt.compareSync(senha, user.senha_hash);
    if (!senhaCorreta) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    // 4. Cria a sessão
    const session = await getSession();
    session.userId     = user.id;
    session.userName   = user.nome;
    session.userEmail  = user.email;
    session.userFuncao = user.funcao;
    await session.save();

    const { senha_hash: _, ...safe } = user;
    return NextResponse.json({ message: "Login realizado.", user: safe });

  } catch (err) {
    console.error("[login] Exceção inesperada:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
