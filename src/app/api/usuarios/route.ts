import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, funcao, status, criado_em")
    .order("nome");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { nome, email, senha, funcao, status } = await req.json();
  if (!nome || !email || !senha)
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });

  const supabase = createServerClient();
  const senha_hash = bcrypt.hashSync(senha, 10);
  const { data, error } = await supabase
    .from("usuarios")
    .insert({ nome, email, senha_hash, funcao: funcao || "Fisioterapeuta Cardiovascular", status: status || "ativo" })
    .select("id, nome, email, funcao, status, criado_em")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
