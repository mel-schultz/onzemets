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
    .from("consultas")
    .select("*, pacientes(nome), usuarios(nome, funcao)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  
  // Validar que os campos obrigatórios estão presentes
  if (body.paciente_id === undefined || body.profissional_id === undefined || !body.data || !body.hora) {
    return NextResponse.json({ error: "Campos obrigatórios: paciente_id, profissional_id, data, hora." }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("consultas")
    .update({
      paciente_id: body.paciente_id,
      profissional_id: body.profissional_id,
      data: body.data,
      hora: body.hora,
      observacoes: body.observacoes || ""
    })
    .eq("id", id)
    .select("*, pacientes(nome), usuarios(nome, funcao)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from("consultas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Consulta cancelada." });
}
