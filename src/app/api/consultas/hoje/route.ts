import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";
import type { Consulta } from "@/types/database";

type ConsultaRow = Consulta & {
  pacientes: { nome: string } | null;
  usuarios:  { nome: string } | null;
};

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = createServerClient();
  const hoje = new Date().toISOString().split("T")[0];

  const { data: rows, error } = await supabase
    .from("consultas")
    .select("*, pacientes(nome), usuarios(nome)")
    .eq("data", hoje)
    .order("hora");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = ((rows ?? []) as ConsultaRow[]).map((c) => {
    const { pacientes, usuarios, ...rest } = c;
    return { ...rest, paciente_nome: pacientes?.nome ?? "", profissional_nome: usuarios?.nome ?? "" };
  });
  return NextResponse.json(mapped);
}
