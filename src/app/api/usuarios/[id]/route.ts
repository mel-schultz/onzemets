import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, funcao, status, criado_em")
    .eq("id", params.id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { nome, email, senha, funcao, status } = await req.json();
  const updates: Record<string, string> = {};
  if (nome)   updates.nome   = nome;
  if (email)  updates.email  = email;
  if (funcao) updates.funcao = funcao;
  if (status) updates.status = status;
  if (senha)  updates.senha_hash = bcrypt.hashSync(senha, 10);

  if (!Object.keys(updates).length)
    return NextResponse.json({ error: "Nenhum campo informado." }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("id", params.id)
    .select("id, nome, email, funcao, status, criado_em")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (Number(params.id) === session.userId)
    return NextResponse.json({ error: "Você não pode remover seu próprio usuário." }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase.from("usuarios").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Usuário removido." });
}
