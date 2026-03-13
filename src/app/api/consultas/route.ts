import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const data          = searchParams.get("data");
  const data_inicio   = searchParams.get("data_inicio");
  const data_fim      = searchParams.get("data_fim");
  const paciente_id   = searchParams.get("paciente_id");
  const profissional_id = searchParams.get("profissional_id");

  let query = supabase
    .from("consultas")
    .select(`
      *,
      pacientes ( nome ),
      usuarios  ( nome )
    `)
    .order("data")
    .order("hora");

  if (data)            query = query.eq("data", data);
  if (data_inicio)     query = query.gte("data", data_inicio);
  if (data_fim)        query = query.lte("data", data_fim);
  if (paciente_id)     query = query.eq("paciente_id", paciente_id);
  if (profissional_id) query = query.eq("profissional_id", profissional_id);

  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (rows || []).map((c: Record<string, unknown>) => {
    const pac  = c.pacientes as { nome: string } | null;
    const prof = c.usuarios  as { nome: string } | null;
    const { pacientes: _p, usuarios: _u, ...rest } = c;
    return { ...rest, paciente_nome: pac?.nome ?? "", profissional_nome: prof?.nome ?? "" };
  });

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json();
  const { paciente_id, profissional_id, data, hora } = body;
  if (!paciente_id || !profissional_id || !data || !hora)
    return NextResponse.json({ error: "Campos obrigatórios: paciente_id, profissional_id, data, hora." }, { status: 400 });

  const supabase = createServerClient();
  const { data: row, error } = await supabase
    .from("consultas")
    .insert({ paciente_id, profissional_id, data, hora, observacoes: body.observacoes || "" })
    .select(`*, pacientes(nome), usuarios(nome)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pac  = row.pacientes as { nome: string } | null;
  const prof = row.usuarios  as { nome: string } | null;
  const { pacientes: _p, usuarios: _u, ...rest } = row;
  return NextResponse.json({ ...rest, paciente_nome: pac?.nome ?? "", profissional_nome: prof?.nome ?? "" }, { status: 201 });
}
