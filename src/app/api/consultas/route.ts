import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";
import type { Consulta, ConsultaComNomes } from "@/types/database";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

type ConsultaRow = Consulta & {
  pacientes: { nome: string } | null;
  usuarios:  { nome: string; funcao: string } | null;
};

function mapConsulta(c: ConsultaRow): ConsultaComNomes {
  const { pacientes, usuarios, ...rest } = c;
  return { 
    ...rest, 
    paciente_nome: pacientes?.nome ?? "", 
    profissional_nome: usuarios?.nome ?? "",
    profissional_funcao: usuarios?.funcao ?? ""
  };
}

export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const data           = searchParams.get("data");
  const data_inicio    = searchParams.get("data_inicio");
  const data_fim       = searchParams.get("data_fim");
  const paciente_id    = searchParams.get("paciente_id");
  const profissional_id = searchParams.get("profissional_id");

  let query = supabase
    .from("consultas")
    .select("*, pacientes(nome), usuarios(nome, funcao)")
    .order("data").order("hora");

  if (data)             query = query.eq("data", data);
  if (data_inicio)      query = query.gte("data", data_inicio);
  if (data_fim)         query = query.lte("data", data_fim);
  if (paciente_id)      query = query.eq("paciente_id", paciente_id);
  if (profissional_id)  query = query.eq("profissional_id", profissional_id);

  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(((rows ?? []) as ConsultaRow[]).map(mapConsulta));
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
    .select("*, pacientes(nome), usuarios(nome, funcao)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapConsulta(row as ConsultaRow), { status: 201 });
}
