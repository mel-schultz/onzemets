import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

export async function PUT(req: NextRequest, { params }: { params: { id: string; eid: string } }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { titulo, texto, tipo, data } = await req.json();
  const supabase = createServerClient();
  const { data: row, error } = await supabase
    .from("evolucoes")
    .update({ titulo, texto, tipo: tipo || "clinica", data })
    .eq("id", params.eid)
    .eq("paciente_id", params.id)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(row);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; eid: string } }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const supabase = createServerClient();
  const { error } = await supabase
    .from("evolucoes")
    .delete()
    .eq("id", params.eid)
    .eq("paciente_id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Evolução removida." });
}
