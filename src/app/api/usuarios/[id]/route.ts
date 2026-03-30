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

type Params = Promise<{ id: string }>;
type UsuarioSafe = Omit<Usuario, "senha_hash">;

export async function GET(_: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  
  const { id } = await params;
  
  // Usuário pode ver seu próprio perfil. Admin/Super Admin podem ver qualquer um.
  if (Number(id) !== session.userId && !isAdmin(session.userFuncao || "")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, funcao, status, criado_em")
    .eq("id", id)
    .single();
    
  if (error || !data) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(data as UsuarioSafe);
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  
  const { id } = await params;
  const body = await req.json();
  const { nome, email, senha, funcao, status } = body;

  // Permissões de edição:
  // 1. Usuário pode editar seu próprio Nome, E-mail e Senha.
  // 2. Apenas Admin/Super Admin podem editar Funções e Status de outros.
  // 3. Apenas Super Admin pode promover alguém a Super Admin.
  
  const isEditingSelf = Number(id) === session.userId;
  const sessionIsAdmin = isAdmin(session.userFuncao || "");
  const sessionIsSuper = (session.userFuncao || "").split(",").includes("Super Admin");

  if (!isEditingSelf && !sessionIsAdmin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const updates: Record<string, any> = {};
  if (nome) updates.nome = nome;
  if (email) updates.email = email;
  if (senha) updates.senha_hash = bcrypt.hashSync(senha, 10);

  // Somente Admins podem mudar status e funções
  if (sessionIsAdmin) {
    if (status) updates.status = status;
    if (funcao) {
      // Regra: Apenas Super Admin pode atribuir o papel de Super Admin
      const targetRoles = funcao.split(",").map((r: string) => r.trim());
      if (targetRoles.includes("Super Admin") && !sessionIsSuper) {
        return NextResponse.json({ error: "Apenas Super Admin pode atribuir este papel." }, { status: 403 });
      }
      updates.funcao = funcao;
    }
  }

  if (!Object.keys(updates).length)
    return NextResponse.json({ error: "Nenhum campo informado." }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("id", id)
    .select("id, nome, email, funcao, status, criado_em")
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as UsuarioSafe);
}

export async function DELETE(_: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  
  // Apenas Admin/Super Admin podem deletar usuários
  if (!isAdmin(session.userFuncao || "")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  if (Number(id) === session.userId)
    return NextResponse.json({ error: "Você não pode remover seu próprio usuário." }, { status: 400 });
    
  const supabase = createServerClient();
  const { error } = await supabase.from("usuarios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Usuário removido." });
}
