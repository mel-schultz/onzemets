import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

type Params = Promise<{ id: string }>;

export async function GET(_: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("evolucoes")
    .select("*, usuarios(nome)")
    .eq("paciente_id", id)
    .order("data", { ascending: false })
    .order("id", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const mapped = (data || []).map((e: Record<string, unknown>) => {
    const u = e.usuarios as { nome: string } | null;
    const { usuarios: _, ...rest } = e;
    return { ...rest, criado_por_nome: u?.nome ?? null };
  });
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const { titulo, texto, tipo, data } = await req.json();
  if (!titulo || !texto) return NextResponse.json({ error: "Título e texto obrigatórios." }, { status: 400 });
  const supabase = createServerClient();
  const { data: row, error } = await supabase
    .from("evolucoes")
    .insert({
      paciente_id: Number(id),
      titulo, texto,
      tipo: tipo || "clinica",
      data: data || new Date().toISOString().split("T")[0],
      criado_por: session.userId,
    })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(row, { status: 201 });
}
