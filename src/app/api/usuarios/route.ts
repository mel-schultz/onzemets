import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";
import type { Usuario } from "@/types/database";

async function auth() { 
  const s = await getSession(); 
  return s.userId ? s : null; 
}

function isAdmin(funcao: string) {
  const roles = funcao.split(",").map(r => r.trim());
  return roles.includes("Administrador") || roles.includes("Super Admin");
}

type UsuarioSafe = Omit<Usuario, "senha_hash">;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  // Apenas Admin e Super Admin podem listar todos os usuários
  if (!isAdmin(session.userFuncao || "")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, funcao, status, criado_em")
    .order("nome");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []) as UsuarioSafe[]);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  // Apenas Admin e Super Admin podem criar novos usuários
  if (!isAdmin(session.userFuncao || "")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { nome, email, senha, funcao, status } = await req.json();
  if (!nome || !email || !senha) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }

  // Apenas Super Admin pode atribuir o papel de Super Admin
  const targetRoles = (funcao || "").split(",").map((r: string) => r.trim());
  const sessionIsSuper = (session.userFuncao || "").split(",").includes("Super Admin");
  if (targetRoles.includes("Super Admin") && !sessionIsSuper) {
    return NextResponse.json({ error: "Apenas Super Admin pode atribuir este papel." }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      nome,
      email,
      senha_hash: bcrypt.hashSync(senha, 10),
      funcao: funcao || "Fisioterapeuta Cardiovascular",
      status: status || "ativo",
    })
    .select("id, nome, email, funcao, status, criado_em")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as UsuarioSafe, { status: 201 });
}
