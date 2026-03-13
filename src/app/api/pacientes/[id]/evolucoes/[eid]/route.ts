import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";
import type { Evolucao } from "@/types/database";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

type Params = Promise<{ id: string; eid: string }>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, eid } = await params;
  const { titulo, texto, tipo, data } = await req.json();
  const supabase = createServerClient();
  const { data: row, error } = await supabase
    .from("evolucoes")
    .update({ titulo, texto, tipo: tipo || "clinica", data })
    .eq("id", eid)
    .eq("paciente_id", id)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(row as Evolucao);
}

export async function DELETE(_: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, eid } = await params;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("evolucoes")
    .delete()
    .eq("id", eid)
    .eq("paciente_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Evolução removida." });
}
